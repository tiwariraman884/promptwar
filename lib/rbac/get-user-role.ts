import { createAdminSupabaseClient } from '@/lib/supabase/server';
import type { UserRole } from '@/lib/types/security';

/**
 * Server-side role fetch — uses service_role key.
 * ONLY call from API routes or server components.
 */
export async function getUserRole(userId: string): Promise<UserRole> {
  try {
    const adminSupabase = createAdminSupabaseClient();
    if (!adminSupabase) return 'user';

    const { data, error } = await adminSupabase
      .from('user_roles')
      .select('role, is_banned')
      .eq('user_id', userId)
      .single();

    if (error || !data) return 'user';
    if (data.is_banned) return 'guest';
    return (data.role as UserRole) ?? 'user';
  } catch {
    return 'user';
  }
}

export async function setUserRole(
  targetUserId: string,
  role: UserRole,
  assignedBy: string
): Promise<void> {
  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) throw new Error('Admin Supabase client not configured');

  await adminSupabase
    .from('user_roles')
    .upsert({
      user_id: targetUserId,
      role,
      assigned_by: assignedBy,
      assigned_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
}
