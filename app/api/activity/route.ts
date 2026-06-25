export const dynamic = "force-dynamic"; // reads request headers
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';

interface ActivityBody {
  event: string;
  page: string;
  metadata?: Record<string, string | number | boolean | null>;
  sessionId?: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createServerSupabaseClient();
  const adminSupabase = createAdminSupabaseClient();
  if (!supabase || !adminSupabase) {
    return NextResponse.json({ ok: true }); // silent fail
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ ok: true }); // silent fail for fire-and-forget

  const body = await req.json() as ActivityBody;

  await adminSupabase.from('activity_logs').insert({
    user_id: user.id,
    session_id: body.sessionId || null,
    event: body.event,
    page: body.page,
    metadata: body.metadata ?? {},
  });

  return NextResponse.json({ ok: true });
}
