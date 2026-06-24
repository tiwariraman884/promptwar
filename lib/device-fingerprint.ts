/**
 * Client-side device fingerprint builder.
 * Pure browser APIs — no npm packages. Consumed by DeviceTracker component.
 */

export interface FingerprintData {
  fingerprint: string;
  deviceType: 'mobile' | 'tablet' | 'desktop' | 'unknown';
  os: string;
  browser: string;
  language: string;
  timezone: string;
  screenResolution: string;
  userAgent: string;
}

function detectDeviceType(): FingerprintData['deviceType'] {
  const ua = navigator.userAgent;
  if (/Mobi|Android/i.test(ua)) return 'mobile';
  if (/Tablet|iPad/i.test(ua)) return 'tablet';
  if (window.innerWidth >= 1024) return 'desktop';
  return 'unknown';
}

function detectOS(ua: string): string {
  if (/Android (\d+)/.test(ua)) return `Android ${ua.match(/Android (\d+)/)?.[1] ?? ''}`;
  if (/iPhone OS ([\d_]+)/.test(ua)) return `iOS ${ua.match(/iPhone OS ([\d_]+)/)?.[1]?.replace(/_/g, '.') ?? ''}`;
  if (/Windows NT ([\d.]+)/.test(ua)) {
    const ver: Record<string, string> = { '10.0': '10/11', '6.3': '8.1', '6.1': '7' };
    const v = ua.match(/Windows NT ([\d.]+)/)?.[1] ?? '';
    return `Windows ${ver[v] ?? v}`;
  }
  if (/Mac OS X/.test(ua)) return 'macOS';
  if (/Linux/.test(ua)) return 'Linux';
  return 'Unknown OS';
}

function detectBrowser(ua: string): string {
  if (/Edg\/(\d+)/.test(ua)) return `Edge ${ua.match(/Edg\/(\d+)/)?.[1] ?? ''}`;
  if (/OPR\/(\d+)/.test(ua)) return `Opera ${ua.match(/OPR\/(\d+)/)?.[1] ?? ''}`;
  if (/Chrome\/(\d+)/.test(ua)) return `Chrome ${ua.match(/Chrome\/(\d+)/)?.[1] ?? ''}`;
  if (/Firefox\/(\d+)/.test(ua)) return `Firefox ${ua.match(/Firefox\/(\d+)/)?.[1] ?? ''}`;
  if (/Safari\/(\d+)/.test(ua) && !/Chrome/.test(ua)) return 'Safari';
  return 'Unknown Browser';
}

async function hashString(input: string): Promise<string> {
  const buf = await crypto.subtle.digest(
    'SHA-256',
    new TextEncoder().encode(input)
  );
  return Array.from(new Uint8Array(buf))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
    .substring(0, 32);
}

export async function buildFingerprint(): Promise<FingerprintData> {
  const ua = navigator.userAgent;
  const signals = [
    ua,
    navigator.language,
    Intl.DateTimeFormat().resolvedOptions().timeZone,
    `${screen.width}x${screen.height}`,
    String(navigator.hardwareConcurrency ?? 0),
    String(navigator.maxTouchPoints ?? 0),
  ].join('|');

  const fingerprint = await hashString(signals);

  return {
    fingerprint,
    deviceType: detectDeviceType(),
    os: detectOS(ua),
    browser: detectBrowser(ua),
    language: navigator.language,
    timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
    screenResolution: `${screen.width}x${screen.height}`,
    userAgent: ua,
  };
}
