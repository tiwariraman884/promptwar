import { describe, it, expect, vi, beforeEach } from 'vitest';

// Tests targeting uncovered BRANCHES in device-fingerprint.ts

describe('device-fingerprint branch coverage', () => {
  const mockDigest = vi.fn();

  beforeEach(() => {
    vi.resetModules();
    const buffer = new ArrayBuffer(32);
    const view = new Uint8Array(buffer);
    for (let i = 0; i < 32; i++) view[i] = i;
    mockDigest.mockResolvedValue(buffer);
    vi.stubGlobal('crypto', { subtle: { digest: mockDigest } });
    vi.stubGlobal('Intl', {
      DateTimeFormat: () => ({ resolvedOptions: () => ({ timeZone: 'Asia/Kolkata' }) }),
    });
    vi.stubGlobal('TextEncoder', class { encode(s: string) { return new Uint8Array(s.split('').map(c => c.charCodeAt(0))); } });
  });

  it('detects tablet from iPad UA', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPad; CPU OS 16_0 like Mac OS X) AppleWebKit/605.1.15',
      language: 'en', hardwareConcurrency: 2, maxTouchPoints: 5,
    });
    vi.stubGlobal('screen', { width: 768, height: 1024 });
    vi.stubGlobal('window', { innerWidth: 768 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.deviceType).toBe('tablet');
  });

  it('detects desktop for wide screen without mobile/tablet UA', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) AppleWebKit/537.36 Chrome/120',
      language: 'en', hardwareConcurrency: 8, maxTouchPoints: 0,
    });
    vi.stubGlobal('screen', { width: 1920, height: 1080 });
    vi.stubGlobal('window', { innerWidth: 1920 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.deviceType).toBe('desktop');
  });

  it('detects unknown device for small non-mobile screen', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Unknown Device)',
      language: 'en', hardwareConcurrency: 1, maxTouchPoints: 0,
    });
    vi.stubGlobal('screen', { width: 800, height: 600 });
    vi.stubGlobal('window', { innerWidth: 800 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.deviceType).toBe('unknown');
  });

  it('detects iOS from iPhone UA', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 17_0 like Mac OS X)',
      language: 'en', hardwareConcurrency: 6, maxTouchPoints: 5,
    });
    vi.stubGlobal('screen', { width: 390, height: 844 });
    vi.stubGlobal('window', { innerWidth: 390 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.os).toContain('iOS');
  });

  it('detects Windows OS', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120',
      language: 'en', hardwareConcurrency: 4, maxTouchPoints: 0,
    });
    vi.stubGlobal('screen', { width: 1920, height: 1080 });
    vi.stubGlobal('window', { innerWidth: 1920 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.os).toContain('Windows');
  });

  it('detects macOS', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) Safari/605.1.15',
      language: 'en', hardwareConcurrency: 8, maxTouchPoints: 0,
    });
    vi.stubGlobal('screen', { width: 1440, height: 900 });
    vi.stubGlobal('window', { innerWidth: 1440 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.os).toBe('macOS');
  });

  it('detects Linux OS', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64) Firefox/120',
      language: 'en', hardwareConcurrency: 4, maxTouchPoints: 0,
    });
    vi.stubGlobal('screen', { width: 1920, height: 1080 });
    vi.stubGlobal('window', { innerWidth: 1920 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.os).toBe('Linux');
  });

  it('returns Unknown OS for unrecognized UA', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'CustomBot/1.0',
      language: 'en', hardwareConcurrency: 1, maxTouchPoints: 0,
    });
    vi.stubGlobal('screen', { width: 1024, height: 768 });
    vi.stubGlobal('window', { innerWidth: 1024 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.os).toBe('Unknown OS');
  });

  it('detects Edge browser', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 10.0) Chrome/120 Edg/120',
      language: 'en', hardwareConcurrency: 4, maxTouchPoints: 0,
    });
    vi.stubGlobal('screen', { width: 1920, height: 1080 });
    vi.stubGlobal('window', { innerWidth: 1920 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.browser).toContain('Edge');
  });

  it('detects Opera browser', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 Chrome/120 OPR/106',
      language: 'en', hardwareConcurrency: 4, maxTouchPoints: 0,
    });
    vi.stubGlobal('screen', { width: 1920, height: 1080 });
    vi.stubGlobal('window', { innerWidth: 1920 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.browser).toContain('Opera');
  });

  it('detects Firefox browser', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (X11; Linux x86_64; rv:120.0) Gecko/20100101 Firefox/120',
      language: 'en', hardwareConcurrency: 4, maxTouchPoints: 0,
    });
    vi.stubGlobal('screen', { width: 1920, height: 1080 });
    vi.stubGlobal('window', { innerWidth: 1920 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.browser).toContain('Firefox');
  });

  it('detects Safari browser', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17 Safari/605',
      language: 'en', hardwareConcurrency: 8, maxTouchPoints: 0,
    });
    vi.stubGlobal('screen', { width: 1440, height: 900 });
    vi.stubGlobal('window', { innerWidth: 1440 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.browser).toBe('Safari');
  });

  it('returns Unknown Browser for unrecognized UA', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'CustomBot/1.0',
      language: 'en', hardwareConcurrency: 1, maxTouchPoints: 0,
    });
    vi.stubGlobal('screen', { width: 1024, height: 768 });
    vi.stubGlobal('window', { innerWidth: 1024 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.browser).toBe('Unknown Browser');
  });

  it('detects Windows 8.1', async () => {
    vi.stubGlobal('navigator', {
      userAgent: 'Mozilla/5.0 (Windows NT 6.3; Win64; x64) Chrome/120',
      language: 'en', hardwareConcurrency: 4, maxTouchPoints: 0,
    });
    vi.stubGlobal('screen', { width: 1920, height: 1080 });
    vi.stubGlobal('window', { innerWidth: 1920 });
    const { buildFingerprint } = await import('@/lib/device-fingerprint');
    const result = await buildFingerprint();
    expect(result.os).toContain('Windows');
    expect(result.os).toContain('8.1');
  });
});
