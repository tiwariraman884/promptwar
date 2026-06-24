import { NextRequest, NextResponse } from 'next/server';
import { verifyApiPermission } from '@/lib/rbac/with-role';
import { setUserRole, getUserRole } from '@/lib/rbac/get-user-role';
import { writeAuditLog } from '@/lib/audit-logger';
import type { UserRole } from '@/lib/types/security';
import { createAdminSupabaseClient } from '@/lib/supabase/server';

export async function PATCH(
  req: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  const check = await verifyApiPermission(req, 'admin:assign_roles');
  if (!check.allowed || !check.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json() as { role?: string };
  const validRoles: UserRole[] = ['super_admin', 'admin', 'moderator', 'premium_user', 'user', 'guest'];
  if (!body.role || !validRoles.includes(body.role as UserRole)) {
    return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
  }

  const newRole = body.role as UserRole;
  const oldRole = await getUserRole(params.userId);

  await setUserRole(params.userId, newRole, check.userId);

  // Get target email
  const adminSupabase = createAdminSupabaseClient();
  let targetEmail = 'unknown';
  if (adminSupabase) {
    const { data: { user } } = await adminSupabase.auth.admin.getUserById(params.userId);
    targetEmail = user?.email ?? 'unknown';
  }

  await writeAuditLog({
    actorId: check.userId,
    actorRole: check.role,
    action: 'RBAC_ROLE_ASSIGNED',
    severity: 'critical',
    description: `Role changed from ${oldRole} to ${newRole} for ${targetEmail}`,
    targetId: params.userId,
    targetType: 'user',
    metadata: { old_role: oldRole, new_role: newRole },
  });

  return NextResponse.json({ success: true, role: newRole });
}
