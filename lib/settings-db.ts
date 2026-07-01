/**
 * Settings Database — Supabase-backed user settings cache.
 * The UI keeps the same synchronous API, but persistence is handled by
 * the `user_settings` table instead of browser storage.
 */

import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string;
  createdAt: string;
  lastLogin: string;
  passwordHash: string;
}

export interface LanguagePrefs {
  code: string;
  unitSystem: "metric" | "imperial";
  currency: string;
  dateFormat: string;
}

export interface NotificationPrefs {
  paused: boolean;
  loginAlerts: boolean;
  securityAlerts: boolean;
  passwordChanges: boolean;
  accountUpdates: boolean;
  dailyCarbonReminders: boolean;
  weeklyReports: boolean;
  streakReminders: boolean;
  challengeUpdates: boolean;
  badgeUnlocks: boolean;
  ecoCoinRewards: boolean;
  productUpdates: boolean;
  newsletter: boolean;
  sustainabilityTips: boolean;
  monthlySummaries: boolean;
  browserNotifications: boolean;
  mobileNotifications: boolean;
  instantAlerts: boolean;
  quietFrom: string;
  quietTo: string;
  noWeekends: boolean;
}

export interface AppearancePrefs {
  theme: "light" | "dark" | "system";
}

export interface PrivacyPrefs {
  profileVisibility: "public" | "friends" | "private";
  dataSharing: boolean;
  analyticsOptIn: boolean;
}

export interface SessionInfo {
  id: string;
  device: string;
  browser: string;
  os: string;
  location: string;
  lastActive: string;
  isCurrent: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: "account" | "eco" | "email" | "system";
  read: boolean;
  createdAt: string;
}

export interface AllSettings {
  profile: UserProfile;
  language: LanguagePrefs;
  notifications: NotificationPrefs;
  appearance: AppearancePrefs;
  privacy: PrivacyPrefs;
  sessions: SessionInfo[];
  notificationItems: NotificationItem[];
}

type SettingsRow = {
  profile: UserProfile;
  language: LanguagePrefs;
  notifications: NotificationPrefs;
  appearance: AppearancePrefs;
  privacy: PrivacyPrefs;
  sessions: SessionInfo[];
  notificationItems: NotificationItem[];
};

const DEFAULT_PROFILE: UserProfile = {
  id: crypto.randomUUID?.() || Math.random().toString(36).slice(2),
  name: "",
  username: "",
  email: "",
  phone: "",
  bio: "",
  avatar: "",
  createdAt: new Date().toISOString(),
  lastLogin: new Date().toISOString(),
  passwordHash: "",
};

const DEFAULT_LANGUAGE: LanguagePrefs = {
  code: "en",
  unitSystem: "metric",
  currency: "INR",
  dateFormat: "DD/MM/YYYY",
};

const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  paused: false,
  loginAlerts: true,
  securityAlerts: true,
  passwordChanges: true,
  accountUpdates: true,
  dailyCarbonReminders: true,
  weeklyReports: true,
  streakReminders: true,
  challengeUpdates: true,
  badgeUnlocks: true,
  ecoCoinRewards: true,
  productUpdates: true,
  newsletter: false,
  sustainabilityTips: true,
  monthlySummaries: true,
  browserNotifications: false,
  mobileNotifications: false,
  instantAlerts: false,
  quietFrom: "22:00",
  quietTo: "07:00",
  noWeekends: false,
};

const DEFAULT_APPEARANCE: AppearancePrefs = { theme: "system" };
const DEFAULT_PRIVACY: PrivacyPrefs = { profileVisibility: "public", dataSharing: false, analyticsOptIn: false };

function seedNotifications(): NotificationItem[] {
  const now = Date.now();
  return [
    { id: "n1", title: "Welcome to GreenStep! 🌿", body: "Your journey to a sustainable lifestyle starts here. Track your first carbon footprint entry today.", category: "system", read: false, createdAt: new Date(now - 1000 * 60 * 5).toISOString() },
    { id: "n2", title: "New Badge Unlocked: First Steps 🏅", body: "Congratulations! You've logged your first carbon entry and earned the First Steps badge.", category: "eco", read: false, createdAt: new Date(now - 1000 * 60 * 30).toISOString() },
    { id: "n3", title: "Weekly Report Available 📊", body: "Your carbon footprint summary for this week is ready. You reduced 12% compared to last week!", category: "eco", read: false, createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString() },
    { id: "n4", title: "Security Alert: New Login", body: "A new login was detected from Chrome on Windows. If this wasn't you, change your password immediately.", category: "account", read: true, createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString() },
    { id: "n5", title: "Challenge: Zero Waste Week 🌍", body: "A new community challenge is starting! Join Zero Waste Week and earn 100 eco-coins.", category: "eco", read: false, createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString() },
    { id: "n6", title: "Sustainability Tip 💡", body: "Switch to LED bulbs to save up to 75% energy. That's roughly 40kg CO₂ saved per year per household.", category: "email", read: true, createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString() },
  ];
}

function seedSessions(): SessionInfo[] {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isWindows = ua.includes("Windows");
  const isMac = ua.includes("Mac");
  const isChrome = ua.includes("Chrome");
  const isFirefox = ua.includes("Firefox");

  return [
    { id: "s-current", device: "Desktop", browser: isChrome ? "Chrome" : isFirefox ? "Firefox" : "Browser", os: isWindows ? "Windows 11" : isMac ? "macOS" : "Linux", location: "Haridwar, India", lastActive: new Date().toISOString(), isCurrent: true },
    { id: "s2", device: "Mobile", browser: "Safari", os: "iOS 18", location: "Delhi, India", lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(), isCurrent: false },
    { id: "s3", device: "Desktop", browser: "Firefox", os: "macOS Sequoia", location: "Mumbai, India", lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(), isCurrent: false },
  ];
}

const DEFAULT_SETTINGS: SettingsRow = {
  profile: DEFAULT_PROFILE,
  language: DEFAULT_LANGUAGE,
  notifications: DEFAULT_NOTIFICATIONS,
  appearance: DEFAULT_APPEARANCE,
  privacy: DEFAULT_PRIVACY,
  sessions: seedSessions(),
  notificationItems: seedNotifications(),
};

function clone<T>(value: T): T {
  return JSON.parse(JSON.stringify(value)) as T;
}

function mergeSettings(row: Partial<SettingsRow> | null | undefined): SettingsRow {
  return {
    profile: { ...DEFAULT_PROFILE, ...(row?.profile ?? {}) },
    language: { ...DEFAULT_LANGUAGE, ...(row?.language ?? {}) },
    notifications: { ...DEFAULT_NOTIFICATIONS, ...(row?.notifications ?? {}) },
    appearance: { ...DEFAULT_APPEARANCE, ...(row?.appearance ?? {}) },
    privacy: { ...DEFAULT_PRIVACY, ...(row?.privacy ?? {}) },
    sessions: row?.sessions && row.sessions.length > 0 ? row.sessions : seedSessions(),
    notificationItems: row?.notificationItems && row.notificationItems.length > 0 ? row.notificationItems : seedNotifications(),
  };
}

let currentSettings: SettingsRow = clone(DEFAULT_SETTINGS);
let loadPromise: Promise<void> | null = null;

async function getCurrentUserId(): Promise<string | null> {
  if (!isSupabaseConfigured()) return null;
  const supabase = createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

async function persistSettings(): Promise<void> {
  const userId = await getCurrentUserId();
  if (!userId) return;

  const supabase = createClient();
  await supabase.from("user_settings").upsert({
    user_id: userId,
    profile: currentSettings.profile,
    language: currentSettings.language,
    notifications: currentSettings.notifications,
    appearance: currentSettings.appearance,
    privacy: currentSettings.privacy,
    sessions: currentSettings.sessions,
    notification_items: currentSettings.notificationItems,
    updated_at: new Date().toISOString(),
  });
}

async function loadSettings(): Promise<SettingsRow> {
  if (loadPromise) {
    await loadPromise;
    return clone(currentSettings);
  }

  loadPromise = (async () => {
    const userId = await getCurrentUserId();
    if (!userId) {
      currentSettings = clone(DEFAULT_SETTINGS);
      return;
    }

    const supabase = createClient();
    const { data, error } = await supabase
      .from("user_settings")
      .select("profile, language, notifications, appearance, privacy, sessions, notification_items")
      .eq("user_id", userId)
      .maybeSingle();

    if (error) {
      currentSettings = clone(DEFAULT_SETTINGS);
      return;
    }

    currentSettings = mergeSettings(data as Partial<SettingsRow> | null);

    await supabase.from("user_settings").upsert({
      user_id: userId,
      profile: currentSettings.profile,
      language: currentSettings.language,
      notifications: currentSettings.notifications,
      appearance: currentSettings.appearance,
      privacy: currentSettings.privacy,
      sessions: currentSettings.sessions,
      notification_items: currentSettings.notificationItems,
      updated_at: new Date().toISOString(),
    });
  })();

  await loadPromise.finally(() => {
    loadPromise = null;
  });

  return clone(currentSettings);
}

function ensureSettingsLoaded() {
  if (!isSupabaseConfigured()) return;
  if (!loadPromise && currentSettings.profile.id === DEFAULT_SETTINGS.profile.id) {
    void loadSettings();
  }
}

function schedulePersist() {
  void persistSettings();
}

export const SettingsDB = {
  hydrate(): Promise<SettingsRow> {
    return loadSettings();
  },

  getProfile(): UserProfile {
    ensureSettingsLoaded();
    return clone(currentSettings.profile);
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile {
    currentSettings = { ...currentSettings, profile: { ...currentSettings.profile, ...updates } };
    schedulePersist();
    return clone(currentSettings.profile);
  },

  getLanguage(): LanguagePrefs {
    ensureSettingsLoaded();
    return clone(currentSettings.language);
  },

  updateLanguage(updates: Partial<LanguagePrefs>): LanguagePrefs {
    currentSettings = { ...currentSettings, language: { ...currentSettings.language, ...updates } };
    schedulePersist();
    return clone(currentSettings.language);
  },

  getNotificationPrefs(): NotificationPrefs {
    ensureSettingsLoaded();
    return clone(currentSettings.notifications);
  },

  updateNotificationPrefs(updates: Partial<NotificationPrefs>): NotificationPrefs {
    currentSettings = { ...currentSettings, notifications: { ...currentSettings.notifications, ...updates } };
    schedulePersist();
    return clone(currentSettings.notifications);
  },

  getAppearance(): AppearancePrefs {
    ensureSettingsLoaded();
    return clone(currentSettings.appearance);
  },

  updateAppearance(updates: Partial<AppearancePrefs>): AppearancePrefs {
    currentSettings = { ...currentSettings, appearance: { ...currentSettings.appearance, ...updates } };
    schedulePersist();
    return clone(currentSettings.appearance);
  },

  getPrivacy(): PrivacyPrefs {
    ensureSettingsLoaded();
    return clone(currentSettings.privacy);
  },

  updatePrivacy(updates: Partial<PrivacyPrefs>): PrivacyPrefs {
    currentSettings = { ...currentSettings, privacy: { ...currentSettings.privacy, ...updates } };
    schedulePersist();
    return clone(currentSettings.privacy);
  },

  getSessions(): SessionInfo[] {
    ensureSettingsLoaded();
    return clone(currentSettings.sessions);
  },

  removeSession(sessionId: string): SessionInfo[] {
    currentSettings = { ...currentSettings, sessions: currentSettings.sessions.filter((s) => s.id !== sessionId) };
    schedulePersist();
    return clone(currentSettings.sessions);
  },

  removeAllOtherSessions(): SessionInfo[] {
    currentSettings = { ...currentSettings, sessions: currentSettings.sessions.filter((s) => s.isCurrent) };
    schedulePersist();
    return clone(currentSettings.sessions);
  },

  getNotifications(): NotificationItem[] {
    ensureSettingsLoaded();
    return clone(currentSettings.notificationItems);
  },

  getUnreadCount(): number {
    return currentSettings.notificationItems.filter((n) => !n.read).length;
  },

  markRead(notificationId: string): NotificationItem[] {
    currentSettings = { ...currentSettings, notificationItems: currentSettings.notificationItems.map((n) => (n.id === notificationId ? { ...n, read: true } : n)) };
    schedulePersist();
    return clone(currentSettings.notificationItems);
  },

  markAllRead(): NotificationItem[] {
    currentSettings = { ...currentSettings, notificationItems: currentSettings.notificationItems.map((n) => ({ ...n, read: true })) };
    schedulePersist();
    return clone(currentSettings.notificationItems);
  },

  deleteNotification(notificationId: string): NotificationItem[] {
    currentSettings = { ...currentSettings, notificationItems: currentSettings.notificationItems.filter((n) => n.id !== notificationId) };
    schedulePersist();
    return clone(currentSettings.notificationItems);
  },

  exportAllData(): AllSettings {
    return {
      profile: this.getProfile(),
      language: this.getLanguage(),
      notifications: this.getNotificationPrefs(),
      appearance: this.getAppearance(),
      privacy: this.getPrivacy(),
      sessions: this.getSessions(),
      notificationItems: this.getNotifications(),
    };
  },

  async deleteAccount(): Promise<void> {
    const userId = await getCurrentUserId();
    if (userId && isSupabaseConfigured()) {
      const supabase = createClient();
      await supabase.from("user_settings").delete().eq("user_id", userId);
    }
    currentSettings = clone(DEFAULT_SETTINGS);
  },

  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "_greenstep_salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
  },

  async verifyPassword(password: string, hash: string): Promise<boolean> {
    const computed = await this.hashPassword(password);
    return computed === hash;
  },
};
