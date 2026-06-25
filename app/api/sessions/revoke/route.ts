export const dynamic = "force-dynamic"; // reads request headers
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { revokeSession } from '@/lib/session-manager';
import { writeAuditLog } from '@/lib/audit-logger';
import { getUserRole } from '@/lib/rbac/get-user-role';

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ error: 'Not configured' }, { status: 500 });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as { sessionId?: string };
  if (!body.sessionId) return NextResponse.json({ error: 'Missing sessionId' }, { status: 400 });

  const role = await getUserRole(user.id);

  await revokeSession(body.sessionId, user.id, 'User revoked session');
  await writeAuditLog({
    actorId: user.id,
    actorEmail: user.email ?? undefined,
    actorRole: role,
    action: 'AUTH_SESSION_REVOKED',
    severity: 'info',
    description: `User revoked session ${body.sessionId}`,
    metadata: { session_id: body.sessionId },
  });

  return NextResponse.json({ success: true });
}
