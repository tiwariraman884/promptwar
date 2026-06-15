/**
 * In-memory sliding-window rate limiter compatible with Vercel Serverless.
 *
 * Each limiter instance maintains a Map of client keys → request counts.
 * The map is pruned on every check to avoid memory leaks.
 *
 * NOTE: In a multi-region or multi-instance deployment the counters are
 * per-instance. For production scale, replace with Upstash Redis.
 */

import type { NextRequest } from "next/server";
import { apiError } from "@/lib/api";

/* ─── Types ─── */

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

interface RateLimitResult {
  success: boolean;
  remaining: number;
  resetIn: number;
}

/* ─── Factory ─── */

export function createRateLimiter(maxRequests: number, windowMs: number) {
  const store = new Map<string, RateLimitEntry>();

  /** Prune expired entries to prevent unbounded growth. */
  function prune() {
    const now = Date.now();
    for (const [key, entry] of store) {
      if (now >= entry.resetTime) store.delete(key);
    }
  }

  /** Check whether `key` is within the allowed limit. */
  function check(key: string): RateLimitResult {
    prune();
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now >= entry.resetTime) {
      store.set(key, { count: 1, resetTime: now + windowMs });
      return { success: true, remaining: maxRequests - 1, resetIn: windowMs };
    }

    entry.count += 1;

    if (entry.count > maxRequests) {
      return {
        success: false,
        remaining: 0,
        resetIn: entry.resetTime - now,
      };
    }

    return {
      success: true,
      remaining: maxRequests - entry.count,
      resetIn: entry.resetTime - now,
    };
  }

  return { check };
}

/* ─── Pre-built limiters ─── */

/** AI routes — 10 requests per 60 s */
export const aiRateLimit = createRateLimiter(10, 60_000);

/** Auth routes — 5 attempts per 60 s */
export const authRateLimit = createRateLimiter(5, 60_000);

/** General API routes — 60 requests per 60 s */
export const generalRateLimit = createRateLimiter(60, 60_000);

/* ─── Helpers ─── */

/**
 * Derive a rate-limit key from the incoming request.
 * Uses `x-forwarded-for` (Vercel), then `x-real-ip`, then a fallback.
 */
export function rateLimitKey(request: NextRequest): string {
  return (
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ??
    request.headers.get("x-real-ip") ??
    "anonymous"
  );
}

/**
 * Convenience: check the rate limit and return a 429 Response if exceeded.
 * Returns `null` when the request is within limits.
 */
export function checkRateLimit(
  request: NextRequest,
  limiter: ReturnType<typeof createRateLimiter>
) {
  const key = rateLimitKey(request);
  const result = limiter.check(key);

  if (!result.success) {
    return apiError(
      `Rate limit exceeded. Try again in ${Math.ceil(result.resetIn / 1000)}s.`,
      429
    );
  }

  return null;
}
