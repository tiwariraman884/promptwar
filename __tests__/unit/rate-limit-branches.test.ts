import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock NextRequest / NextResponse
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body: unknown, opts?: { status?: number; headers?: Record<string, string> }) => ({
      body, status: opts?.status ?? 200, headers: opts?.headers ?? {},
    })),
  },
}));

// Mock Redis to be null (triggers in-memory fallback)
vi.mock('@/lib/redis', () => ({
  getRedis: vi.fn(() => null),
}));

import { createRateLimiter, getClientIp, checkRateLimit } from '@/lib/rate-limit';

describe('createRateLimiter (in-memory fallback)', () => {
  it('allows requests within limit', async () => {
    const limiter = createRateLimiter({ max: 3, windowS: 60, keyPrefix: 'test' });
    const r1 = await limiter.check('user-1');
    expect(r1.success).toBe(true);
    expect(r1.remaining).toBe(2);
  });

  it('blocks requests exceeding limit', async () => {
    const limiter = createRateLimiter({ max: 2, windowS: 60, keyPrefix: 'block' });
    await limiter.check('user-x');
    await limiter.check('user-x');
    const r3 = await limiter.check('user-x');
    expect(r3.success).toBe(false);
    expect(r3.remaining).toBe(0);
    expect(r3.retryAfterS).toBeGreaterThan(0);
  });

  it('uses sliding_window algorithm', async () => {
    const limiter = createRateLimiter({ max: 5, windowS: 60, keyPrefix: 'sw', algorithm: 'sliding_window' });
    const r1 = await limiter.check('sw-user');
    expect(r1.success).toBe(true);
    expect(r1.limit).toBe(5);
  });

  it('separate keys do not interfere', async () => {
    const limiter = createRateLimiter({ max: 1, windowS: 60, keyPrefix: 'iso' });
    await limiter.check('alice');
    const rAlice = await limiter.check('alice');
    expect(rAlice.success).toBe(false);

    const rBob = await limiter.check('bob');
    expect(rBob.success).toBe(true);
  });

  it('config is accessible', () => {
    const limiter = createRateLimiter({ max: 10, windowS: 30, keyPrefix: 'cfg' });
    expect(limiter.config.max).toBe(10);
    expect(limiter.config.windowS).toBe(30);
    expect(limiter.config.keyPrefix).toBe('cfg');
  });
});

describe('getClientIp', () => {
  it('reads x-forwarded-for header', () => {
    const req = { headers: { get: vi.fn((h: string) => h === 'x-forwarded-for' ? '1.2.3.4, 5.6.7.8' : null) } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ip = getClientIp(req as any);
    expect(ip).toBe('1.2.3.4');
  });

  it('falls back to x-real-ip', () => {
    const req = { headers: { get: vi.fn((h: string) => h === 'x-real-ip' ? '9.8.7.6' : null) } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ip = getClientIp(req as any);
    expect(ip).toBe('9.8.7.6');
  });

  it('returns unknown-ip when no headers', () => {
    const req = { headers: { get: vi.fn(() => null) } };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const ip = getClientIp(req as any);
    expect(ip).toBe('unknown-ip');
  });
});

describe('checkRateLimit', () => {
  it('returns null when within limit', async () => {
    const limiter = createRateLimiter({ max: 10, windowS: 60, keyPrefix: 'rl' });
    const req = {
      headers: {
        get: vi.fn(() => '1.1.1.1'),
        set: vi.fn(),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await checkRateLimit(req as any, limiter);
    expect(result).toBeNull();
  });

  it('returns 429 response when limit exceeded', async () => {
    const limiter = createRateLimiter({ max: 1, windowS: 60, keyPrefix: 'rl429' });
    const req = {
      headers: {
        get: vi.fn(() => '2.2.2.2'),
        set: vi.fn(),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    await checkRateLimit(req as any, limiter); // first call passes
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await checkRateLimit(req as any, limiter); // second call blocked
    expect(result).not.toBeNull();
    expect(result?.status).toBe(429);
  });

  it('uses userId when provided', async () => {
    const limiter = createRateLimiter({ max: 10, windowS: 60, keyPrefix: 'auth' });
    const req = {
      headers: {
        get: vi.fn(() => null),
        set: vi.fn(),
      },
    };
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const result = await checkRateLimit(req as any, limiter, 'user-123');
    expect(result).toBeNull();
  });
});
