import { describe, it, expect, vi, beforeEach } from "vitest";
import { createRateLimiter } from "@/lib/rate-limit";

describe("createRateLimiter", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  it("allows requests within the limit", () => {
    const limiter = createRateLimiter(3, 60_000);
    const r1 = limiter.check("user-1");
    const r2 = limiter.check("user-1");
    const r3 = limiter.check("user-1");

    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);
    expect(r2.success).toBe(true);
    expect(r2.remaining).toBe(1);
    expect(r3.success).toBe(true);
    expect(r3.remaining).toBe(0);
  });

  it("blocks after exceeding the limit", () => {
    const limiter = createRateLimiter(2, 60_000);
    limiter.check("user-1");
    limiter.check("user-1");
    const blocked = limiter.check("user-1");

    expect(blocked.success).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.resetIn).toBeGreaterThan(0);
  });

  it("resets after the time window passes", () => {
    const limiter = createRateLimiter(1, 1000);
    limiter.check("user-1");

    // Should be blocked now
    expect(limiter.check("user-1").success).toBe(false);

    // Advance past the window
    vi.advanceTimersByTime(1001);

    // Should be allowed again
    const result = limiter.check("user-1");
    expect(result.success).toBe(true);
    expect(result.remaining).toBe(0);
  });

  it("tracks keys independently", () => {
    const limiter = createRateLimiter(1, 60_000);
    limiter.check("user-1");

    // user-1 is blocked, but user-2 should be fine
    expect(limiter.check("user-1").success).toBe(false);
    expect(limiter.check("user-2").success).toBe(true);
  });

  it("prunes expired entries on check", () => {
    const limiter = createRateLimiter(1, 500);
    limiter.check("old-user");

    vi.advanceTimersByTime(501);

    // After prune, old-user's entry should be gone
    // New check should succeed
    const result = limiter.check("old-user");
    expect(result.success).toBe(true);
  });
});
