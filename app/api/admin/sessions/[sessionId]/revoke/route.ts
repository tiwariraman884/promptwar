import { NextRequest, NextResponse } from 'next/server';
import { verifyApiPermission } from '@/lib/rbac/with-role';
import { revokeSession } from '@/lib/session-manager';
import { writeAuditLog } from '@/lib/audit-logger';
import { createAdminSupabaseClient } from '@/lib/supabase/server';

export async function POST(
  req: NextRequest,
  { params }: { params: { sessionId: string } }
): Promise<NextResponse> {
  const check = await verifyApiPermission(req, 'admin:force_logout');
  if (!check.allowed || !check.userId) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await req.json() as { reason?: string; targetEmail?: string };
  const reason = body.reason ?? 'Force logout by admin';

  await revokeSession(params.sessionId, check.userId, reason);

  // Get target user info for audit log
  const adminSupabase = createAdminSupabaseClient();
  let targetUserId = 'unknown';
  if (adminSupabase) {
    const { data } = await adminSupabase
      .from('user_sessions')
      .select('user_id')
      .eq('id', params.sessionId)
      .single();
    targetUserId = data?.user_id ?? 'unknown';
  }

  await writeAuditLog({
    actorId: check.userId,
    actorRole: check.role,
    action: 'ADMIN_FORCE_LOGOUT',
    severity: 'critical',
    description: `Admin force-logged out session ${params.sessionId} for ${body.targetEmail ?? 'user'}`,
    targetId: targetUserId,
    targetType: 'user',
    metadata: { session_id: params.sessionId, reason },
    sessionId: params.sessionId,
  });

  return NextResponse.json({ success: true });
}
