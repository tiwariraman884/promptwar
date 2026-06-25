export const dynamic = "force-dynamic"; // reads request headers
import { NextRequest, NextResponse } from 'next/server';
import { verifyApiPermission } from '@/lib/rbac/with-role';
import { createAdminSupabaseClient } from '@/lib/supabase/server';
import type { AdminUserRow, UserRole } from '@/lib/types/security';

export async function GET(req: NextRequest): Promise<NextResponse> {
  const check = await verifyApiPermission(req, 'admin:manage_users');
  if (!check.allowed) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) return NextResponse.json({ users: [] });

  // Get all users from auth + their roles
  const { data: roles } = await adminSupabase
    .from('user_roles')
    .select('user_id, role, is_banned, assigned_at')
    .order('assigned_at', { ascending: false })
    .limit(50);

  // Get active session counts
  const { data: sessionCounts } = await adminSupabase
    .from('user_sessions')
    .select('user_id')
    .eq('status', 'active');

  const sessionMap = new Map<string, number>();
  (sessionCounts ?? []).forEach(s => {
    const uid = s.user_id as string;
    sessionMap.set(uid, (sessionMap.get(uid) ?? 0) + 1);
  });

  // Get user emails from auth.users via admin API
  const { data: { users: authUsers } } = await adminSupabase.auth.admin.listUsers({
    perPage: 50,
  });

  const emailMap = new Map<string, { email: string; createdAt: string; lastSignInAt?: string }>();
  (authUsers ?? []).forEach(u => {
    emailMap.set(u.id, {
      email: u.email ?? 'unknown',
      createdAt: u.created_at,
      lastSignInAt: u.last_sign_in_at ?? undefined,
    });
  });

  const users: AdminUserRow[] = (roles ?? []).map(r => {
    const auth = emailMap.get(r.user_id);
    return {
      userId: r.user_id,
      email: auth?.email ?? 'unknown',
      role: (r.role as UserRole) ?? 'user',
      createdAt: auth?.createdAt ?? r.assigned_at,
      lastSignInAt: auth?.lastSignInAt,
      activeSessions: sessionMap.get(r.user_id) ?? 0,
      totalActivityCount: 0,
      isBanned: Boolean(r.is_banned),
    };
  });

  return NextResponse.json({ users });
}
