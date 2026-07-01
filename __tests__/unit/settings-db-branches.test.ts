import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock localStorage
const store: Record<string, string> = {};
const mockLocalStorage = {
  getItem: vi.fn((key: string) => store[key] ?? null),
  setItem: vi.fn((key: string, value: string) => { store[key] = value; }),
  removeItem: vi.fn((key: string) => { delete store[key]; }),
};

vi.stubGlobal('window', {});
vi.stubGlobal('localStorage', mockLocalStorage);
vi.stubGlobal('navigator', { userAgent: 'Chrome' });
vi.stubGlobal('crypto', { randomUUID: () => 'id' });

import { SettingsDB } from '@/lib/settings-db';

describe('SettingsDB branch coverage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(store).forEach(k => delete store[k]);
  });

  // ── Migration branches ──
  describe('legacy migration', () => {
    it('migrates language from legacy eco_language key', () => {
      store['eco_language'] = JSON.stringify({ code: 'hi', unitSystem: 'metric', currency: 'INR', dateFormat: 'DD/MM/YYYY' });
      SettingsDB.getProfile(); // triggers migration
      const lang = SettingsDB.getLanguage();
      expect(lang.code).toBe('hi');
    });

    it('handles corrupt eco_language JSON', () => {
      store['eco_language'] = '{bad json';
      const profile = SettingsDB.getProfile();
      expect(profile).toBeTruthy();
    });
  });

  // ── read() fallback branches ──
  describe('read() helper branches', () => {
    it('returns fallback for corrupt stored data', () => {
      store['eco_settings_profile'] = '{not-json';
      const profile = SettingsDB.getProfile();
      expect(profile).toHaveProperty('id'); // should return default
    });

    it('returns fallback for null stored data', () => {
      // Note: after migration tests run, the store may contain migrated values.
      // This tests that read() with an empty key returns the default structure.
      const appearance = SettingsDB.getAppearance();
      expect(appearance.theme).toBe('system');
    });
  });

  // ── getSessions branches ──
  describe('sessions branches', () => {
    it('handles corrupt sessions JSON', () => {
      store['eco_settings_sessions'] = 'corrupt';
      const sessions = SettingsDB.getSessions();
      expect(sessions.length).toBeGreaterThan(0); // seeds fallback
    });
  });

  // ── getNotifications branches ──
  describe('notifications branches', () => {
    it('handles corrupt notification items JSON', () => {
      store['eco_settings_notification_items'] = '{bad';
      const items = SettingsDB.getNotifications();
      expect(items.length).toBeGreaterThan(0); // seeds fallback
    });
  });

  // ── hashPassword / verifyPassword branches ──
  describe('password hashing', () => {
    it('hashPassword returns hex string', async () => {
      vi.stubGlobal('crypto', {
        randomUUID: () => 'id',
        subtle: {
          digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
        },
      });
      vi.stubGlobal('TextEncoder', class { encode() { return new Uint8Array(10); } });
      const hash = await SettingsDB.hashPassword('test123');
      expect(hash).toMatch(/^[0-9a-f]+$/);
    });

    it('verifyPassword returns true for matching passwords', async () => {
      vi.stubGlobal('crypto', {
        randomUUID: () => 'id',
        subtle: {
          digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
        },
      });
      vi.stubGlobal('TextEncoder', class { encode() { return new Uint8Array(10); } });
      const hash = await SettingsDB.hashPassword('test123');
      const match = await SettingsDB.verifyPassword('test123', hash);
      expect(match).toBe(true);
    });

    it('verifyPassword returns false for wrong password', async () => {
      const callCount = { n: 0 };
      vi.stubGlobal('crypto', {
        randomUUID: () => 'id',
        subtle: {
          digest: vi.fn().mockImplementation(() => {
            callCount.n++;
            const buf = new ArrayBuffer(32);
            const view = new Uint8Array(buf);
            view[0] = callCount.n; // Different result each call
            return Promise.resolve(buf);
          }),
        },
      });
      vi.stubGlobal('TextEncoder', class { encode() { return new Uint8Array(10); } });
      const hash = await SettingsDB.hashPassword('correct');
      const match = await SettingsDB.verifyPassword('wrong', hash);
      expect(match).toBe(false);
    });
  });
});
