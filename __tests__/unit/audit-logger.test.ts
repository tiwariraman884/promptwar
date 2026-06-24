import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock createAdminSupabaseClient
vi.mock('@/lib/supabase/server', () => ({
  createAdminSupabaseClient: vi.fn(),
}));

import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { writeAuditLog } from '@/lib/audit-logger';

describe('writeAuditLog', () => {
  const mockInsert = vi.fn().mockResolvedValue({ error: null });
  const mockFrom = vi.fn(() => ({ insert: mockInsert }));

  beforeEach(() => {
    vi.clearAllMocks();
    (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom,
    });
  });

  it('inserts audit log with correct fields', async () => {
    await writeAuditLog({
      actorId: 'user-1',
      actorEmail: 'test@test.com',
      actorRole: 'admin',
      action: 'AUTH_LOGIN_SUCCESS',
      severity: 'info',
      description: 'User logged in',
    });

    expect(mockFrom).toHaveBeenCalledWith('audit_logs');
    expect(mockInsert).toHaveBeenCalledTimes(1);
    const inserted = mockInsert.mock.calls[0][0];
    expect(inserted.actor_id).toBe('user-1');
    expect(inserted.actor_email).toBe('test@test.com');
    expect(inserted.action).toBe('AUTH_LOGIN_SUCCESS');
    expect(inserted.severity).toBe('info');
  });

  it('never throws on Supabase error', async () => {
    mockInsert.mockRejectedValueOnce(new Error('DB down'));
    await expect(
      writeAuditLog({
        actorId: 'user-1',
        actorRole: 'user',
        action: 'AUTH_LOGOUT',
        severity: 'info',
        description: 'logout',
      })
    ).resolves.not.toThrow();
  });

  it('returns silently when admin client is null', async () => {
    (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(null);
    await expect(
      writeAuditLog({
        actorId: 'user-1',
        actorRole: 'user',
        action: 'AUTH_LOGOUT',
        severity: 'info',
        description: 'logout',
      })
    ).resolves.not.toThrow();
    expect(mockFrom).not.toHaveBeenCalled();
  });

  it('sanitizes metadata — strips password/token/secret keys', async () => {
    await writeAuditLog({
      actorId: 'user-1',
      actorRole: 'admin',
      action: 'DATA_PROFILE_UPDATED',
      severity: 'info',
      description: 'Profile updated',
      metadata: {
        name: 'John',
        password: 'secret123',
        api_token: 'tok_abc',
        access_key: 'key123',
        session_token: 'sess_xyz',
        email: 'john@test.com',
      },
    });

    const inserted = mockInsert.mock.calls[0][0];
    const meta = inserted.metadata;
    expect(meta).toHaveProperty('name', 'John');
    expect(meta).toHaveProperty('email', 'john@test.com');
    expect(meta).not.toHaveProperty('password');
    expect(meta).not.toHaveProperty('api_token');
    expect(meta).not.toHaveProperty('access_key');
    expect(meta).not.toHaveProperty('session_token');
  });

  it('uses empty object when no metadata provided', async () => {
    await writeAuditLog({
      actorId: 'user-1',
      actorRole: 'user',
      action: 'AUTH_LOGOUT',
      severity: 'info',
      description: 'logout',
    });

    const inserted = mockInsert.mock.calls[0][0];
    expect(inserted.metadata).toEqual({});
  });

  it('defaults ip_address to "unknown" when not provided', async () => {
    await writeAuditLog({
      actorId: 'user-1',
      actorRole: 'user',
      action: 'AUTH_LOGOUT',
      severity: 'info',
      description: 'logout',
    });

    const inserted = mockInsert.mock.calls[0][0];
    expect(inserted.ip_address).toBe('unknown');
  });
});
