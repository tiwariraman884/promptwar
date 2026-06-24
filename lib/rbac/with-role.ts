import { createServerSupabaseClient } from '@/lib/supabase/server';
import { redirect } from 'next/navigation';
import { checkPermission } from './check-permission';
import type { Permission, UserRole } from '@/lib/types/security';
import { NextRequest } from 'next/server';

/**
 * Server Component guard.
 * Usage: const { userId, role } = await requirePermission('admin:view_dashboard');
 */
export async function requirePermission(
  permission: Permission,
  redirectTo: string = '/dashboard'
): Promise<{ userId: string; role: UserRole }> {
  const supabase = createServerSupabaseClient();
  if (!supabase) redirect(redirectTo);

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect('/auth');

  const { allowed, role } = await checkPermission(user.id, permission);
  if (!allowed) {
    // Audit unauthorized access attempt (import dynamically to avoid circular deps)
    const { writeAuditLog } = await import('@/lib/audit-logger');
    await writeAuditLog({
      actorId: user.id,
      actorEmail: user.email,
      actorRole: role,
      action: 'RBAC_UNAUTHORIZED_ACCESS',
      severity: 'warning',
      description: `Attempted to access ${permission} without authorization`,
      metadata: { required_permission: permission, user_role: role },
    });
    redirect(redirectTo);
  }

  return { userId: user.id, role };
}

/**
 * API route handler guard.
 * Usage:
 *   const check = await verifyApiPermission(req, 'admin:view_audit_logs');
 *   if (!check.allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
 */
export async function verifyApiPermission(
  _req: NextRequest,
  permission: Permission
): Promise<{ allowed: boolean; userId: string | null; role: UserRole }> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return { allowed: false, userId: null, role: 'guest' };

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { allowed: false, userId: null, role: 'guest' };

  const { allowed, role } = await checkPermission(user.id, permission);
  return { allowed, userId: user.id, role };
}
