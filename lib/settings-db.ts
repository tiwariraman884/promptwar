/**
 * Settings Database — Unified localStorage persistence layer
 * All user settings flow through this module.
 * When Supabase is connected, swap the storage calls here.
 */

/* ─── Types ─── */

export interface UserProfile {
  id: string;
  name: string;
  username: string;
  email: string;
  phone: string;
  bio: string;
  avatar: string; // base64 data URL or empty
  createdAt: string; // ISO date
  lastLogin: string; // ISO date
  passwordHash: string; // SHA-256 hex for demo
}

export interface LanguagePrefs {
  code: string;
  unitSystem: "metric" | "imperial";
  currency: string;
  dateFormat: string;
}

export interface NotificationPrefs {
  paused: boolean;
  // Account
  loginAlerts: boolean;
  securityAlerts: boolean;
  passwordChanges: boolean;
  accountUpdates: boolean;
  // Eco Platform
  dailyCarbonReminders: boolean;
  weeklyReports: boolean;
  streakReminders: boolean;
  challengeUpdates: boolean;
  badgeUnlocks: boolean;
  ecoCoinRewards: boolean;
  // Email
  productUpdates: boolean;
  newsletter: boolean;
  sustainabilityTips: boolean;
  monthlySummaries: boolean;
  // Push
  browserNotifications: boolean;
  mobileNotifications: boolean;
  instantAlerts: boolean;
  // Schedule
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
  device: string; // "Desktop" | "Mobile" | "Tablet"
  browser: string;
  os: string;
  location: string;
  lastActive: string; // ISO date
  isCurrent: boolean;
}

export interface NotificationItem {
  id: string;
  title: string;
  body: string;
  category: "account" | "eco" | "email" | "system";
  read: boolean;
  createdAt: string; // ISO date
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

/* ─── Defaults ─── */

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

const DEFAULT_APPEARANCE: AppearancePrefs = {
  theme: "system",
};

const DEFAULT_PRIVACY: PrivacyPrefs = {
  profileVisibility: "public",
  dataSharing: false,
  analyticsOptIn: false,
};

/* ─── Seed notifications ─── */
function seedNotifications(): NotificationItem[] {
  const now = Date.now();
  return [
    {
      id: "n1",
      title: "Welcome to GreenStep! 🌿",
      body: "Your journey to a sustainable lifestyle starts here. Track your first carbon footprint entry today.",
      category: "system",
      read: false,
      createdAt: new Date(now - 1000 * 60 * 5).toISOString(),
    },
    {
      id: "n2",
      title: "New Badge Unlocked: First Steps 🏅",
      body: "Congratulations! You've logged your first carbon entry and earned the First Steps badge.",
      category: "eco",
      read: false,
      createdAt: new Date(now - 1000 * 60 * 30).toISOString(),
    },
    {
      id: "n3",
      title: "Weekly Report Available 📊",
      body: "Your carbon footprint summary for this week is ready. You reduced 12% compared to last week!",
      category: "eco",
      read: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 2).toISOString(),
    },
    {
      id: "n4",
      title: "Security Alert: New Login",
      body: "A new login was detected from Chrome on Windows. If this wasn't you, change your password immediately.",
      category: "account",
      read: true,
      createdAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: "n5",
      title: "Challenge: Zero Waste Week 🌍",
      body: "A new community challenge is starting! Join Zero Waste Week and earn 100 eco-coins.",
      category: "eco",
      read: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
    },
    {
      id: "n6",
      title: "Sustainability Tip 💡",
      body: "Switch to LED bulbs to save up to 75% energy. That's roughly 40kg CO₂ saved per year per household.",
      category: "email",
      read: true,
      createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
    },
  ];
}

/* ─── Seed sessions ─── */
function seedSessions(): SessionInfo[] {
  const ua = typeof navigator !== "undefined" ? navigator.userAgent : "";
  const isWindows = ua.includes("Windows");
  const isMac = ua.includes("Mac");
  const isChrome = ua.includes("Chrome");
  const isFirefox = ua.includes("Firefox");

  return [
    {
      id: "s-current",
      device: "Desktop",
      browser: isChrome ? "Chrome" : isFirefox ? "Firefox" : "Browser",
      os: isWindows ? "Windows 11" : isMac ? "macOS" : "Linux",
      location: "Haridwar, India",
      lastActive: new Date().toISOString(),
      isCurrent: true,
    },
    {
      id: "s2",
      device: "Mobile",
      browser: "Safari",
      os: "iOS 18",
      location: "Delhi, India",
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 3).toISOString(),
      isCurrent: false,
    },
    {
      id: "s3",
      device: "Desktop",
      browser: "Firefox",
      os: "macOS Sequoia",
      location: "Mumbai, India",
      lastActive: new Date(Date.now() - 1000 * 60 * 60 * 24 * 2).toISOString(),
      isCurrent: false,
    },
  ];
}

/* ─── Storage Keys ─── */
const KEYS = {
  profile: "eco_settings_profile",
  language: "eco_settings_language",
  notifications: "eco_settings_notifications",
  appearance: "eco_settings_appearance",
  privacy: "eco_settings_privacy",
  sessions: "eco_settings_sessions",
  notificationItems: "eco_settings_notification_items",
} as const;

/* ─── Helpers ─── */

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window === "undefined") return;
  localStorage.setItem(key, JSON.stringify(value));
}

/* ─── Migration ─── */
function migrateFromLegacy(profile: UserProfile): UserProfile {
  if (typeof window === "undefined") return profile;

  // Also migrate old notification prefs
  try {
    const oldLang = localStorage.getItem("eco_language");
    if (oldLang) {
      const parsed = JSON.parse(oldLang);
      const lang = read(KEYS.language, DEFAULT_LANGUAGE);
      if (parsed.code && lang.code === "en") {
        lang.code = parsed.code;
        if (parsed.unitSystem) lang.unitSystem = parsed.unitSystem;
        if (parsed.currency) lang.currency = parsed.currency;
        if (parsed.dateFormat) lang.dateFormat = parsed.dateFormat;
        write(KEYS.language, lang);
      }
    }
  } catch { /* ignore */ }

  return profile;
}

/* ─── Public API ─── */

export const SettingsDB = {
  // ── Profile ──
  getProfile(): UserProfile {
    let profile = read(KEYS.profile, DEFAULT_PROFILE);
    profile = migrateFromLegacy(profile);
    return profile;
  },

  updateProfile(updates: Partial<UserProfile>): UserProfile {
    const current = this.getProfile();
    const updated = { ...current, ...updates };
    write(KEYS.profile, updated);
    return updated;
  },

  // ── Language ──
  getLanguage(): LanguagePrefs {
    return read(KEYS.language, DEFAULT_LANGUAGE);
  },

  updateLanguage(updates: Partial<LanguagePrefs>): LanguagePrefs {
    const current = this.getLanguage();
    const updated = { ...current, ...updates };
    write(KEYS.language, updated);
    // Backward compat
    if (typeof window !== "undefined") {
      localStorage.setItem("eco_language", JSON.stringify(updated));
    }
    return updated;
  },

  // ── Notifications ──
  getNotificationPrefs(): NotificationPrefs {
    return read(KEYS.notifications, DEFAULT_NOTIFICATIONS);
  },

  updateNotificationPrefs(updates: Partial<NotificationPrefs>): NotificationPrefs {
    const current = this.getNotificationPrefs();
    const updated = { ...current, ...updates };
    write(KEYS.notifications, updated);
    return updated;
  },

  // ── Appearance ──
  getAppearance(): AppearancePrefs {
    return read(KEYS.appearance, DEFAULT_APPEARANCE);
  },

  updateAppearance(updates: Partial<AppearancePrefs>): AppearancePrefs {
    const current = this.getAppearance();
    const updated = { ...current, ...updates };
    write(KEYS.appearance, updated);
    return updated;
  },

  // ── Privacy ──
  getPrivacy(): PrivacyPrefs {
    return read(KEYS.privacy, DEFAULT_PRIVACY);
  },

  updatePrivacy(updates: Partial<PrivacyPrefs>): PrivacyPrefs {
    const current = this.getPrivacy();
    const updated = { ...current, ...updates };
    write(KEYS.privacy, updated);
    return updated;
  },

  // ── Sessions ──
  getSessions(): SessionInfo[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(KEYS.sessions);
      if (!raw) {
        const seeded = seedSessions();
        write(KEYS.sessions, seeded);
        return seeded;
      }
      return JSON.parse(raw);
    } catch {
      return seedSessions();
    }
  },

  removeSession(sessionId: string): SessionInfo[] {
    const sessions = this.getSessions().filter((s) => s.id !== sessionId);
    write(KEYS.sessions, sessions);
    return sessions;
  },

  removeAllOtherSessions(): SessionInfo[] {
    const sessions = this.getSessions().filter((s) => s.isCurrent);
    write(KEYS.sessions, sessions);
    return sessions;
  },

  // ── Notification Items ──
  getNotifications(): NotificationItem[] {
    if (typeof window === "undefined") return [];
    try {
      const raw = localStorage.getItem(KEYS.notificationItems);
      if (!raw) {
        const seeded = seedNotifications();
        write(KEYS.notificationItems, seeded);
        return seeded;
      }
      return JSON.parse(raw);
    } catch {
      return seedNotifications();
    }
  },

  getUnreadCount(): number {
    return this.getNotifications().filter((n) => !n.read).length;
  },

  markRead(notificationId: string): NotificationItem[] {
    const items = this.getNotifications().map((n) =>
      n.id === notificationId ? { ...n, read: true } : n
    );
    write(KEYS.notificationItems, items);
    return items;
  },

  markAllRead(): NotificationItem[] {
    const items = this.getNotifications().map((n) => ({ ...n, read: true }));
    write(KEYS.notificationItems, items);
    return items;
  },

  deleteNotification(notificationId: string): NotificationItem[] {
    const items = this.getNotifications().filter((n) => n.id !== notificationId);
    write(KEYS.notificationItems, items);
    return items;
  },

  // ── Utilities ──
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

  deleteAccount() {
    Object.values(KEYS).forEach((key) => {
      if (typeof window !== "undefined") localStorage.removeItem(key);
    });
    if (typeof window !== "undefined") {
      localStorage.removeItem("eco_language");
      localStorage.removeItem("eco_notifications");
      localStorage.removeItem("greenstep-theme");
      localStorage.removeItem("greenstep-onboarding");
    }
  },

  // ── Password hashing (demo SHA-256) ──
  async hashPassword(password: string): Promise<string> {
    if (typeof window === "undefined") return password;
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
