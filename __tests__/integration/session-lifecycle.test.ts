import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createAdminSupabaseClient: vi.fn(),
}));

import { createAdminSupabaseClient } from '@/lib/supabase/server';
import {
  createSession,
  touchSession,
  revokeSession,
  revokeAllUserSessions,
  getActiveSessions,
} from '@/lib/session-manager';

describe('Session Manager', () => {
  const mockSingle = vi.fn().mockResolvedValue({ data: { id: 'sess-123' }, error: null });
  const mockSelect = vi.fn(() => ({ single: mockSingle }));
  const mockInsert = vi.fn(() => ({ select: mockSelect }));
  const mockUpdate = vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn().mockResolvedValue({ error: null }) })) }));
  const mockOrder = vi.fn(() => ({ limit: vi.fn().mockResolvedValue({ data: [] }) }));
  const mockSelectChain = vi.fn(() => ({ eq: vi.fn(() => ({ eq: vi.fn(() => ({ order: mockOrder })) })) }));
  const mockFrom = vi.fn((table: string) => {
    if (table === 'user_sessions') {
      return { insert: mockInsert, update: mockUpdate, select: mockSelectChain };
    }
    return {};
  });

  beforeEach(() => {
    vi.clearAllMocks();
    (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom,
    });
  });

  describe('createSession', () => {
    it('inserts a session and returns id', async () => {
      const id = await createSession({ userId: 'u1', deviceId: 'd1', ipAddress: '1.2.3.4' });
      expect(id).toBe('sess-123');
      expect(mockFrom).toHaveBeenCalledWith('user_sessions');
      expect(mockInsert).toHaveBeenCalledTimes(1);
    });

    it('throws when admin client is null', async () => {
      (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(null);
      await expect(
        createSession({ userId: 'u1', deviceId: 'd1', ipAddress: '1.2.3.4' })
      ).rejects.toThrow('Admin Supabase client not configured');
    });

    it('throws on DB error', async () => {
      mockSingle.mockResolvedValueOnce({ data: null, error: new Error('insert fail') });
      await expect(
        createSession({ userId: 'u1', deviceId: 'd1', ipAddress: '1.2.3.4' })
      ).rejects.toThrow();
    });
  });

  describe('touchSession', () => {
    it('updates last_active_at', async () => {
      await touchSession('sess-123');
      expect(mockFrom).toHaveBeenCalledWith('user_sessions');
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    it('returns silently when admin client is null', async () => {
      (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(null);
      await expect(touchSession('sess-123')).resolves.not.toThrow();
    });
  });

  describe('revokeSession', () => {
    it('updates status to revoked', async () => {
      await revokeSession('sess-123', 'admin-1', 'Suspicious activity');
      expect(mockFrom).toHaveBeenCalledWith('user_sessions');
      expect(mockUpdate).toHaveBeenCalledTimes(1);
      const updateArg = mockUpdate.mock.calls[0][0];
      expect(updateArg.status).toBe('revoked');
      expect(updateArg.revoked_by).toBe('admin-1');
      expect(updateArg.revoked_reason).toBe('Suspicious activity');
    });

    it('uses default reason', async () => {
      await revokeSession('sess-123', 'admin-1');
      const updateArg = mockUpdate.mock.calls[0][0];
      expect(updateArg.revoked_reason).toBe('Manual revocation');
    });

    it('returns silently when admin client is null', async () => {
      (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(null);
      await expect(revokeSession('sess-123', 'admin-1')).resolves.not.toThrow();
    });
  });

  describe('revokeAllUserSessions', () => {
    it('revokes all active sessions for user', async () => {
      await revokeAllUserSessions('u1', 'admin-1', 'Account compromised');
      expect(mockFrom).toHaveBeenCalledWith('user_sessions');
      expect(mockUpdate).toHaveBeenCalledTimes(1);
    });

    it('returns silently when admin client is null', async () => {
      (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(null);
      await expect(revokeAllUserSessions('u1', 'admin-1', 'reason')).resolves.not.toThrow();
    });
  });

  describe('getActiveSessions', () => {
    it('returns empty array when admin client is null', async () => {
      (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(null);
      const sessions = await getActiveSessions('u1');
      expect(sessions).toEqual([]);
    });
  });
});
