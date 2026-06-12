"use client";

import { useState } from "react";
import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { showSettingsToast } from "@/components/settings/SettingsToast";
import { IconArrowLeft } from "@/components/icons/EcoIcons";

const CATEGORIES = ["all", "account", "eco", "email", "system"] as const;
type Category = typeof CATEGORIES[number];

const categoryLabels: Record<Category, string> = {
  all: "All",
  account: "Account",
  eco: "Eco",
  email: "Email",
  system: "System",
};

const categoryEmojis: Record<string, string> = {
  account: "🔐",
  eco: "🌿",
  email: "📧",
  system: "⚙️",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Just now";
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-IN", { month: "short", day: "numeric" });
}

export default function NotificationCenterPage() {
  const {
    notificationItems,
    unreadCount,
    markNotificationRead,
    markAllNotificationsRead,
    deleteNotification,
  } = useSettings();

  const [filter, setFilter] = useState<Category>("all");

  const filtered = filter === "all"
    ? notificationItems
    : notificationItems.filter((n) => n.category === filter);

  const sorted = [...filtered].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  function handleMarkAllRead() {
    markAllNotificationsRead();
    showSettingsToast("All notifications marked as read");
  }

  function handleDelete(id: string) {
    deleteNotification(id);
    showSettingsToast("Notification deleted");
  }

  return (
    <div className="min-h-screen bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-white pb-28 md:pb-8">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:underline">
          <IconArrowLeft size={16} /> Settings
        </Link>

        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold">Notifications</h1>
            <p className="text-sm text-[#6B7C6E] dark:text-white/50">
              {unreadCount > 0 ? `${unreadCount} unread` : "All caught up!"}
            </p>
          </div>
          {unreadCount > 0 && (
            <button
              onClick={handleMarkAllRead}
              className="rounded-xl border border-[#52B788]/30 px-4 py-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-white/5 transition"
            >
              Mark all read
            </button>
          )}
        </div>

        {/* Filter tabs */}
        <div className="flex gap-2 overflow-x-auto pb-1 hide-scrollbar">
          {CATEGORIES.map((cat) => {
            const count = cat === "all"
              ? notificationItems.length
              : notificationItems.filter((n) => n.category === cat).length;
            return (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-bold transition ${
                  filter === cat
                    ? "bg-[#2D6A4F] text-white shadow-sm"
                    : "bg-white dark:bg-white/[0.04] border border-[#D1FAE5]/60 dark:border-white/[0.08] text-[#6B7C6E] dark:text-white/60 hover:bg-[#F0FDF4] dark:hover:bg-white/[0.06]"
                }`}
              >
                {categoryLabels[cat]} ({count})
              </button>
            );
          })}
        </div>

        {/* Notification list */}
        {sorted.length === 0 ? (
          <div className="text-center py-16">
            <p className="text-4xl mb-3">🔔</p>
            <p className="font-bold text-[#6B7C6E] dark:text-white/50">No notifications</p>
            <p className="text-sm text-[#6B7C6E]/70 dark:text-white/30 mt-1">
              {filter !== "all" ? "Try switching to 'All'" : "You're all caught up!"}
            </p>
          </div>
        ) : (
          <div className="space-y-2">
            {sorted.map((notification) => (
              <div
                key={notification.id}
                className={`group rounded-2xl border p-4 transition-all duration-200 ${
                  notification.read
                    ? "border-[#D1FAE5]/40 dark:border-white/[0.05] bg-white/40 dark:bg-white/[0.01]"
                    : "border-[#52B788]/30 dark:border-[#52B788]/20 bg-white dark:bg-white/[0.03] shadow-sm"
                }`}
              >
                <div className="flex items-start gap-3">
                  {/* Unread dot */}
                  <div className="mt-1.5 shrink-0">
                    {!notification.read ? (
                      <span className="block h-2.5 w-2.5 rounded-full bg-[#2D6A4F]" />
                    ) : (
                      <span className="block h-2.5 w-2.5 rounded-full bg-transparent" />
                    )}
                  </div>

                  {/* Category emoji */}
                  <span className="text-lg mt-0.5 shrink-0">
                    {categoryEmojis[notification.category] || "📬"}
                  </span>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <p className={`text-sm font-bold ${notification.read ? "text-[#6B7C6E] dark:text-white/60" : "text-[#1B4332] dark:text-white"}`}>
                      {notification.title}
                    </p>
                    <p className="mt-1 text-sm text-[#6B7C6E] dark:text-white/50 line-clamp-2">
                      {notification.body}
                    </p>
                    <p className="mt-2 text-[11px] font-medium text-[#6B7C6E]/70 dark:text-white/30">
                      {timeAgo(notification.createdAt)}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition">
                    {!notification.read && (
                      <button
                        onClick={() => {
                          markNotificationRead(notification.id);
                          showSettingsToast("Marked as read", "info");
                        }}
                        className="rounded-lg p-1.5 hover:bg-[#F0FDF4] dark:hover:bg-white/10 transition"
                        title="Mark as read"
                      >
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><path d="M22 4 12 14.01l-3-3"/></svg>
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(notification.id)}
                      className="rounded-lg p-1.5 hover:bg-red-50 dark:hover:bg-red-900/20 text-red-400 hover:text-red-600 transition"
                      title="Delete"
                    >
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/></svg>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Settings link */}
        <Link
          href="/settings/notifications"
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#52B788]/30 py-3 text-sm font-bold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-white/5 transition"
        >
          ⚙️ Notification Preferences
        </Link>
      </div>
    </div>
  );
}
