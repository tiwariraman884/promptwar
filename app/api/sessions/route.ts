export const dynamic = "force-dynamic"; // reads request headers
import { NextResponse } from 'next/server';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { getActiveSessions } from '@/lib/session-manager';

export async function GET(): Promise<NextResponse> {
  const supabase = createServerSupabaseClient();
  if (!supabase) return NextResponse.json({ sessions: [] });

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const sessions = await getActiveSessions(user.id);
  return NextResponse.json({ sessions });
}
