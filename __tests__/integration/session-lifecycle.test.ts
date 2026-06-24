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
      const updateArg = (mockUpdate.mock.calls as unknown as [Record<string, unknown>][])[0][0];
      expect(updateArg.status).toBe('revoked');
      expect(updateArg.revoked_by).toBe('admin-1');
      expect(updateArg.revoked_reason).toBe('Suspicious activity');
    });

    it('uses default reason', async () => {
      await revokeSession('sess-123', 'admin-1');
      const updateArg = (mockUpdate.mock.calls as unknown as [Record<string, unknown>][])[0][0];
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

    it('maps session data with device info', async () => {
      const mockData = [{
        id: 's1', user_id: 'u1', device_id: 'd1', ip_address: '1.2.3.4',
        status: 'active', created_at: '2024-01-01', last_active_at: '2024-01-02',
        expires_at: '2024-02-01', revoked_at: null, revoked_by: null, revoked_reason: null,
        user_devices: {
          id: 'd1', device_type: 'mobile', os: 'Android', browser: 'Chrome',
          ip_address: '1.2.3.4', is_trusted: true, trust_label: 'My Phone',
          last_seen_at: '2024-01-02', fingerprint: 'abc123',
        },
      }];
      const mockLimit = vi.fn().mockResolvedValue({ data: mockData });
      const mockOrderChain = vi.fn(() => ({ limit: mockLimit }));
      const mockEq2 = vi.fn(() => ({ order: mockOrderChain }));
      const mockEq1 = vi.fn(() => ({ eq: mockEq2 }));
      const mockSelChain = vi.fn(() => ({ eq: mockEq1 }));
      (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelChain })),
      });

      const sessions = await getActiveSessions('u1');
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('s1');
      expect(sessions[0].deviceInfo).toBeTruthy();
      expect(sessions[0].deviceInfo?.deviceType).toBe('mobile');
      expect(sessions[0].deviceInfo?.isTrusted).toBe(true);
      expect(sessions[0].deviceInfo?.trustLabel).toBe('My Phone');
    });

    it('maps session data without device info (null user_devices)', async () => {
      const mockData = [{
        id: 's2', user_id: 'u1', device_id: 'd2', ip_address: '5.6.7.8',
        status: 'active', created_at: '2024-01-01', last_active_at: '2024-01-03',
        expires_at: '2024-02-01', revoked_at: null, revoked_by: null, revoked_reason: null,
        user_devices: null,
      }];
      const mockLimit = vi.fn().mockResolvedValue({ data: mockData });
      const mockOrderChain = vi.fn(() => ({ limit: mockLimit }));
      const mockEq2 = vi.fn(() => ({ order: mockOrderChain }));
      const mockEq1 = vi.fn(() => ({ eq: mockEq2 }));
      const mockSelChain = vi.fn(() => ({ eq: mockEq1 }));
      (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelChain })),
      });

      const sessions = await getActiveSessions('u1');
      expect(sessions).toHaveLength(1);
      expect(sessions[0].deviceInfo).toBeUndefined();
    });

    it('returns empty array when data is null', async () => {
      const mockLimit = vi.fn().mockResolvedValue({ data: null });
      const mockOrderChain = vi.fn(() => ({ limit: mockLimit }));
      const mockEq2 = vi.fn(() => ({ order: mockOrderChain }));
      const mockEq1 = vi.fn(() => ({ eq: mockEq2 }));
      const mockSelChain = vi.fn(() => ({ eq: mockEq1 }));
      (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelChain })),
      });

      const sessions = await getActiveSessions('u1');
      expect(sessions).toEqual([]);
    });

    it('handles device with missing optional fields', async () => {
      const mockData = [{
        id: 's3', user_id: 'u1', device_id: 'd3', ip_address: '1.1.1.1',
        status: 'active', created_at: '2024-01-01', last_active_at: '2024-01-04',
        expires_at: '2024-02-01', revoked_at: null, revoked_by: null, revoked_reason: null,
        user_devices: {
          id: null, device_type: null, os: null, browser: null,
          ip_address: null, is_trusted: false, trust_label: null,
          last_seen_at: null, fingerprint: null,
        },
      }];
      const mockLimit = vi.fn().mockResolvedValue({ data: mockData });
      const mockOrderChain = vi.fn(() => ({ limit: mockLimit }));
      const mockEq2 = vi.fn(() => ({ order: mockOrderChain }));
      const mockEq1 = vi.fn(() => ({ eq: mockEq2 }));
      const mockSelChain = vi.fn(() => ({ eq: mockEq1 }));
      (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
        from: vi.fn(() => ({ select: mockSelChain })),
      });

      const sessions = await getActiveSessions('u1');
      expect(sessions[0].deviceInfo).toBeTruthy();
      expect(sessions[0].deviceInfo?.deviceType).toBe('unknown');
      expect(sessions[0].deviceInfo?.os).toBe('unknown');
      expect(sessions[0].deviceInfo?.browser).toBe('unknown');
      expect(sessions[0].deviceInfo?.trustLabel).toBeUndefined();
    });
  });
});
