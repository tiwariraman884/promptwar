"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSettings } from "@/lib/settings-context";
import {
  IconEditAccount,
  IconLanguage,
  IconBell,
  IconProfile,
} from "@/components/icons/EcoIcons";
import { cn } from "@/lib/utils";

const sections = [
  { href: "/settings/account", label: "Profile", icon: IconEditAccount, description: "Personal info, avatar, password" },
  { href: "/settings/language", label: "Language & Region", icon: IconLanguage, description: "Language, units, currency" },
  { href: "/settings/notifications", label: "Notifications", icon: IconBell, description: "Alerts, email, push" },
  { href: "/settings/appearance", label: "Appearance", icon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
  ), description: "Theme, colors, display" },
  { href: "/settings/privacy", label: "Privacy & Data", icon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
  ), description: "Visibility, data sharing, export" },
  { href: "/settings/sessions", label: "Sessions", icon: () => (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="3" width="20" height="14" rx="2" ry="2"/><path d="M8 21h8M12 17v4"/></svg>
  ), description: "Active devices, logout" },
];

function getInitials(name: string) {
  return name.split(" ").map((n) => n[0]).join("").toUpperCase().slice(0, 2) || "?";
}

export default function SettingsHubPage() {
  const { profile } = useSettings();
  const pathname = usePathname();

  return (
    <div className="min-h-screen bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-white pb-28 md:pb-8">
      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p className="mt-1 text-sm text-[#6B7C6E] dark:text-white/50">
            Manage your account, preferences, and privacy.
          </p>
        </div>

        {/* User card */}
        <div className="mb-6 flex items-center gap-4 rounded-2xl border border-[#D1FAE5]/80 dark:border-white/[0.08] bg-white/80 dark:bg-white/[0.03] backdrop-blur-sm p-5 shadow-sm">
          <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-full">
            {profile.avatar ? (
              <img src={profile.avatar} alt="" className="h-full w-full object-cover" />
            ) : (
              <div className="flex h-full w-full items-center justify-center bg-[#2D6A4F] text-white text-lg font-bold">
                {getInitials(profile.name || "Guest")}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold text-[#1B4332] dark:text-white">
              {profile.name || "Guest User"}
            </p>
            <p className="truncate text-sm text-[#6B7C6E] dark:text-white/50">
              {profile.email || "Not signed in"}
            </p>
          </div>
          <Link
            href="/settings/account"
            className="shrink-0 rounded-xl border border-[#52B788]/30 px-4 py-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-white/5 transition"
          >
            Edit
          </Link>
        </div>

        {/* Settings sections */}
        <div className="space-y-2">
          {sections.map((section) => {
            const Icon = section.icon;
            const active = pathname?.startsWith(section.href);
            return (
              <Link
                key={section.href}
                href={section.href as any}
                className={cn(
                  "flex items-center gap-4 rounded-2xl border p-4 transition-all duration-200",
                  active
                    ? "border-[#52B788]/40 bg-[#F0FDF4] dark:bg-[#2D6A4F]/15 shadow-sm"
                    : "border-[#D1FAE5]/60 dark:border-white/[0.06] bg-white/60 dark:bg-white/[0.02] hover:bg-white hover:dark:bg-white/[0.04] hover:border-[#52B788]/30 hover:shadow-sm"
                )}
              >
                <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#D1FAE5] dark:bg-[#2D6A4F]/30 text-[#2D6A4F] dark:text-[#52B788]">
                  <Icon size={18} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-[#1B4332] dark:text-white">{section.label}</p>
                  <p className="text-xs text-[#6B7C6E] dark:text-white/40">{section.description}</p>
                </div>
                <svg className="shrink-0 text-[#6B7C6E] dark:text-white/30" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><path d="m9 18 6-6-6-6"/></svg>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
