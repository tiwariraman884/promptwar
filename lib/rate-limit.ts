/**
 * Production-grade rate limiter with Redis (Upstash) backend.
 *
 * Supports two algorithms:
 *   - "token_bucket" (default) — allows short bursts, smooth refill
 *   - "sliding_window" — strict enforcement, no boundary issues
 *
 * Falls back to in-memory Map when Redis is unavailable (local dev).
 * Fails open (allows requests) if Redis throws at runtime.
 *
 * All limits are configurable via environment variables.
 */

import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

/* ─── Types ─── */

export type RateLimitAlgorithm = "token_bucket" | "sliding_window";

export interface RateLimitConfig {
  /** Maximum requests allowed in the window. */
  max: number;
  /** Window duration in seconds. */
  windowS: number;
  /** Algorithm to use. Default: "token_bucket". */
  algorithm?: RateLimitAlgorithm;
  /** Prefix for Redis keys to namespace different limiters. */
  keyPrefix: string;
}

export interface RateLimitResult {
  success: boolean;
  /** Requests remaining in the current window. */
  remaining: number;
  /** Maximum requests allowed (the configured limit). */
  limit: number;
  /** Unix timestamp (seconds) when the window resets. */
  resetAt: number;
  /** Seconds until the window resets. */
  retryAfterS: number;
}

/* ─── Env-driven config helper ─── */

function envInt(name: string, fallback: number): number {
  const v = process.env[name];
  if (v === undefined || v === "") return fallback;
  const n = parseInt(v, 10);
  return Number.isFinite(n) ? n : fallback;
}

/* ─── Lua Scripts ─── */

/**
 * Token Bucket — atomic Lua script.
 *
 * Stored as a Redis hash with fields:
 *   - tokens  (remaining tokens, float)
 *   - last_ms (last refill timestamp in ms)
 *
 * On each request we refill proportionally to elapsed time, then decrement.
 * TTL is set to windowS to auto-clean expired keys.
 *
 * KEYS[1] = rate limit key
 * ARGV[1] = max tokens (bucket capacity)
 * ARGV[2] = refill rate (tokens per millisecond = max / (windowS * 1000))
 * ARGV[3] = current time in ms
 * ARGV[4] = TTL in seconds
 *
 * Returns: [allowed (0/1), remaining tokens (int), reset timestamp ms]
 */
const TOKEN_BUCKET_SCRIPT = `
local key = KEYS[1]
local capacity = tonumber(ARGV[1])
local refill_rate = tonumber(ARGV[2])
local now_ms = tonumber(ARGV[3])
local ttl_s = tonumber(ARGV[4])

local data = redis.call('HMGET', key, 'tokens', 'last_ms')
local tokens = tonumber(data[1])
local last_ms = tonumber(data[2])

if tokens == nil then
  tokens = capacity
  last_ms = now_ms
end

-- Refill tokens based on elapsed time
local elapsed = math.max(0, now_ms - last_ms)
tokens = math.min(capacity, tokens + elapsed * refill_rate)
last_ms = now_ms

-- Try to consume one token
local allowed = 0
if tokens >= 1 then
  tokens = tokens - 1
  allowed = 1
end

-- Persist
redis.call('HSET', key, 'tokens', tostring(tokens), 'last_ms', tostring(last_ms))
redis.call('EXPIRE', key, ttl_s)

-- Calculate reset time: time until bucket is full again
local deficit = capacity - tokens
local refill_ms = 0
if refill_rate > 0 and deficit > 0 then
  refill_ms = deficit / refill_rate
end
local reset_ms = now_ms + refill_ms

return {allowed, math.floor(tokens), math.floor(reset_ms)}
`;

/**
 * Sliding Window — atomic Lua script.
 *
 * Uses a sorted set where score = request timestamp (ms).
 * On each request we remove expired entries, count remaining, and add if allowed.
 *
 * KEYS[1] = rate limit key
 * ARGV[1] = max requests
 * ARGV[2] = window in ms
 * ARGV[3] = current time in ms
 * ARGV[4] = TTL in seconds
 * ARGV[5] = unique member ID (to avoid deduplication in the set)
 *
 * Returns: [allowed (0/1), remaining requests (int), reset timestamp ms]
 */
const SLIDING_WINDOW_SCRIPT = `
local key = KEYS[1]
local max_req = tonumber(ARGV[1])
local window_ms = tonumber(ARGV[2])
local now_ms = tonumber(ARGV[3])
local ttl_s = tonumber(ARGV[4])
local member = ARGV[5]

-- Remove entries outside the window
local cutoff = now_ms - window_ms
redis.call('ZREMRANGEBYSCORE', key, '-inf', cutoff)

-- Count current entries
local count = redis.call('ZCARD', key)

local allowed = 0
if count < max_req then
  redis.call('ZADD', key, now_ms, member)
  allowed = 1
  count = count + 1
end

redis.call('EXPIRE', key, ttl_s)

local remaining = math.max(0, max_req - count)
-- Reset time = oldest entry timestamp + window
local oldest = redis.call('ZRANGE', key, 0, 0, 'WITHSCORES')
local reset_ms = now_ms + window_ms
if oldest and #oldest >= 2 then
  reset_ms = tonumber(oldest[2]) + window_ms
end

return {allowed, remaining, math.floor(reset_ms)}
`;

/* ─── In-Memory Fallback ─── */

interface MemoryEntry {
  tokens: number;
  lastRefillMs: number;
}

const memoryStores = new Map<string, Map<string, MemoryEntry>>();

function getMemoryStore(prefix: string): Map<string, MemoryEntry> {
  let store = memoryStores.get(prefix);
  if (!store) {
    store = new Map();
    memoryStores.set(prefix, store);
  }
  return store;
}

function checkMemory(
  key: string,
  config: RateLimitConfig
): RateLimitResult {
  const store = getMemoryStore(config.keyPrefix);
  const now = Date.now();
  const windowMs = config.windowS * 1000;
  const refillRate = config.max / windowMs; // tokens per ms

  let entry = store.get(key);

  if (!entry) {
    entry = { tokens: config.max, lastRefillMs: now };
    store.set(key, entry);
  }

  // Refill
  const elapsed = Math.max(0, now - entry.lastRefillMs);
  entry.tokens = Math.min(config.max, entry.tokens + elapsed * refillRate);
  entry.lastRefillMs = now;

  const allowed = entry.tokens >= 1;
  if (allowed) {
    entry.tokens -= 1;
  }

  const deficit = config.max - entry.tokens;
  const refillMs = refillRate > 0 && deficit > 0 ? deficit / refillRate : 0;
  const resetAt = Math.floor((now + refillMs) / 1000);

  // Prune old entries periodically (every 100 checks)
  if (Math.random() < 0.01) {
    const cutoff = now - windowMs * 2;
    store.forEach((e, k) => {
      if (e.lastRefillMs < cutoff) store.delete(k);
    });
  }

  return {
    success: allowed,
    remaining: Math.max(0, Math.floor(entry.tokens)),
    limit: config.max,
    resetAt,
    retryAfterS: allowed ? 0 : Math.max(1, Math.ceil(refillMs / 1000)),
  };
}

/* ─── Core Factory ─── */

let requestCounter = 0;

export function createRateLimiter(config: RateLimitConfig) {
  const algorithm = config.algorithm ?? "token_bucket";
  const windowMs = config.windowS * 1000;
  const refillRate = config.max / windowMs; // tokens per ms
  const ttlS = config.windowS * 2; // Redis key TTL — 2× window for safety

  async function check(key: string): Promise<RateLimitResult> {
    const redis = getRedis();

    if (!redis) {
      // No Redis configured — use in-memory fallback
      return checkMemory(key, config);
    }

    const redisKey =
      algorithm === "token_bucket"
        ? `rl:tb:${config.keyPrefix}:${key}`
        : `rl:sw:${config.keyPrefix}:${key}`;
    const nowMs = Date.now();

    try {
      if (algorithm === "token_bucket") {
        const result = (await redis.eval(
          TOKEN_BUCKET_SCRIPT,
          [redisKey],
          [
            config.max.toString(),
            refillRate.toString(),
            nowMs.toString(),
            ttlS.toString(),
          ]
        )) as [number, number, number];

        const [allowed, remaining, resetMs] = result;
        const resetAt = Math.floor(resetMs / 1000);
        const retryAfterS =
          allowed === 1 ? 0 : Math.max(1, Math.ceil((resetMs - nowMs) / 1000));

        return {
          success: allowed === 1,
          remaining: Math.max(0, remaining),
          limit: config.max,
          resetAt,
          retryAfterS,
        };
      } else {
        // Sliding window
        requestCounter += 1;
        const memberId = `${nowMs}:${requestCounter}:${Math.random()
          .toString(36)
          .slice(2, 8)}`;

        const result = (await redis.eval(
          SLIDING_WINDOW_SCRIPT,
          [redisKey],
          [
            config.max.toString(),
            windowMs.toString(),
            nowMs.toString(),
            ttlS.toString(),
            memberId,
          ]
        )) as [number, number, number];

        const [allowed, remaining, resetMs] = result;
        const resetAt = Math.floor(resetMs / 1000);
        const retryAfterS =
          allowed === 1 ? 0 : Math.max(1, Math.ceil((resetMs - nowMs) / 1000));

        return {
          success: allowed === 1,
          remaining: Math.max(0, remaining),
          limit: config.max,
          resetAt,
          retryAfterS,
        };
      }
    } catch (err) {
      // FAIL OPEN — Redis error should not take down the API
      console.warn(
        `[rate-limit] Redis error for key "${redisKey}", failing open:`,
        err instanceof Error ? err.message : err
      );
      return {
        success: true,
        remaining: config.max,
        limit: config.max,
        resetAt: Math.floor(nowMs / 1000) + config.windowS,
        retryAfterS: 0,
      };
    }
  }

  return { check, config };
}

/* ─── Pre-built Limiters (env-configurable) ─── */

/** Anonymous / unauthenticated — 20 req / 60s per IP */
export const anonLimiter = createRateLimiter({
  max: envInt("RATE_LIMIT_ANON_MAX", 20),
  windowS: envInt("RATE_LIMIT_ANON_WINDOW_S", 60),
  keyPrefix: "anon",
});

/** Authenticated users — 100 req / 60s per user ID */
export const authLimiter = createRateLimiter({
  max: envInt("RATE_LIMIT_AUTH_MAX", 100),
  windowS: envInt("RATE_LIMIT_AUTH_WINDOW_S", 60),
  keyPrefix: "auth",
});

/** AI endpoints — 10 req / 60s per user ID */
export const aiLimiter = createRateLimiter({
  max: envInt("RATE_LIMIT_AI_MAX", 10),
  windowS: envInt("RATE_LIMIT_AI_WINDOW_S", 60),
  keyPrefix: "ai",
});

/** Sensitive endpoints (login/signup/password reset) — 5 req / 15 min per IP+identifier */
export const sensitiveLimiter = createRateLimiter({
  max: envInt("RATE_LIMIT_SENSITIVE_MAX", 5),
  windowS: envInt("RATE_LIMIT_SENSITIVE_WINDOW_S", 900),
  algorithm: "sliding_window",
  keyPrefix: "sensitive",
});

/* ─── Request Key Extraction ─── */

/**
 * Derive a rate-limit key from the incoming request.
 * Uses `x-forwarded-for` (Vercel/proxy), then `x-real-ip`, then fallback.
 */
export function getClientIp(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "unknown-ip"
  );
}

/* ─── Convenience Middleware Helper ─── */

/**
 * Check the rate limit and return a 429 Response if exceeded.
 * Returns `null` when the request is within limits (attach headers yourself
 * or rely on the route returning its own response).
 *
 * @param request  - The incoming NextRequest
 * @param limiter  - A limiter created by createRateLimiter()
 * @param userId   - If provided, key by userId (authenticated). Otherwise key by IP.
 */
export async function checkRateLimit(
  request: NextRequest,
  limiter: ReturnType<typeof createRateLimiter>,
  userId?: string
): Promise<NextResponse | null> {
  const key = userId ?? getClientIp(request);
  const result = await limiter.check(key);

  // Always prepare rate-limit headers
  const headers: Record<string, string> = {
    "X-RateLimit-Limit": result.limit.toString(),
    "X-RateLimit-Remaining": result.remaining.toString(),
    "X-RateLimit-Reset": result.resetAt.toString(),
  };

  if (!result.success) {
    headers["Retry-After"] = result.retryAfterS.toString();

    return NextResponse.json(
      {
        success: false,
        data: null,
        error: "Too many requests",
        retryAfter: result.retryAfterS,
      },
      { status: 429, headers }
    );
  }

  // Store headers on the request for downstream use.
  // Next.js API routes can read these when building their response.
  request.headers.set("x-ratelimit-limit", result.limit.toString());
  request.headers.set("x-ratelimit-remaining", result.remaining.toString());
  request.headers.set("x-ratelimit-reset", result.resetAt.toString());

  return null;
}

/* ─── Legacy Exports (backward compatibility) ─── */

// Keep old names as aliases so any un-updated imports still work
export const aiRateLimit = aiLimiter;
export const authRateLimit = sensitiveLimiter;
export const generalRateLimit = authLimiter;
export const rateLimitKey = getClientIp;
