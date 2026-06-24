import { NextRequest, NextResponse } from 'next/server';
import { verifyApiPermission } from '@/lib/rbac/with-role';
import { createAdminSupabaseClient } from '@/lib/supabase/server';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const check = await verifyApiPermission(req, 'admin:view_all_sessions');
  if (!check.allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) return NextResponse.json({ sessions: [] });

  const url = new URL(req.url);
  const status = url.searchParams.get('status') ?? 'active';
  const email = url.searchParams.get('email');

  let query = adminSupabase
    .from('user_sessions')
    .select(`
      id, user_id, device_id, ip_address, status,
      created_at, last_active_at, expires_at,
      revoked_at, revoked_by, revoked_reason,
      user_devices (device_type, os, browser)
    `)
    .order('last_active_at', { ascending: false })
    .limit(50);

  if (status !== 'all') {
    query = query.eq('status', status);
  }

  const { data } = await query;

  // Get user emails
  const _userIds = [...new Set((data ?? []).map(s => s.user_id as string))];
  const { data: { users: authUsers } } = await adminSupabase.auth.admin.listUsers({ perPage: 100 });
  const emailMap = new Map<string, string>();
  (authUsers ?? []).forEach(u => emailMap.set(u.id, u.email ?? 'unknown'));

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let sessions = (data ?? []).map((s: Record<string, any>) => {
    const device = s.user_devices as Record<string, unknown> | null;
    return {
      id: s.id as string,
      userEmail: emailMap.get(s.user_id as string) ?? 'unknown',
      userId: s.user_id as string,
      deviceType: device ? String(device.device_type ?? 'unknown') : 'unknown',
      os: device ? String(device.os ?? 'unknown') : 'unknown',
      browser: device ? String(device.browser ?? 'unknown') : 'unknown',
      ipAddress: (s.ip_address as string) ?? '0.0.0.0',
      createdAt: s.created_at as string,
      lastActiveAt: s.last_active_at as string,
      status: s.status as string,
      revokedBy: s.revoked_by ? (emailMap.get(s.revoked_by as string) ?? 'admin') : undefined,
    };
  });

  if (email) {
    sessions = sessions.filter(s => s.userEmail.toLowerCase().includes(email.toLowerCase()));
  }

  return NextResponse.json({ sessions });
}
