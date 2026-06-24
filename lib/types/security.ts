/**
 * Enterprise Security Types — Single source of truth.
 * All security features import types from this file only.
 */

// ── Roles & Permissions ──────────────────────────────────────

export type UserRole =
  | 'super_admin'
  | 'admin'
  | 'moderator'
  | 'premium_user'
  | 'user'
  | 'guest';

export type Permission =
  | 'admin:view_dashboard'
  | 'admin:manage_users'
  | 'admin:assign_roles'
  | 'admin:view_audit_logs'
  | 'admin:view_all_sessions'
  | 'admin:force_logout'
  | 'admin:view_activity_logs'
  | 'admin:export_data'
  | 'user:read_own_data'
  | 'user:write_own_data'
  | 'user:delete_own_data'
  | 'premium:ai_roadmap'
  | 'premium:ai_explainer'
  | 'premium:carbon_forecast'
  | 'premium:advanced_export';

export const ROLE_PERMISSIONS: Record<UserRole, Permission[]> = {
  super_admin: [
    'admin:view_dashboard', 'admin:manage_users', 'admin:assign_roles',
    'admin:view_audit_logs', 'admin:view_all_sessions', 'admin:force_logout',
    'admin:view_activity_logs', 'admin:export_data',
    'user:read_own_data', 'user:write_own_data', 'user:delete_own_data',
    'premium:ai_roadmap', 'premium:ai_explainer',
    'premium:carbon_forecast', 'premium:advanced_export',
  ],
  admin: [
    'admin:view_dashboard', 'admin:manage_users',
    'admin:view_audit_logs', 'admin:view_all_sessions',
    'admin:force_logout', 'admin:view_activity_logs',
    'user:read_own_data', 'user:write_own_data',
    'premium:ai_roadmap', 'premium:ai_explainer',
    'premium:carbon_forecast', 'premium:advanced_export',
  ],
  moderator: [
    'admin:view_dashboard', 'admin:view_activity_logs',
    'user:read_own_data', 'user:write_own_data',
    'premium:ai_roadmap', 'premium:carbon_forecast',
  ],
  premium_user: [
    'user:read_own_data', 'user:write_own_data', 'user:delete_own_data',
    'premium:ai_roadmap', 'premium:ai_explainer',
    'premium:carbon_forecast', 'premium:advanced_export',
  ],
  user: [
    'user:read_own_data', 'user:write_own_data', 'user:delete_own_data',
  ],
  guest: [],
};

export function hasPermission(role: UserRole, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

// ── Device ──────────────────────────────────────────────────

export type DeviceType = 'mobile' | 'tablet' | 'desktop' | 'unknown';

export interface DeviceInfo {
  id: string;
  userId: string;
  fingerprint: string;
  deviceType: DeviceType;
  os: string;
  browser: string;
  language: string;
  timezone: string;
  screenResolution: string;
  ipAddress: string;
  userAgent: string;
  firstSeenAt: string;
  lastSeenAt: string;
  isTrusted: boolean;
  trustLabel?: string;
}

// ── Session ──────────────────────────────────────────────────

export type SessionStatus = 'active' | 'expired' | 'revoked';

export interface UserSession {
  id: string;
  userId: string;
  deviceId: string;
  deviceInfo?: DeviceInfo;
  ipAddress: string;
  status: SessionStatus;
  createdAt: string;
  lastActiveAt: string;
  expiresAt: string;
  revokedAt?: string;
  revokedBy?: string;
  revokedReason?: string;
}

// ── Audit Log ────────────────────────────────────────────────

export type AuditSeverity = 'info' | 'warning' | 'critical';

export type AuditAction =
  | 'AUTH_LOGIN_SUCCESS'
  | 'AUTH_LOGIN_FAILED'
  | 'AUTH_LOGOUT'
  | 'AUTH_PASSWORD_CHANGED'
  | 'AUTH_SESSION_REVOKED'
  | 'AUTH_SUSPICIOUS_LOGIN'
  | 'RBAC_ROLE_ASSIGNED'
  | 'RBAC_ROLE_REMOVED'
  | 'RBAC_UNAUTHORIZED_ACCESS'
  | 'DATA_PROFILE_UPDATED'
  | 'DATA_ACCOUNT_DELETED'
  | 'DATA_EXPORT_REQUESTED'
  | 'ADMIN_USER_VIEWED'
  | 'ADMIN_FORCE_LOGOUT'
  | 'ADMIN_ROLE_CHANGED'
  | 'DEVICE_NEW_DEVICE_DETECTED'
  | 'DEVICE_TRUSTED'
  | 'DEVICE_BLOCKED';

export interface AuditLog {
  id: string;
  actorId: string;
  actorEmail?: string;
  actorRole: UserRole;
  targetId?: string;
  targetType?: string;
  action: AuditAction;
  severity: AuditSeverity;
  description: string;
  metadata: Record<string, string | number | boolean | null>;
  ipAddress: string;
  deviceId?: string;
  sessionId?: string;
  createdAt: string;
}

// ── Activity Log ─────────────────────────────────────────────

export type ActivityEvent =
  | 'PAGE_VIEW'
  | 'FEATURE_CARBON_CALCULATOR'
  | 'FEATURE_SCANNER_USED'
  | 'FEATURE_ROADMAP_GENERATED'
  | 'FEATURE_SIMULATOR_USED'
  | 'FEATURE_FORECAST_VIEWED'
  | 'FEATURE_HEALTH_SCORE_VIEWED'
  | 'FEATURE_EXPLAIN_OPENED'
  | 'PROFILE_TWIN_UPDATED'
  | 'MAP_LAYER_TOGGLED'
  | 'ENERGY_AUDIT_SUBMITTED'
  | 'BUTTON_CLICK';

export interface ActivityLog {
  id: string;
  userId: string;
  sessionId: string;
  event: ActivityEvent;
  page: string;
  metadata: Record<string, string | number | boolean | null>;
  durationMs?: number;
  createdAt: string;
}

// ── Admin Dashboard ──────────────────────────────────────────

export interface AdminUserRow {
  userId: string;
  email: string;
  role: UserRole;
  createdAt: string;
  lastSignInAt?: string;
  activeSessions: number;
  totalActivityCount: number;
  isBanned: boolean;
}

export interface SecuritySummary {
  totalUsers: number;
  activeSessions: number;
  auditEventsToday: number;
  criticalAlertsToday: number;
  newDevicesThisWeek: number;
  failedLoginsToday: number;
}
