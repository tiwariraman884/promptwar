import { NextRequest, NextResponse } from 'next/server';
import { verifyApiPermission } from '@/lib/rbac/with-role';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import type { AuditLog, AuditSeverity, UserRole } from '@/lib/types/security';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const check = await verifyApiPermission(req, 'admin:view_audit_logs');
  if (!check.allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) return NextResponse.json({ logs: [] });

  const url = new URL(req.url);
  const severity = url.searchParams.get('severity');
  const action = url.searchParams.get('action');
  const fromDate = url.searchParams.get('from');
  const toDate = url.searchParams.get('to');
  const email = url.searchParams.get('email');

  let query = adminSupabase
    .from('audit_logs')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(100);

  if (severity && severity !== 'all') {
    query = query.eq('severity', severity);
  }
  if (action && action !== 'all') {
    query = query.eq('action', action);
  }
  if (fromDate) {
    query = query.gte('created_at', fromDate);
  }
  if (toDate) {
    query = query.lte('created_at', toDate);
  }
  if (email) {
    query = query.ilike('actor_email', `%${email}%`);
  }

  const { data } = await query;

  const logs: AuditLog[] = (data ?? []).map(row => ({
    id: row.id,
    actorId: row.actor_id ?? '',
    actorEmail: row.actor_email,
    actorRole: (row.actor_role as UserRole) ?? 'user',
    targetId: row.target_id,
    targetType: row.target_type,
    action: row.action,
    severity: row.severity as AuditSeverity,
    description: row.description,
    metadata: row.metadata ?? {},
    ipAddress: row.ip_address ?? 'unknown',
    deviceId: row.device_id,
    sessionId: row.session_id,
    createdAt: row.created_at,
  }));

  return NextResponse.json({ logs });
}
