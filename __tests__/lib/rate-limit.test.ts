import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

/**
 * Tests for the rate limiter.
 *
 * These test the in-memory fallback path (no Redis configured),
 * which uses the same token bucket algorithm as the Redis path.
 */

// Ensure Redis is not available during tests
vi.mock("@/lib/redis", () => ({
  getRedis: () => null,
}));

describe("createRateLimiter (in-memory token bucket)", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("allows requests within the limit", async () => {
    const limiter = createRateLimiter({
      max: 3,
      windowS: 60,
      keyPrefix: "test",
    });

    const r1 = await limiter.check("user-1");
    const r2 = await limiter.check("user-1");
    const r3 = await limiter.check("user-1");

    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r1.limit).toBe(3);

    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);

    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks after exceeding the limit", async () => {
    const limiter = createRateLimiter({
      max: 2,
      windowS: 60,
      keyPrefix: "test-block",
    });

    await limiter.check("user-1");
    await limiter.check("user-1");
    const blocked = await limiter.check("user-1");

    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterS).toBeGreaterThan(0);
  });

  it("refills tokens over time (token bucket behavior)", async () => {
    const limiter = createRateLimiter({
      max: 2,
      windowS: 10, // 2 tokens per 10s = 1 token per 5s
      keyPrefix: "test-refill",
    });

    // Use both tokens
    await limiter.check("user-1");
    await limiter.check("user-1");
    expect((await limiter.check("user-1")).success).toBe(false);

    // Advance 5 seconds — should refill 1 token
    vi.advanceTimersByTime(5000);

    const result = await limiter.check("user-1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);

    // Still blocked (only 1 token refilled, already used)
    expect((await limiter.check("user-1")).success).toBe(false);
  });

  it("fully resets after the full window passes", async () => {
    const limiter = createRateLimiter({
      max: 1,
      windowS: 1,
      keyPrefix: "test-reset",
    });

    await limiter.check("user-1");
    expect((await limiter.check("user-1")).success).toBe(false);

    // Advance past the full window
    vi.advanceTimersByTime(1001);

    const result = await limiter.check("user-1");
    expect(result.success).toBe(true);
  });

  it("tracks keys independently", async () => {
    const limiter = createRateLimiter({
      max: 1,
      windowS: 60,
      keyPrefix: "test-keys",
    });

    await limiter.check("user-1");

    // user-1 is blocked, but user-2 should be fine
    expect((await limiter.check("user-1")).success).toBe(false);
    expect((await limiter.check("user-2")).success).toBe(true);
  });

  it("returns correct rate-limit metadata", async () => {
    const limiter = createRateLimiter({
      max: 5,
      windowS: 60,
      keyPrefix: "test-meta",
    });

    const result = await limiter.check("user-1");

    expect(result.limit).toBe(5);
    expect(result.remaining).toBe(4);
    expect(result.resetAt).toBeGreaterThan(0);
    expect(result.retryAfterS).toBe(0); // Not rate limited
  });

  it("returns retryAfterS > 0 when rate limited", async () => {
    const limiter = createRateLimiter({
      max: 1,
      windowS: 30,
      keyPrefix: "test-retry",
    });

    await limiter.check("user-1");
    const blocked = await limiter.check("user-1");

    expect(blocked.success).toBe(false);
    expect(blocked.retryAfterS).toBeGreaterThanOrEqual(1);
    expect(blocked.retryAfterS).toBeLessThanOrEqual(30);
  });

  it("supports different algorithms via config", () => {
    // Just verifies that creation doesn't throw
    const tb = createRateLimiter({
      max: 10,
      windowS: 60,
      algorithm: "token_bucket",
      keyPrefix: "test-tb",
    });
    const sw = createRateLimiter({
      max: 10,
      windowS: 60,
      algorithm: "sliding_window",
      keyPrefix: "test-sw",
    });

    expect(tb.config.algorithm).toBe("token_bucket");
    expect(sw.config.algorithm).toBe("sliding_window");
  });

  it("exposes config on the limiter for inspection", () => {
    const limiter = createRateLimiter({
      max: 42,
      windowS: 120,
      keyPrefix: "test-cfg",
    });

    expect(limiter.config.max).toBe(42);
    expect(limiter.config.windowS).toBe(120);
    expect(limiter.config.keyPrefix).toBe("test-cfg");
  });
});

describe("pre-built limiters", () => {
  it("exports all tier limiters", async () => {
    const { anonLimiter, authLimiter, aiLimiter, sensitiveLimiter } =
      await import("@/lib/rate-limit");

    expect(anonLimiter).toBeDefined();
    expect(anonLimiter.config.keyPrefix).toBe("anon");

    expect(authLimiter).toBeDefined();
    expect(authLimiter.config.keyPrefix).toBe("auth");

    expect(aiLimiter).toBeDefined();
    expect(aiLimiter.config.keyPrefix).toBe("ai");

    expect(sensitiveLimiter).toBeDefined();
    expect(sensitiveLimiter.config.keyPrefix).toBe("sensitive");
    expect(sensitiveLimiter.config.algorithm).toBe("sliding_window");
  });

  it("exports legacy aliases for backward compatibility", async () => {
    const {
      aiRateLimit,
      authRateLimit,
      generalRateLimit,
      rateLimitKey,
    } = await import("@/lib/rate-limit");

    expect(aiRateLimit).toBeDefined();
    expect(authRateLimit).toBeDefined();
    expect(generalRateLimit).toBeDefined();
    expect(rateLimitKey).toBeTypeOf("function");
  });
});
