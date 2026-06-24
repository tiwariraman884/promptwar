import { describe, it, expect, vi, beforeEach } from 'vitest';
import { hasPermission, ROLE_PERMISSIONS } from '@/lib/types/security';
import type { UserRole, Permission } from '@/lib/types/security';

// Mock the Supabase layer
vi.mock('@/lib/supabase/server', () => ({
  createAdminSupabaseClient: vi.fn(),
}));

vi.mock('@/lib/rbac/get-user-role', () => ({
  getUserRole: vi.fn(),
}));

import { getUserRole } from '@/lib/rbac/get-user-role';
import { checkPermission } from '@/lib/rbac/check-permission';

describe('RBAC Workflow Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('super_admin → can view dashboard', async () => {
    (getUserRole as ReturnType<typeof vi.fn>).mockResolvedValue('super_admin');
    const result = await checkPermission('user-1', 'admin:view_dashboard');
    expect(result.allowed).toBe(true);
    expect(result.role).toBe('super_admin');
  });

  it('user → cannot view dashboard', async () => {
    (getUserRole as ReturnType<typeof vi.fn>).mockResolvedValue('user');
    const result = await checkPermission('user-2', 'admin:view_dashboard');
    expect(result.allowed).toBe(false);
    expect(result.role).toBe('user');
  });

  it('admin → can manage users but cannot assign roles', async () => {
    (getUserRole as ReturnType<typeof vi.fn>).mockResolvedValue('admin');
    const canManage = await checkPermission('admin-1', 'admin:manage_users');
    const canAssign = await checkPermission('admin-1', 'admin:assign_roles');
    expect(canManage.allowed).toBe(true);
    expect(canAssign.allowed).toBe(false);
  });

  it('guest → gets no permissions at all', async () => {
    (getUserRole as ReturnType<typeof vi.fn>).mockResolvedValue('guest');
    const checks = await Promise.all([
      checkPermission('guest-1', 'user:read_own_data'),
      checkPermission('guest-1', 'admin:view_dashboard'),
      checkPermission('guest-1', 'premium:ai_roadmap'),
    ]);
    for (const check of checks) {
      expect(check.allowed).toBe(false);
      expect(check.role).toBe('guest');
    }
  });

  it('role escalation check — user cannot become admin without role change', async () => {
    (getUserRole as ReturnType<typeof vi.fn>).mockResolvedValue('user');
    const beforeEscalation = await checkPermission('user-3', 'admin:force_logout');
    expect(beforeEscalation.allowed).toBe(false);

    // Simulate role change
    (getUserRole as ReturnType<typeof vi.fn>).mockResolvedValue('admin');
    const afterEscalation = await checkPermission('user-3', 'admin:force_logout');
    expect(afterEscalation.allowed).toBe(true);
  });

  it('hasPermission × checkPermission consistency for all roles', async () => {
    const roles: UserRole[] = ['super_admin', 'admin', 'moderator', 'premium_user', 'user', 'guest'];
    const testPerms: Permission[] = ['admin:view_dashboard', 'user:read_own_data', 'premium:ai_roadmap'];

    for (const role of roles) {
      (getUserRole as ReturnType<typeof vi.fn>).mockResolvedValue(role);
      for (const perm of testPerms) {
        const direct = hasPermission(role, perm);
        const workflow = await checkPermission('test', perm);
        expect(workflow.allowed, `${role}→${perm}`).toBe(direct);
      }
    }
  });
});
