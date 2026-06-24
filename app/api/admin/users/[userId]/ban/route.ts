import { NextRequest, NextResponse } from 'next/server';
import { verifyApiPermission } from '@/lib/rbac/with-role';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import { writeAuditLog } from '@/lib/audit-logger';

export async function POST(
  req: NextRequest,
  { params }: { params: { userId: string } }
): Promise<NextResponse> {
  const check = await verifyApiPermission(req, 'admin:manage_users');
  if (!check.allowed || !check.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json() as { banned?: boolean; reason?: string };
  const banned = Boolean(body.banned);
  const reason = body.reason ?? (banned ? 'Banned by admin' : 'Unbanned by admin');

  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  await adminSupabase
    .from('user_roles')
    .update({
      is_banned: banned,
      banned_at: banned ? new Date().toISOString() : null,
      banned_reason: banned ? reason : null,
    })
    .eq('user_id', params.userId);

  // Get target email
  let targetEmail = 'unknown';
  const { data: { user } } = await adminSupabase.auth.admin.getUserById(params.userId);
  targetEmail = user?.email ?? 'unknown';

  await writeAuditLog({
    actorId: check.userId,
    actorRole: check.role,
    action: banned ? 'DEVICE_BLOCKED' : 'DEVICE_TRUSTED',
    severity: 'critical',
    description: `${banned ? 'Banned' : 'Unbanned'} user ${targetEmail}: ${reason}`,
    targetId: params.userId,
    targetType: 'user',
    metadata: { banned, reason },
  });

  return NextResponse.json({ success: true, banned });
}
