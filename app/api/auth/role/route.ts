export const dynamic = "force-dynamic"; // reads request headers
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getUserRole } from '@/lib/rbac/get-user-role';

export async function GET(): Promise<NextResponse> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ role: 'guest' });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ role: 'guest' });

  const role = await getUserRole(user.id);
  return NextResponse.json({ role });
}
