"use client";

import { useState } from "react";
import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { showSettingsToast } from "@/components/settings/SettingsToast";
import { IconArrowLeft } from "@/components/icons/EcoIcons";

const DEVICE_ICONS: Record<string, string> = {
  Desktop: "🖥️",
  Mobile: "📱",
  Tablet: "📟",
};

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "Active now";
  if (mins < 60) return `${mins} min ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}

export default function SessionsPage() {
  const { sessions, removeSession, removeAllOtherSessions } = useSettings();
  const [confirmLogoutAll, setConfirmLogoutAll] = useState(false);

  function handleRemoveSession(id: string) {
    removeSession(id);
    showSettingsToast("Session ended");
  }

  function handleLogoutAll() {
    removeAllOtherSessions();
    setConfirmLogoutAll(false);
    showSettingsToast("All other sessions ended");
  }

  const currentSession = sessions.find((s) => s.isCurrent);
  const otherSessions = sessions.filter((s) => !s.isCurrent);

  return (
    <div className="min-h-screen bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-white pb-28 md:pb-8">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:underline">
          <IconArrowLeft size={16} /> Settings
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Sessions & Devices</h1>
          <p className="mt-1 text-sm text-[#6B7C6E] dark:text-white/50">
            Manage your active sessions and logged-in devices.
          </p>
        </div>

        {/* Current session */}
        {currentSession && (
          <SettingsCard title="Current Session" description="This device" icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8M12 17v4"/></svg>
          }>
            <div className="flex items-center gap-4">
              <span className="text-3xl">{DEVICE_ICONS[currentSession.device] || "💻"}</span>
              <div className="flex-1 min-w-0">
                <p className="font-bold text-sm">{currentSession.browser} on {currentSession.os}</p>
                <p className="text-xs text-[#6B7C6E] dark:text-white/60 mt-0.5">
                  📍 {currentSession.location}
                </p>
                <div className="flex items-center gap-2 mt-1">
                  <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400">Active now</span>
                </div>
              </div>
              <span className="shrink-0 rounded-full bg-[#D1FAE5] dark:bg-[#2D6A4F]/30 px-3 py-1 text-[11px] font-bold text-[#2D6A4F] dark:text-[#52B788]">
                Current
              </span>
            </div>
          </SettingsCard>
        )}

        {/* Other sessions */}
        {otherSessions.length > 0 && (
          <SettingsCard title={`Other Sessions (${otherSessions.length})`} description="Devices with active sessions" icon={
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>
          }>
            <div className="space-y-0 -mx-5 -mb-5">
              {otherSessions.map((session, idx) => (
                <div
                  key={session.id}
                  className={`flex items-center gap-4 px-5 py-4 ${
                    idx !== 0 ? "border-t border-[#D1FAE5]/60 dark:border-white/5" : ""
                  }`}
                >
                  <span className="text-2xl shrink-0">{DEVICE_ICONS[session.device] || "💻"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{session.browser} on {session.os}</p>
                    <p className="text-xs text-[#6B7C6E] dark:text-white/60">
                      📍 {session.location} · {timeAgo(session.lastActive)}
                    </p>
                  </div>
                  <button
                    onClick={() => handleRemoveSession(session.id)}
                    className="shrink-0 rounded-xl border border-red-200 dark:border-red-900/40 px-3 py-1.5 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                  >
                    End
                  </button>
                </div>
              ))}
            </div>
          </SettingsCard>
        )}

        {otherSessions.length === 0 && (
          <div className="text-center py-10 rounded-2xl border border-[#D1FAE5]/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02]">
            <p className="text-3xl mb-2">✅</p>
            <p className="font-bold text-[#6B7C6E] dark:text-white/50">No other active sessions</p>
            <p className="text-xs text-[#6B7C6E]/70 dark:text-white/50 mt-1">Only this device is logged in.</p>
          </div>
        )}

        {/* Logout all */}
        {otherSessions.length > 0 && (
          <>
            {!confirmLogoutAll ? (
              <button
                onClick={() => setConfirmLogoutAll(true)}
                className="w-full rounded-xl border border-red-200 dark:border-red-900/40 py-3 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                🚪 Log out all other devices
              </button>
            ) : (
              <div className="rounded-2xl border-2 border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-900/10 p-5">
                <p className="text-sm font-bold text-red-600 mb-2">Are you sure?</p>
                <p className="text-xs text-[#6B7C6E] dark:text-white/50 mb-4">
                  This will end all sessions except your current device.
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => setConfirmLogoutAll(false)}
                    className="flex-1 rounded-xl border border-[#D1FAE5] dark:border-white/10 py-2.5 text-sm font-semibold hover:bg-white dark:hover:bg-white/5 transition"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleLogoutAll}
                    className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition"
                  >
                    Log out all
                  </button>
                </div>
              </div>
            )}
          </>
        )}

        {/* Security tip */}
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800/30 bg-amber-50/50 dark:bg-amber-900/10 p-4">
          <p className="text-sm font-bold text-amber-700 dark:text-amber-400">🛡️ Security Tip</p>
          <p className="text-xs text-amber-600 dark:text-amber-500/70 mt-1">
            If you notice an unfamiliar session, end it immediately and change your password.
          </p>
        </div>
      </div>
    </div>
  );
}
