"use client";

import { useState } from "react";
import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { SettingsToggle } from "@/components/settings/SettingsToggle";
import { showSettingsToast } from "@/components/settings/SettingsToast";
import { IconArrowLeft } from "@/components/icons/EcoIcons";

const VISIBILITY_OPTIONS = [
  { value: "public" as const, label: "Public", emoji: "🌍", description: "Anyone can see your profile" },
  { value: "friends" as const, label: "Friends Only", emoji: "👥", description: "Only people you connect with" },
  { value: "private" as const, label: "Private", emoji: "🔒", description: "Only you can see your profile" },
];

export default function PrivacySettingsPage() {
  const { privacy, updatePrivacy, exportData, deleteAccount } = useSettings();
  const [deleteModal, setDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState("");

  function handleExport() {
    exportData();
    showSettingsToast("Data exported as JSON");
  }

  function handleDelete() {
    deleteAccount();
  }

  return (
    <div className="min-h-screen bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-white pb-28 md:pb-8">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:underline">
          <IconArrowLeft size={16} /> Settings
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Privacy & Data</h1>
          <p className="mt-1 text-sm text-[#6B7C6E] dark:text-white/50">Control your data and visibility.</p>
        </div>

        {/* Profile Visibility */}
        <SettingsCard title="Profile Visibility" description="Who can see your profile" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
        }>
          <div className="space-y-2">
            {VISIBILITY_OPTIONS.map((option) => {
              const active = privacy.profileVisibility === option.value;
              return (
                <button
                  key={option.value}
                  onClick={() => {
                    updatePrivacy({ profileVisibility: option.value });
                    showSettingsToast(`Profile set to ${option.label}`);
                  }}
                  className={`flex w-full items-center gap-3 rounded-xl border-2 p-3.5 text-left transition-all duration-200 ${
                    active
                      ? "border-[#2D6A4F] dark:border-[#52B788] bg-[#F0FDF4] dark:bg-[#2D6A4F]/15"
                      : "border-[#D1FAE5]/60 dark:border-white/[0.06] hover:border-[#52B788]/30 hover:bg-[#F8FAF5] dark:hover:bg-white/[0.02]"
                  }`}
                >
                  <span className="text-xl">{option.emoji}</span>
                  <div className="flex-1">
                    <p className="text-sm font-bold">{option.label}</p>
                    <p className="text-xs text-[#6B7C6E] dark:text-white/40">{option.description}</p>
                  </div>
                  {active && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2D6A4F] text-white text-[10px] shrink-0">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </SettingsCard>

        {/* Data Sharing */}
        <SettingsCard title="Data Sharing" description="Control how your data is used" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="18" cy="5" r="3"/><circle cx="6" cy="12" r="3"/><circle cx="18" cy="19" r="3"/><path d="M8.59 13.51l6.83 3.98M15.41 6.51l-6.82 3.98"/></svg>
        }>
          <div className="space-y-0 -mx-5 -mb-5">
            <div className="flex items-center justify-between px-5 py-3.5">
              <div>
                <p className="text-sm font-medium">Anonymous analytics</p>
                <p className="text-xs text-[#6B7C6E] dark:text-white/40 mt-0.5">Help us improve with anonymized usage data</p>
              </div>
              <SettingsToggle
                checked={privacy.dataSharing}
                onChange={(val) => {
                  updatePrivacy({ dataSharing: val });
                  showSettingsToast(val ? "Analytics enabled" : "Analytics disabled", "info");
                }}
              />
            </div>
            <div className="flex items-center justify-between px-5 py-3.5 border-t border-[#D1FAE5]/60 dark:border-white/5">
              <div>
                <p className="text-sm font-medium">Improvement program</p>
                <p className="text-xs text-[#6B7C6E] dark:text-white/40 mt-0.5">Share feature usage patterns to improve GreenStep</p>
              </div>
              <SettingsToggle
                checked={privacy.analyticsOptIn}
                onChange={(val) => {
                  updatePrivacy({ analyticsOptIn: val });
                  showSettingsToast(val ? "Opted in" : "Opted out", "info");
                }}
              />
            </div>
          </div>
        </SettingsCard>

        {/* Data Export */}
        <SettingsCard title="Your Data" description="Download or delete your data" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/></svg>
        }>
          <div className="space-y-3">
            <button
              onClick={handleExport}
              className="w-full rounded-xl border border-[#52B788]/30 py-3 text-sm font-bold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-white/5 transition"
            >
              📦 Export All Data (JSON)
            </button>
            <p className="text-xs text-[#6B7C6E] dark:text-white/40 text-center">
              Downloads all your profile data, settings, and activity history.
            </p>
          </div>
        </SettingsCard>

        {/* Delete Account */}
        <SettingsCard danger title="Delete Account" description="Permanently remove your account" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><path d="M10 11v6M14 11v6"/></svg>
        }>
          <p className="text-sm text-[#6B7C6E] dark:text-white/50 mb-4">
            Once deleted, all your data will be permanently removed. This action cannot be undone.
          </p>
          <button
            onClick={() => setDeleteModal(true)}
            className="rounded-xl border border-red-500 px-5 py-2.5 text-sm font-bold text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
          >
            Delete my account
          </button>
        </SettingsCard>
      </div>

      {/* Delete Modal */}
      {deleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-sm rounded-3xl bg-white dark:bg-[#0B1815] p-6 shadow-2xl border border-red-200 dark:border-red-900/50">
            <h2 className="text-xl font-bold text-red-600 mb-2">Delete your account?</h2>
            <p className="text-sm text-[#6B7C6E] dark:text-white/60 mb-5">
              This will permanently delete all your data. This cannot be undone.
            </p>
            <label className="block text-sm font-semibold mb-2">
              Type <span className="font-mono text-red-600">DELETE</span> to confirm
            </label>
            <input
              type="text"
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              className="mb-4 w-full rounded-xl border border-red-200 dark:border-red-900/40 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-red-500 focus:outline-none"
              placeholder="DELETE"
            />
            <div className="flex gap-3">
              <button
                onClick={() => { setDeleteModal(false); setDeleteConfirm(""); }}
                className="flex-1 rounded-xl border border-[#D1FAE5] dark:border-white/10 py-2.5 text-sm font-semibold hover:bg-[#F0FDF4] dark:hover:bg-white/5 transition"
              >
                Cancel
              </button>
              <button
                disabled={deleteConfirm !== "DELETE"}
                onClick={handleDelete}
                className="flex-1 rounded-xl bg-red-600 py-2.5 text-sm font-bold text-white hover:bg-red-700 transition disabled:opacity-40 disabled:cursor-not-allowed"
              >
                Permanently delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
