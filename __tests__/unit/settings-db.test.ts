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
vi.stubGlobal('navigator', { userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/120' });
vi.stubGlobal('crypto', {
  randomUUID: () => 'test-uuid-1234',
  subtle: {
    digest: vi.fn().mockResolvedValue(new ArrayBuffer(32)),
  },
});
vi.stubGlobal('TextEncoder', class { encode(s: string) { return new Uint8Array(s.split('').map(c => c.charCodeAt(0))); } });

import { SettingsDB } from '@/lib/settings-db';

describe('SettingsDB', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    Object.keys(store).forEach(k => delete store[k]);
  });

  // ── Profile ──
  describe('getProfile', () => {
    it('returns default profile when empty', () => {
      const profile = SettingsDB.getProfile();
      expect(profile).toHaveProperty('id');
      expect(profile).toHaveProperty('name');
      expect(profile).toHaveProperty('email');
      expect(profile.createdAt).toBeTruthy();
    });

    it('reads stored profile', () => {
      store['eco_settings_profile'] = JSON.stringify({ name: 'Test User', email: 'test@test.com' });
      const profile = SettingsDB.getProfile();
      expect(profile.name).toBe('Test User');
      expect(profile.email).toBe('test@test.com');
    });
  });

  describe('updateProfile', () => {
    it('merges updates into profile', () => {
      const updated = SettingsDB.updateProfile({ name: 'New Name', bio: 'Hello' });
      expect(updated.name).toBe('New Name');
      expect(updated.bio).toBe('Hello');
      expect(mockLocalStorage.setItem).toHaveBeenCalled();
    });

    it('syncs to legacy eco_user key', () => {
      SettingsDB.updateProfile({ name: 'Legacy', email: 'legacy@test.com' });
      const legacyCall = mockLocalStorage.setItem.mock.calls.find(
        (c: string[]) => c[0] === 'eco_user'
      );
      expect(legacyCall).toBeTruthy();
    });
  });

  // ── Language ──
  describe('getLanguage', () => {
    it('returns defaults', () => {
      const lang = SettingsDB.getLanguage();
      expect(lang.code).toBe('en');
      expect(lang.unitSystem).toBe('metric');
      expect(lang.currency).toBe('INR');
    });
  });

  describe('updateLanguage', () => {
    it('updates language code', () => {
      const updated = SettingsDB.updateLanguage({ code: 'hi' });
      expect(updated.code).toBe('hi');
      expect(updated.currency).toBe('INR'); // preserved
    });
  });

  // ── Notifications ──
  describe('getNotificationPrefs', () => {
    it('returns defaults', () => {
      const prefs = SettingsDB.getNotificationPrefs();
      expect(prefs.paused).toBe(false);
      expect(prefs.loginAlerts).toBe(true);
      expect(prefs.dailyCarbonReminders).toBe(true);
    });
  });

  describe('updateNotificationPrefs', () => {
    it('toggles paused', () => {
      const updated = SettingsDB.updateNotificationPrefs({ paused: true });
      expect(updated.paused).toBe(true);
    });
  });

  // ── Appearance ──
  describe('getAppearance', () => {
    it('returns system theme by default', () => {
      expect(SettingsDB.getAppearance().theme).toBe('system');
    });
  });

  describe('updateAppearance', () => {
    it('changes theme', () => {
      const updated = SettingsDB.updateAppearance({ theme: 'dark' });
      expect(updated.theme).toBe('dark');
    });
  });

  // ── Privacy ──
  describe('getPrivacy', () => {
    it('returns defaults', () => {
      const priv = SettingsDB.getPrivacy();
      expect(priv.profileVisibility).toBe('public');
      expect(priv.dataSharing).toBe(false);
    });
  });

  describe('updatePrivacy', () => {
    it('updates privacy settings', () => {
      const updated = SettingsDB.updatePrivacy({ profileVisibility: 'private', dataSharing: true });
      expect(updated.profileVisibility).toBe('private');
      expect(updated.dataSharing).toBe(true);
    });
  });

  // ── Notification Items ──
  describe('getNotifications', () => {
    it('seeds notifications on first call', () => {
      const items = SettingsDB.getNotifications();
      expect(items.length).toBeGreaterThan(0);
      expect(items[0]).toHaveProperty('id');
      expect(items[0]).toHaveProperty('title');
      expect(items[0]).toHaveProperty('category');
    });
  });

  describe('getUnreadCount', () => {
    it('counts unread notifications', () => {
      store['eco_settings_notification_items'] = JSON.stringify([
        { id: '1', read: false }, { id: '2', read: true }, { id: '3', read: false },
      ]);
      expect(SettingsDB.getUnreadCount()).toBe(2);
    });
  });

  describe('markRead', () => {
    it('marks a single notification as read', () => {
      store['eco_settings_notification_items'] = JSON.stringify([
        { id: '1', title: 'A', read: false },
        { id: '2', title: 'B', read: false },
      ]);
      const items = SettingsDB.markRead('1');
      const n1 = items.find((n: { id: string }) => n.id === '1');
      expect(n1?.read).toBe(true);
    });
  });

  describe('markAllRead', () => {
    it('marks all notifications as read', () => {
      store['eco_settings_notification_items'] = JSON.stringify([
        { id: '1', read: false }, { id: '2', read: false },
      ]);
      const items = SettingsDB.markAllRead();
      expect(items.every((n: { read: boolean }) => n.read)).toBe(true);
    });
  });

  describe('deleteNotification', () => {
    it('removes notification by id', () => {
      store['eco_settings_notification_items'] = JSON.stringify([
        { id: '1' }, { id: '2' },
      ]);
      const items = SettingsDB.deleteNotification('1');
      expect(items).toHaveLength(1);
      expect(items[0].id).toBe('2');
    });
  });

  // ── Sessions ──
  describe('getSessions', () => {
    it('seeds sessions on first call', () => {
      const sessions = SettingsDB.getSessions();
      expect(sessions.length).toBeGreaterThan(0);
      expect(sessions[0]).toHaveProperty('id');
      expect(sessions[0]).toHaveProperty('device');
    });
  });

  describe('removeSession', () => {
    it('removes session by id', () => {
      store['eco_settings_sessions'] = JSON.stringify([
        { id: 's1', isCurrent: true }, { id: 's2', isCurrent: false },
      ]);
      const sessions = SettingsDB.removeSession('s2');
      expect(sessions).toHaveLength(1);
      expect(sessions[0].id).toBe('s1');
    });
  });

  describe('removeAllOtherSessions', () => {
    it('keeps only current session', () => {
      store['eco_settings_sessions'] = JSON.stringify([
        { id: 's1', isCurrent: true }, { id: 's2', isCurrent: false }, { id: 's3', isCurrent: false },
      ]);
      const sessions = SettingsDB.removeAllOtherSessions();
      expect(sessions).toHaveLength(1);
      expect(sessions[0].isCurrent).toBe(true);
    });
  });

  // ── Utilities ──
  describe('exportAllData', () => {
    it('returns all settings sections', () => {
      const all = SettingsDB.exportAllData();
      expect(all).toHaveProperty('profile');
      expect(all).toHaveProperty('language');
      expect(all).toHaveProperty('notifications');
      expect(all).toHaveProperty('appearance');
      expect(all).toHaveProperty('privacy');
      expect(all).toHaveProperty('sessions');
      expect(all).toHaveProperty('notificationItems');
    });
  });

  describe('deleteAccount', () => {
    it('clears all storage keys', () => {
      store['eco_settings_profile'] = '{}';
      store['eco_settings_language'] = '{}';
      store['eco_user'] = '{}';
      SettingsDB.deleteAccount();
      expect(mockLocalStorage.removeItem).toHaveBeenCalled();
    });
  });
});
