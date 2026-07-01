/**
 * Settings Database — compact localStorage-backed implementation.
 * Keeps the existing app APIs stable while auth/onboarding is migrated.
 */

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

const KEYS = {
  profile: "eco_settings_profile",
  language: "eco_settings_language",
  notifications: "eco_settings_notifications",
  appearance: "eco_settings_appearance",
  privacy: "eco_settings_privacy",
  sessions: "eco_settings_sessions",
  notificationItems: "eco_settings_notification_items",
} as const;

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

const DEFAULT_LANGUAGE: LanguagePrefs = { code: "en", unitSystem: "metric", currency: "INR", dateFormat: "DD/MM/YYYY" };
const DEFAULT_NOTIFICATIONS: NotificationPrefs = {
  paused: false, loginAlerts: true, securityAlerts: true, passwordChanges: true, accountUpdates: true,
  dailyCarbonReminders: true, weeklyReports: true, streakReminders: true, challengeUpdates: true,
  badgeUnlocks: true, ecoCoinRewards: true, productUpdates: true, newsletter: false,
  sustainabilityTips: true, monthlySummaries: true, browserNotifications: false, mobileNotifications: false,
  instantAlerts: false, quietFrom: "22:00", quietTo: "07:00", noWeekends: false,
};
const DEFAULT_APPEARANCE: AppearancePrefs = { theme: "system" };
const DEFAULT_PRIVACY: PrivacyPrefs = { profileVisibility: "public", dataSharing: false, analyticsOptIn: false };

function seedNotifications(): NotificationItem[] {
  return [
    { id: "n1", title: "Welcome to GreenStep! 🌿", body: "Your journey to a sustainable lifestyle starts here.", category: "system", read: false, createdAt: new Date().toISOString() },
  ];
}

function seedSessions(): SessionInfo[] {
  return [
    { id: "s-current", device: "Desktop", browser: "Browser", os: "Windows", location: "Haridwar, India", lastActive: new Date().toISOString(), isCurrent: true },
  ];
}

function read<T>(key: string, fallback: T): T {
  if (typeof window === "undefined") return fallback;
  try {
    const raw = localStorage.getItem(key);
    return raw ? { ...fallback, ...JSON.parse(raw) } : fallback;
  } catch {
    return fallback;
  }
}

function write(key: string, value: unknown) {
  if (typeof window !== "undefined") {
    localStorage.setItem(key, JSON.stringify(value));
  }
}

export const SettingsDB = {
  async hydrate() {
    return;
  },
  getProfile(): UserProfile { return read(KEYS.profile, DEFAULT_PROFILE); },
  updateProfile(updates: Partial<UserProfile>): UserProfile {
    const updated = { ...this.getProfile(), ...updates };
    write(KEYS.profile, updated);
    return updated;
  },
  getLanguage(): LanguagePrefs { return read(KEYS.language, DEFAULT_LANGUAGE); },
  updateLanguage(updates: Partial<LanguagePrefs>): LanguagePrefs {
    const updated = { ...this.getLanguage(), ...updates };
    write(KEYS.language, updated);
    return updated;
  },
  getNotificationPrefs(): NotificationPrefs { return read(KEYS.notifications, DEFAULT_NOTIFICATIONS); },
  updateNotificationPrefs(updates: Partial<NotificationPrefs>): NotificationPrefs {
    const updated = { ...this.getNotificationPrefs(), ...updates };
    write(KEYS.notifications, updated);
    return updated;
  },
  getAppearance(): AppearancePrefs { return read(KEYS.appearance, DEFAULT_APPEARANCE); },
  updateAppearance(updates: Partial<AppearancePrefs>): AppearancePrefs {
    const updated = { ...this.getAppearance(), ...updates };
    write(KEYS.appearance, updated);
    return updated;
  },
  getPrivacy(): PrivacyPrefs { return read(KEYS.privacy, DEFAULT_PRIVACY); },
  updatePrivacy(updates: Partial<PrivacyPrefs>): PrivacyPrefs {
    const updated = { ...this.getPrivacy(), ...updates };
    write(KEYS.privacy, updated);
    return updated;
  },
  getSessions(): SessionInfo[] { return read(KEYS.sessions, seedSessions()); },
  removeSession(sessionId: string): SessionInfo[] {
    const updated = this.getSessions().filter((s) => s.id !== sessionId);
    write(KEYS.sessions, updated);
    return updated;
  },
  removeAllOtherSessions(): SessionInfo[] {
    const updated = this.getSessions().filter((s) => s.isCurrent);
    write(KEYS.sessions, updated);
    return updated;
  },
  getNotifications(): NotificationItem[] { return read(KEYS.notificationItems, seedNotifications()); },
  getUnreadCount(): number { return this.getNotifications().filter((n) => !n.read).length; },
  markRead(notificationId: string): NotificationItem[] {
    const updated = this.getNotifications().map((n) => (n.id === notificationId ? { ...n, read: true } : n));
    write(KEYS.notificationItems, updated);
    return updated;
  },
  markAllRead(): NotificationItem[] {
    const updated = this.getNotifications().map((n) => ({ ...n, read: true }));
    write(KEYS.notificationItems, updated);
    return updated;
  },
  deleteNotification(notificationId: string): NotificationItem[] {
    const updated = this.getNotifications().filter((n) => n.id !== notificationId);
    write(KEYS.notificationItems, updated);
    return updated;
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
  deleteAccount() {
    Object.values(KEYS).forEach((key) => typeof window !== "undefined" && localStorage.removeItem(key));
  },
  async hashPassword(password: string): Promise<string> {
    const encoder = new TextEncoder();
    const data = encoder.encode(password + "_greenstep_salt");
    const hashBuffer = await crypto.subtle.digest("SHA-256", data);
    return Array.from(new Uint8Array(hashBuffer)).map((b) => b.toString(16).padStart(2, "0")).join("");
  },
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return (await this.hashPassword(password)) === hash;
  },
};
