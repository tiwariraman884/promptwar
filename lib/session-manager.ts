import { createAdminSupabaseClient } from '@/lib/supabase/server';
import type { UserSession } from '@/lib/types/security';

/**
 * Server-side session management — uses service_role key.
 * ONLY call from API routes or server components.
 */

export async function createSession(params: {
  userId: string;
  deviceId: string;
  ipAddress: string;
}): Promise<string> {
  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) throw new Error('Admin Supabase client not configured');

  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  const { data, error } = await adminSupabase
    .from('user_sessions')
    .insert({
      user_id: params.userId,
      device_id: params.deviceId,
      ip_address: params.ipAddress,
      status: 'active',
      expires_at: expiresAt,
    })
    .select('id')
    .single();

  if (error) throw error;
  return data.id;
}

export async function touchSession(sessionId: string): Promise<void> {
  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) return;

  await adminSupabase
    .from('user_sessions')
    .update({ last_active_at: new Date().toISOString() })
    .eq('id', sessionId)
    .eq('status', 'active');
}

export async function revokeSession(
  sessionId: string,
  revokedBy: string,
  reason: string = 'Manual revocation'
): Promise<void> {
  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) return;

  await adminSupabase
    .from('user_sessions')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_by: revokedBy,
      revoked_reason: reason,
    })
    .eq('id', sessionId);
}

export async function revokeAllUserSessions(
  userId: string,
  revokedBy: string,
  reason: string
): Promise<void> {
  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) return;

  await adminSupabase
    .from('user_sessions')
    .update({
      status: 'revoked',
      revoked_at: new Date().toISOString(),
      revoked_by: revokedBy,
      revoked_reason: reason,
    })
    .eq('user_id', userId)
    .eq('status', 'active');
}

export async function getActiveSessions(userId: string): Promise<UserSession[]> {
  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) return [];

  const { data } = await adminSupabase
    .from('user_sessions')
    .select(`
      id, user_id, device_id, ip_address, status,
      created_at, last_active_at, expires_at,
      revoked_at, revoked_by, revoked_reason,
      user_devices (
        id, device_type, os, browser, ip_address,
        is_trusted, trust_label, last_seen_at, fingerprint
      )
    `)
    .eq('user_id', userId)
    .eq('status', 'active')
    .order('last_active_at', { ascending: false })
    .limit(20);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return (data ?? []).map((row: Record<string, any>) => {
    const device = row.user_devices as Record<string, unknown> | null;
    return {
      id: row.id as string,
      userId: row.user_id as string,
      deviceId: row.device_id as string,
      ipAddress: row.ip_address as string,
      status: row.status as string,
      createdAt: row.created_at as string,
      lastActiveAt: row.last_active_at as string,
      expiresAt: row.expires_at as string,
      revokedAt: row.revoked_at as string | undefined,
      revokedBy: row.revoked_by as string | undefined,
      revokedReason: row.revoked_reason as string | undefined,
      deviceInfo: device ? {
        id: String(device.id ?? ''),
        userId: userId,
        fingerprint: String(device.fingerprint ?? ''),
        deviceType: String(device.device_type ?? 'unknown') as 'mobile' | 'tablet' | 'desktop' | 'unknown',
        os: String(device.os ?? 'unknown'),
        browser: String(device.browser ?? 'unknown'),
        language: '', timezone: '', screenResolution: '', userAgent: '',
        ipAddress: String(device.ip_address ?? ''),
        firstSeenAt: '', lastSeenAt: String(device.last_seen_at ?? ''),
        isTrusted: Boolean(device.is_trusted),
        trustLabel: device.trust_label ? String(device.trust_label) : undefined,
      } : undefined,
    };
  }) as UserSession[];
}
