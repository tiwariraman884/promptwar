import { createAdminSupabaseClient } from '@/lib/supabase/server';
import type { AuditAction, AuditSeverity, UserRole } from '@/lib/types/security';

interface LogParams {
  actorId: string;
  actorEmail?: string;
  actorRole: UserRole;
  action: AuditAction;
  severity: AuditSeverity;
  description: string;
  targetId?: string;
  targetType?: string;
  metadata?: Record<string, string | number | boolean | null>;
  ipAddress?: string;
  deviceId?: string;
  sessionId?: string;
}

const FORBIDDEN_KEYS = ['password', 'token', 'secret', 'key', 'auth', 'cookie', 'session_token'];

function sanitizeMetadata(
  meta: Record<string, string | number | boolean | null>
): Record<string, string | number | boolean | null> {
  return Object.fromEntries(
    Object.entries(meta).filter(([k]) =>
      !FORBIDDEN_KEYS.some(f => k.toLowerCase().includes(f))
    )
  );
}

/**
 * Append-only audit logger. NEVER throws — catches all errors silently.
 * Only call from server-side code (API routes, server components).
 */
export async function writeAuditLog(params: LogParams): Promise<void> {
  try {
    const adminSupabase = createAdminSupabaseClient();
    if (!adminSupabase) return;

    const safeMetadata = params.metadata ? sanitizeMetadata(params.metadata) : {};

    await adminSupabase.from('audit_logs').insert({
      actor_id: params.actorId,
      actor_email: params.actorEmail,
      actor_role: params.actorRole,
      target_id: params.targetId,
      target_type: params.targetType,
      action: params.action,
      severity: params.severity,
      description: params.description,
      metadata: safeMetadata,
      ip_address: params.ipAddress ?? 'unknown',
      device_id: params.deviceId,
      session_id: params.sessionId,
    });
  } catch {
    // Audit log failures must NEVER crash the app
    console.error('[AUDIT] Failed to write audit log:', params.action);
  }
}
