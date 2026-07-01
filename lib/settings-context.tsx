"use client";

import { createContext, useCallback, useContext, useEffect, useState, type ReactNode } from "react";
import {
  SettingsDB,
  type UserProfile,
  type LanguagePrefs,
  type NotificationPrefs,
  type AppearancePrefs,
  type PrivacyPrefs,
  type SessionInfo,
  type NotificationItem,
} from "@/lib/settings-db";

/* ─── Context Shape ─── */

interface SettingsContextValue {
  // Data
  profile: UserProfile;
  language: LanguagePrefs;
  notifications: NotificationPrefs;
  appearance: AppearancePrefs;
  privacy: PrivacyPrefs;
  sessions: SessionInfo[];
  notificationItems: NotificationItem[];
  unreadCount: number;
  loaded: boolean;

  // Actions
  updateProfile: (updates: Partial<UserProfile>) => void;
  updateLanguage: (updates: Partial<LanguagePrefs>) => void;
  updateNotifications: (updates: Partial<NotificationPrefs>) => void;
  updateAppearance: (updates: Partial<AppearancePrefs>) => void;
  updatePrivacy: (updates: Partial<PrivacyPrefs>) => void;
  removeSession: (id: string) => void;
  removeAllOtherSessions: () => void;
  markNotificationRead: (id: string) => void;
  markAllNotificationsRead: () => void;
  deleteNotification: (id: string) => void;
  exportData: () => void;
  deleteAccount: () => void;
  reload: () => void;
}

const SettingsContext = createContext<SettingsContextValue | null>(null);

/* ─── Provider ─── */

export function SettingsProvider({ children }: { children: ReactNode }) {
  // Initialize with static defaults to match server render (no localStorage access).
  // The useEffect below hydrates from localStorage after mount.
  const [profile, setProfile] = useState<UserProfile>({
    id: "", name: "", username: "", email: "", phone: "", bio: "", avatar: "",
    createdAt: "", lastLogin: "", passwordHash: "",
  });
  const [language, setLanguage] = useState<LanguagePrefs>({
    code: "en", unitSystem: "metric", currency: "INR", dateFormat: "DD/MM/YYYY",
  });
  const [notifications, setNotifications] = useState<NotificationPrefs>({
    paused: false, loginAlerts: true, securityAlerts: true, passwordChanges: true,
    accountUpdates: true, dailyCarbonReminders: true, weeklyReports: true,
    streakReminders: true, challengeUpdates: true, badgeUnlocks: true,
    ecoCoinRewards: true, productUpdates: true, newsletter: false,
    sustainabilityTips: true, monthlySummaries: true, browserNotifications: false,
    mobileNotifications: false, instantAlerts: false, quietFrom: "22:00",
    quietTo: "07:00", noWeekends: false,
  });
  const [appearance, setAppearance] = useState<AppearancePrefs>({ theme: "system" });
  const [privacy, setPrivacy] = useState<PrivacyPrefs>({
    profileVisibility: "public", dataSharing: false, analyticsOptIn: false,
  });
  const [sessions, setSessions] = useState<SessionInfo[]>([]);
  const [notificationItems, setNotificationItems] = useState<NotificationItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Hydrate from the settings cache after mount.
  useEffect(() => {
    let active = true;

    void SettingsDB.hydrate().then(() => {
      if (!active) return;
      setProfile(SettingsDB.getProfile());
      setLanguage(SettingsDB.getLanguage());
      setNotifications(SettingsDB.getNotificationPrefs());
      setAppearance(SettingsDB.getAppearance());
      setPrivacy(SettingsDB.getPrivacy());
      setSessions(SettingsDB.getSessions());
      setNotificationItems(SettingsDB.getNotifications());
      setLoaded(true);
    });

    return () => {
      active = false;
    };
  }, []);

  // Apply theme whenever appearance changes
  useEffect(() => {
    if (!loaded) return;
    const { theme } = appearance;
    if (theme === "system") {
      const prefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
      document.documentElement.classList.toggle("dark", prefersDark);
    } else {
      document.documentElement.classList.toggle("dark", theme === "dark");
    }
  }, [appearance, loaded]);

  // Apply language dir
  useEffect(() => {
    if (!loaded) return;
    document.documentElement.lang = language.code;
    document.documentElement.dir = language.code === "ar" ? "rtl" : "ltr";
  }, [language.code, loaded]);

  const reload = useCallback(() => {
    void SettingsDB.hydrate().then(() => {
      setProfile(SettingsDB.getProfile());
      setLanguage(SettingsDB.getLanguage());
      setNotifications(SettingsDB.getNotificationPrefs());
      setAppearance(SettingsDB.getAppearance());
      setPrivacy(SettingsDB.getPrivacy());
      setSessions(SettingsDB.getSessions());
      setNotificationItems(SettingsDB.getNotifications());
    });
  }, []);

  const value: SettingsContextValue = {
    profile,
    language,
    notifications,
    appearance,
    privacy,
    sessions,
    notificationItems,
    unreadCount: notificationItems.filter((n) => !n.read).length,
    loaded,

    updateProfile: (updates) => {
      const updated = SettingsDB.updateProfile(updates);
      setProfile(updated);
    },
    updateLanguage: (updates) => {
      const updated = SettingsDB.updateLanguage(updates);
      setLanguage(updated);
    },
    updateNotifications: (updates) => {
      const updated = SettingsDB.updateNotificationPrefs(updates);
      setNotifications(updated);
    },
    updateAppearance: (updates) => {
      const updated = SettingsDB.updateAppearance(updates);
      setAppearance(updated);
    },
    updatePrivacy: (updates) => {
      const updated = SettingsDB.updatePrivacy(updates);
      setPrivacy(updated);
    },
    removeSession: (id) => {
      const updated = SettingsDB.removeSession(id);
      setSessions(updated);
    },
    removeAllOtherSessions: () => {
      const updated = SettingsDB.removeAllOtherSessions();
      setSessions(updated);
    },
    markNotificationRead: (id) => {
      const updated = SettingsDB.markRead(id);
      setNotificationItems(updated);
    },
    markAllNotificationsRead: () => {
      const updated = SettingsDB.markAllRead();
      setNotificationItems(updated);
    },
    deleteNotification: (id) => {
      const updated = SettingsDB.deleteNotification(id);
      setNotificationItems(updated);
    },
    exportData: () => {
      const data = SettingsDB.exportAllData();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `greenstep-data-${new Date().toISOString().split("T")[0]}.json`;
      a.click();
      URL.revokeObjectURL(url);
    },
    deleteAccount: () => {
      SettingsDB.deleteAccount();
      setProfile(SettingsDB.getProfile());
      window.location.href = "/";
    },
    reload,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

/* ─── Hook ─── */

export function useSettings() {
  const ctx = useContext(SettingsContext);
  if (!ctx) throw new Error("useSettings must be used within SettingsProvider");
  return ctx;
}
