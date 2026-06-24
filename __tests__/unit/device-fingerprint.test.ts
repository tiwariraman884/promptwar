import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock browser APIs before importing the module
const mockDigest = vi.fn().mockResolvedValue(new ArrayBuffer(32));
const mockNavigator = {
  userAgent: 'Mozilla/5.0 (Linux; Android 12; Redmi Note 10) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Mobile Safari/537.36',
  language: 'hi-IN',
  hardwareConcurrency: 4,
  maxTouchPoints: 5,
};

vi.stubGlobal('navigator', mockNavigator);
vi.stubGlobal('screen', { width: 360, height: 800 });
vi.stubGlobal('window', { innerWidth: 360 });
vi.stubGlobal('crypto', { subtle: { digest: mockDigest } });
vi.stubGlobal('Intl', {
  DateTimeFormat: () => ({
    resolvedOptions: () => ({ timeZone: 'Asia/Kolkata' }),
  }),
});
vi.stubGlobal('TextEncoder', class { encode(s: string) { return new Uint8Array(s.split('').map(c => c.charCodeAt(0))); } });

describe('device-fingerprint', () => {
  beforeEach(() => {
    vi.resetModules();
    // Fill mock buffer with deterministic values
    const buffer = new ArrayBuffer(32);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < 32; i++) view[i] = i;
    mockDigest.mockResolvedValue(buffer);
  });

  it('buildFingerprint returns correct shape', async () => {
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();

    expect(result).toHaveProperty('fingerprint');
    expect(result).toHaveProperty('deviceType');
    expect(result).toHaveProperty('os');
    expect(result).toHaveProperty('browser');
    expect(result).toHaveProperty('language');
    expect(result).toHaveProperty('timezone');
    expect(result).toHaveProperty('screenResolution');
    expect(result).toHaveProperty('userAgent');
  });

  it('fingerprint is 32-char hex string', async () => {
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.fingerprint).toMatch(/^[0-9a-f]{32}$/);
  });

  it('detects mobile device type from Android UA', async () => {
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.deviceType).toBe('mobile');
  });

  it('detects Android OS', async () => {
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.os).toContain('Android');
  });

  it('detects Chrome browser', async () => {
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.browser).toContain('Chrome');
  });

  it('reads language from navigator', async () => {
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.language).toBe('hi-IN');
  });

  it('reads timezone from Intl', async () => {
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.timezone).toBe('Asia/Kolkata');
  });

  it('reads screen resolution', async () => {
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.screenResolution).toBe('360x800');
  });
});
