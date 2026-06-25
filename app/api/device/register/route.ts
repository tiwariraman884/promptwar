export const dynamic = "force-dynamic"; // reads request headers
import { NextRequest, NextResponse } from 'next/server';
import { createServerSupabaseClient, createAdminSupabaseClient } from '@/lib/supabase/server';
import { createSession } from '@/lib/session-manager';
import { writeAuditLog } from '@/lib/audit-logger';
import { getUserRole } from '@/lib/rbac/get-user-role';

interface RegisterBody {
  fingerprint: string;
  deviceType: string;
  os: string;
  browser: string;
  language: string;
  timezone: string;
  screenResolution: string;
  userAgent: string;
}

export async function POST(req: NextRequest): Promise<NextResponse> {
  const supabase = createServerSupabaseClient();
  const adminSupabase = createAdminSupabaseClient();
  if (!supabase || !adminSupabase) {
    return NextResponse.json({ deviceId: null, sessionId: null });
  }

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json() as RegisterBody;
  const ipAddress = req.headers.get('x-client-ip') ??
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ??
    '0.0.0.0';

  // Upsert device
  const { data: existingDevice } = await adminSupabase
    .from('user_devices')
    .select('id')
    .eq('user_id', user.id)
    .eq('fingerprint', body.fingerprint)
    .single();

  let deviceId: string;
  let isNewDevice = false;

  if (existingDevice) {
    deviceId = existingDevice.id;
    // Update last_seen_at
    await adminSupabase
      .from('user_devices')
      .update({
        last_seen_at: new Date().toISOString(),
        ip_address: ipAddress,
        os: body.os,
        browser: body.browser,
      })
      .eq('id', deviceId);
  } else {
    isNewDevice = true;
    const { data: newDevice, error } = await adminSupabase
      .from('user_devices')
      .insert({
        user_id: user.id,
        fingerprint: body.fingerprint,
        device_type: body.deviceType,
        os: body.os,
        browser: body.browser,
        language: body.language,
        timezone: body.timezone,
        screen_resolution: body.screenResolution,
        ip_address: ipAddress,
        user_agent: body.userAgent,
      })
      .select('id')
      .single();

    if (error || !newDevice) {
      return NextResponse.json({ deviceId: null, sessionId: null });
    }
    deviceId = newDevice.id;
  }

  // Create session
  const sessionId = await createSession({
    userId: user.id,
    deviceId,
    ipAddress,
  });

  // Audit: new device detected
  if (isNewDevice) {
    const role = await getUserRole(user.id);
    await writeAuditLog({
      actorId: user.id,
      actorEmail: user.email ?? undefined,
      actorRole: role,
      action: 'DEVICE_NEW_DEVICE_DETECTED',
      severity: 'warning',
      description: `New device detected: ${body.browser} on ${body.os}`,
      metadata: {
        device_type: body.deviceType,
        browser: body.browser,
        os: body.os,
        is_new_device: true,
      },
      ipAddress,
      deviceId,
      sessionId,
    });
  }

  return NextResponse.json({ deviceId, sessionId });
}
