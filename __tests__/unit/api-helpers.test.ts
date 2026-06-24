import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Next.js response
vi.mock('next/server', () => ({
  NextResponse: {
    json: vi.fn((body: unknown, opts?: { status?: number }) => ({
      body,
      status: opts?.status ?? 200,
      json: () => Promise.resolve(body),
    })),
  },
}));

import { apiSuccess, apiError, apiPaginated } from '@/lib/api';

describe('apiSuccess', () => {
  it('returns success=true with data', () => {
    const result = apiSuccess({ name: 'test' });
    expect(result.body).toEqual({
      success: true,
      data: { name: 'test' },
      error: null,
    });
  });

  it('defaults to status 200', () => {
    const result = apiSuccess('ok');
    expect(result.status).toBe(200);
  });

  it('accepts custom status', () => {
    const result = apiSuccess('created', 201);
    expect(result.status).toBe(201);
  });
});

describe('apiError', () => {
  it('returns success=false with error message', () => {
    const result = apiError('Not found');
    expect(result.body).toEqual({
      success: false,
      data: null,
      error: 'Not found',
    });
  });

  it('defaults to status 400', () => {
    const result = apiError('Bad request');
    expect(result.status).toBe(400);
  });

  it('accepts custom status', () => {
    const result = apiError('Unauthorized', 401);
    expect(result.status).toBe(401);
  });
});

describe('apiPaginated', () => {
  it('returns data with pagination', () => {
    const result = apiPaginated([1, 2, 3], { page: 1, limit: 10, total: 25 });
    expect(result.body).toEqual({
      success: true,
      data: [1, 2, 3],
      error: null,
      pagination: {
        page: 1,
        limit: 10,
        total: 25,
        totalPages: 3,
      },
    });
  });

  it('calculates totalPages correctly', () => {
    const result = apiPaginated([], { page: 1, limit: 5, total: 12 });
    expect((result.body as unknown as Record<string, unknown>).pagination).toEqual({ page: 1, limit: 5, total: 12, totalPages: 3 }); // ceil(12/5) = 3
  });

  it('handles zero total', () => {
    const result = apiPaginated([], { page: 1, limit: 10, total: 0 });
    expect((result.body as unknown as Record<string, unknown>).pagination).toEqual({ page: 1, limit: 10, total: 0, totalPages: 0 });
  });

  it('handles exact page boundary', () => {
    const result = apiPaginated([], { page: 1, limit: 10, total: 30 });
    expect((result.body as unknown as Record<string, unknown>).pagination).toEqual({ page: 1, limit: 10, total: 30, totalPages: 3 });
  });
});
