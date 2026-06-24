import { describe, it, expect } from 'vitest';
import { hasPermission, ROLE_PERMISSIONS } from '@/lib/types/security';
import type { UserRole, Permission } from '@/lib/types/security';

describe('hasPermission', () => {
  it('super_admin has all permissions', () => {
    const allPerms: Permission[] = [
      'admin:view_dashboard', 'admin:manage_users', 'admin:assign_roles',
      'admin:view_audit_logs', 'admin:view_all_sessions', 'admin:force_logout',
      'admin:view_activity_logs', 'admin:export_data',
      'user:read_own_data', 'user:write_own_data', 'user:delete_own_data',
      'premium:ai_roadmap', 'premium:ai_explainer',
      'premium:carbon_forecast', 'premium:advanced_export',
    ];
    for (const perm of allPerms) {
      expect(hasPermission('super_admin', perm), `super_admin → ${perm}`).toBe(true);
    }
  });

  it('guest has zero permissions', () => {
    const somePerms: Permission[] = [
      'admin:view_dashboard', 'user:read_own_data', 'premium:ai_roadmap',
    ];
    for (const perm of somePerms) {
      expect(hasPermission('guest', perm), `guest → ${perm}`).toBe(false);
    }
  });

  it('user has read/write/delete own data but no admin', () => {
    expect(hasPermission('user', 'user:read_own_data')).toBe(true);
    expect(hasPermission('user', 'user:write_own_data')).toBe(true);
    expect(hasPermission('user', 'user:delete_own_data')).toBe(true);
    expect(hasPermission('user', 'admin:view_dashboard')).toBe(false);
    expect(hasPermission('user', 'admin:manage_users')).toBe(false);
  });

  it('admin cannot assign roles (only super_admin can)', () => {
    expect(hasPermission('admin', 'admin:assign_roles')).toBe(false);
    expect(hasPermission('super_admin', 'admin:assign_roles')).toBe(true);
  });

  it('moderator has limited admin access', () => {
    expect(hasPermission('moderator', 'admin:view_dashboard')).toBe(true);
    expect(hasPermission('moderator', 'admin:view_activity_logs')).toBe(true);
    expect(hasPermission('moderator', 'admin:manage_users')).toBe(false);
    expect(hasPermission('moderator', 'admin:force_logout')).toBe(false);
  });

  it('premium_user has premium features but no admin', () => {
    expect(hasPermission('premium_user', 'premium:ai_roadmap')).toBe(true);
    expect(hasPermission('premium_user', 'premium:ai_explainer')).toBe(true);
    expect(hasPermission('premium_user', 'premium:carbon_forecast')).toBe(true);
    expect(hasPermission('premium_user', 'premium:advanced_export')).toBe(true);
    expect(hasPermission('premium_user', 'admin:view_dashboard')).toBe(false);
  });
});

describe('ROLE_PERMISSIONS hierarchy', () => {
  it('super_admin permissions ⊇ admin permissions', () => {
    for (const perm of ROLE_PERMISSIONS.admin) {
      expect(ROLE_PERMISSIONS.super_admin, `super_admin missing: ${perm}`).toContain(perm);
    }
  });

  it('admin permissions ⊇ moderator permissions', () => {
    for (const perm of ROLE_PERMISSIONS.moderator) {
      expect(ROLE_PERMISSIONS.admin, `admin missing: ${perm}`).toContain(perm);
    }
  });

  it('all roles are defined', () => {
    const roles: UserRole[] = ['super_admin', 'admin', 'moderator', 'premium_user', 'user', 'guest'];
    for (const role of roles) {
      expect(ROLE_PERMISSIONS[role]).toBeDefined();
      expect(Array.isArray(ROLE_PERMISSIONS[role])).toBe(true);
    }
  });

  it('no duplicate permissions in any role', () => {
    for (const [role, perms] of Object.entries(ROLE_PERMISSIONS)) {
      const unique = new Set(perms);
      expect(unique.size, `${role} has duplicates`).toBe(perms.length);
    }
  });
});
