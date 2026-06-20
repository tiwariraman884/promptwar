import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { createRateLimiter, checkRateLimit } from "@/lib/rate-limit";
import { NextRequest } from "next/server";

/**
 * Load / integration tests for rate limiting.
 *
 * Simulates rapid requests and verifies:
 * - 429 is returned after exceeding the limit
 * - Standard rate-limit headers are present
 * - Retry-After header is included on 429s
 * - Requests succeed again after the window passes
 */

// Mock Redis as unavailable — use in-memory fallback
vi.mock("@/lib/redis", () => ({
  getRedis: () => null,
}));

function createMockRequest(
  ip: string = "1.2.3.4",
  url: string = "http://localhost:3000/api/test"
): NextRequest {
  const req = new NextRequest(url, {
    headers: {
      "x-forwarded-for": ip,
    },
  });
  return req;
}

describe("rate limit load test", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("returns 429 after exceeding the limit with correct headers", async () => {
    const limiter = createRateLimiter({
      max: 3,
      windowS: 60,
      keyPrefix: "load-test",
    });

    // First 3 requests should succeed
    for (let i = 0; i < 3; i++) {
      const req = createMockRequest("10.0.0.1");
      const result = await checkRateLimit(req, limiter, "test-user");
      expect(result).toBeNull(); // null = allowed
    }

    // 4th request should be rate limited
    const req = createMockRequest("10.0.0.1");
    const blocked = await checkRateLimit(req, limiter, "test-user");

    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);

    // Parse the JSON body
    const body = await blocked!.json();
    expect(body.error).toBe("Too many requests");
    expect(body.retryAfter).toBeGreaterThan(0);
    expect(body.success).toBe(false);

    // Check rate-limit headers
    expect(blocked!.headers.get("X-RateLimit-Limit")).toBe("3");
    expect(blocked!.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(blocked!.headers.get("X-RateLimit-Reset")).toBeTruthy();
    expect(blocked!.headers.get("Retry-After")).toBeTruthy();
    expect(Number(blocked!.headers.get("Retry-After"))).toBeGreaterThan(0);
  });

  it("resets and allows requests after the window passes", async () => {
    const limiter = createRateLimiter({
      max: 2,
      windowS: 10,
      keyPrefix: "load-reset",
    });

    // Exhaust the limit
    await checkRateLimit(createMockRequest(), limiter, "user-a");
    await checkRateLimit(createMockRequest(), limiter, "user-a");

    // Should be blocked
    const blocked = await checkRateLimit(
      createMockRequest(),
      limiter,
      "user-a"
    );
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);

    // Advance time past the full window
    vi.advanceTimersByTime(10_001);

    // Should be allowed again
    const allowed = await checkRateLimit(
      createMockRequest(),
      limiter,
      "user-a"
    );
    expect(allowed).toBeNull();
  });

  it("keys by IP when no userId is provided (anonymous)", async () => {
    const limiter = createRateLimiter({
      max: 2,
      windowS: 60,
      keyPrefix: "load-anon",
    });

    // Same IP, no userId
    await checkRateLimit(createMockRequest("192.168.1.1"), limiter);
    await checkRateLimit(createMockRequest("192.168.1.1"), limiter);

    // Same IP — should be blocked
    const blocked = await checkRateLimit(
      createMockRequest("192.168.1.1"),
      limiter
    );
    expect(blocked).not.toBeNull();
    expect(blocked!.status).toBe(429);

    // Different IP — should be allowed
    const allowed = await checkRateLimit(
      createMockRequest("192.168.1.2"),
      limiter
    );
    expect(allowed).toBeNull();
  });

  it("handles high burst of requests correctly", async () => {
    const limiter = createRateLimiter({
      max: 10,
      windowS: 60,
      keyPrefix: "load-burst",
    });

    let blockedCount = 0;
    let allowedCount = 0;

    // Fire 20 requests rapidly
    for (let i = 0; i < 20; i++) {
      const result = await checkRateLimit(
        createMockRequest(),
        limiter,
        "burst-user"
      );
      if (result === null) {
        allowedCount++;
      } else {
        blockedCount++;
      }
    }

    expect(allowedCount).toBe(10);
    expect(blockedCount).toBe(10);
  });
});
