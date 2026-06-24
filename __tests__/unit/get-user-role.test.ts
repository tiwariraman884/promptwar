import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock Supabase
vi.mock('@/lib/supabase/server', () => ({
  createAdminSupabaseClient: vi.fn(),
}));

import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { getUserRole, setUserRole } from '@/lib/rbac/get-user-role';

describe('getUserRole', () => {
  const mockSingle = vi.fn();
  const mockEq = vi.fn(() => ({ single: mockSingle }));
  const mockSelect = vi.fn(() => ({ eq: mockEq }));
  const mockFrom = vi.fn(() => ({ select: mockSelect }));

  beforeEach(() => {
    vi.clearAllMocks();
    (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom,
    });
  });

  it('returns role from DB', async () => {
    mockSingle.mockResolvedValue({ data: { role: 'admin', is_banned: false }, error: null });
    const role = await getUserRole('user-1');
    expect(role).toBe('admin');
  });

  it('returns "guest" for banned users', async () => {
    mockSingle.mockResolvedValue({ data: { role: 'admin', is_banned: true }, error: null });
    const role = await getUserRole('banned-user');
    expect(role).toBe('guest');
  });

  it('defaults to "user" when no row found', async () => {
    mockSingle.mockResolvedValue({ data: null, error: { code: 'PGRST116' } });
    const role = await getUserRole('new-user');
    expect(role).toBe('user');
  });

  it('defaults to "user" when admin client is null', async () => {
    (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(null);
    const role = await getUserRole('user-1');
    expect(role).toBe('user');
  });

  it('defaults to "user" on exception', async () => {
    mockSingle.mockRejectedValue(new Error('DB down'));
    const role = await getUserRole('user-1');
    expect(role).toBe('user');
  });
});

describe('setUserRole', () => {
  const mockUpsert = vi.fn().mockResolvedValue({ error: null });
  const mockFrom = vi.fn(() => ({ upsert: mockUpsert }));

  beforeEach(() => {
    vi.clearAllMocks();
    (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue({
      from: mockFrom,
    });
  });

  it('upserts role with correct fields', async () => {
    await setUserRole('target-user', 'moderator', 'admin-1');
    expect(mockFrom).toHaveBeenCalledWith('user_roles');
    expect(mockUpsert).toHaveBeenCalledTimes(1);
    const arg = mockUpsert.mock.calls[0][0];
    expect(arg.user_id).toBe('target-user');
    expect(arg.role).toBe('moderator');
    expect(arg.assigned_by).toBe('admin-1');
    expect(arg.assigned_at).toBeTruthy();
  });

  it('throws when admin client is null', async () => {
    (createAdminSupabaseClient as ReturnType<typeof vi.fn>).mockReturnValue(null);
    await expect(setUserRole('u1', 'admin', 'admin-1')).rejects.toThrow('Admin Supabase client not configured');
  });
});
