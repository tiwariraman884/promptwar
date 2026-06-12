"use client";

import type { ReactNode, ReactElement } from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import Logo from "@/components/Logo";
import { useSettings } from "@/lib/settings-context";
import {
  IconDashboard,
  IconCalculator,
  IconAiCoach,
  IconScanner,
  IconTips,
  IconGreenMap,
  IconCommunity,
  IconEcoStore,
  IconOffsets,
  IconGroups,
  IconReport,
  IconProfile,
  IconSignIn,
  IconSignOut,
} from "@/components/icons/EcoIcons";

/* ─── Types ─── */
type NavIcon = (props: { size: number; className?: string }) => ReactElement;

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2) || "?";
}

/* ─── Nav items ─── */
const navItems: Array<{ href: string; label: string; icon: NavIcon }> = [
  { href: "/dashboard",  label: "Dashboard",  icon: (p) => <IconDashboard  {...p} /> },
  { href: "/calculator", label: "Calculator", icon: (p) => <IconCalculator {...p} /> },
  { href: "/ai-coach",   label: "AI Coach",   icon: (p) => <IconAiCoach   {...p} /> },
  { href: "/scanner",    label: "Scanner",    icon: (p) => <IconScanner    {...p} /> },
  { href: "/tips",       label: "Tips",       icon: (p) => <IconTips       {...p} /> },
  { href: "/green-map",  label: "Green Map",  icon: (p) => <IconGreenMap   {...p} /> },
  { href: "/community",  label: "Community",  icon: (p) => <IconCommunity  {...p} /> },
  { href: "/eco-store",  label: "Eco Store",  icon: (p) => <IconEcoStore   {...p} /> },
  { href: "/offsets",    label: "Offsets",    icon: (p) => <IconOffsets    {...p} /> },
  { href: "/groups",     label: "Groups",     icon: (p) => <IconGroups     {...p} /> },
  { href: "/report",     label: "Reports",    icon: (p) => <IconReport     {...p} /> },
  { href: "/profile",    label: "Profile",    icon: (p) => <IconProfile    {...p} /> },
];

const mobileNavItems = [
  navItems[0],  // Dashboard
  navItems[1],  // Calculator
  navItems[2],  // AI Coach
  navItems[5],  // Green Map
  navItems[11], // Profile
];

/* ─── Notification Bell ─── */
function NotificationBell() {
  const { unreadCount } = useSettings();

  return (
    <Link
      href="/notifications"
      className="relative flex h-9 w-9 items-center justify-center rounded-full border border-[#52B788]/30 hover:bg-[#F0FDF4] dark:hover:bg-white/10 transition"
      aria-label={`Notifications${unreadCount > 0 ? ` (${unreadCount} unread)` : ""}`}
    >
      <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-[#2D6A4F] dark:text-[#52B788]">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[9px] font-bold text-white shadow-sm">
          {unreadCount > 9 ? "9+" : unreadCount}
        </span>
      )}
    </Link>
  );
}

/* ─── Settings icon ─── */
function SettingsIcon({ size, className }: { size: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <circle cx="12" cy="12" r="3" />
      <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06A1.65 1.65 0 0 0 4.68 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06A1.65 1.65 0 0 0 9 4.68a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06A1.65 1.65 0 0 0 19.4 9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
    </svg>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { profile } = useSettings();
  const [mounted, setMounted] = useState(false);
  const isLanding = pathname === "/";
  const isOnboarding = pathname?.startsWith("/onboarding");
  const isAuth = pathname?.startsWith("/auth") || pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");
  const isBare = isLanding || isOnboarding || isAuth;

  useEffect(() => { setMounted(true); }, []);

  // Use safe values during SSR to prevent hydration mismatch
  const safeProfile = mounted ? profile : { name: "", email: "", avatar: "" };
  const hasUser = mounted && !!profile.name;

  function handleSignOut() {
    localStorage.removeItem("eco_user");
    localStorage.removeItem("eco_settings_profile");
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-mist text-ink dark:bg-[#0B1815] dark:text-white" suppressHydrationWarning>
      {!isLanding && (
        <header className="sticky top-0 z-30 border-b border-line/80 bg-white/85 backdrop-blur dark:border-white/10 dark:bg-[#0B1815]/85">
          <div className="mx-auto flex min-h-16 max-w-6xl items-center justify-between px-4 sm:px-6 lg:px-8">
            <Logo href="/dashboard" size="md" variant="full" />
            <div className="flex items-center gap-2">
              {!isAuth && (
                <Link
                  className="hidden min-h-11 items-center rounded-pill px-4 text-sm font-bold text-primary-dark hover:bg-primary-light dark:text-white dark:hover:bg-white/10 sm:inline-flex"
                  href="/onboarding"
                >
                  Onboarding
                </Link>
              )}
              {!isBare && <NotificationBell />}
              <ThemeToggle />
            </div>
          </div>
        </header>
      )}

      <main className={!isBare ? "md:pl-64" : undefined}>{children}</main>

      {/* ─── Mobile bottom nav ─── */}
      {!isBare && (
        <nav
          aria-label="Primary"
          className="fixed inset-x-0 bottom-0 z-40 border-t border-line bg-white/95 px-2 pb-[max(0.5rem,env(safe-area-inset-bottom))] pt-2 shadow-[0_-10px_30px_rgba(8,80,65,0.08)] backdrop-blur dark:border-white/10 dark:bg-[#0B1815]/95 md:hidden"
        >
          <div className="mx-auto grid max-w-md grid-cols-5 gap-1">
            {mobileNavItems.map((item) => {
              const active = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-14 flex-col items-center justify-center gap-1 rounded-card text-[11px] font-bold transition",
                    active
                      ? "bg-primary-light text-primary-dark"
                      : "text-ink/60 hover:bg-primary-light/70 dark:text-white/65"
                  )}
                  href={item.href as any}
                  key={item.href}
                >
                  <Icon size={19} />
                  <span>{item.label}</span>
                </Link>
              );
            })}
          </div>
        </nav>
      )}

      {/* ─── Desktop sidebar ─── */}
      {!isBare && (
        <aside className="fixed bottom-6 left-6 top-24 hidden w-56 overflow-y-auto rounded-card border border-line bg-white p-2 shadow-soft dark:border-white/10 dark:bg-white/[0.04] md:flex md:flex-col">
          {/* User card */}
          <div className="mb-2 rounded-card bg-primary-light/50 dark:bg-white/[0.06] p-3">
            <div className="flex items-center gap-2.5">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full overflow-hidden bg-[#2D6A4F] text-white text-xs font-bold shadow">
                {mounted && safeProfile.avatar ? (
                  <img src={safeProfile.avatar} alt="" className="h-full w-full object-cover" />
                ) : (
                  getInitials(safeProfile.name || "Guest")
                )}
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-ink dark:text-white">
                  {safeProfile.name || "Guest"}
                </p>
                <p className="truncate text-[11px] text-ink/55 dark:text-white/50">
                  {safeProfile.email || "Not signed in"}
                </p>
              </div>
            </div>
          </div>

          {/* Main nav */}
          <nav aria-label="Primary desktop" className="flex-1 space-y-0.5">
            {navItems.map((item) => {
              const active = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-10 items-center gap-3 rounded-card px-3 text-[13px] font-bold transition",
                    active
                      ? "bg-primary-light text-primary-dark"
                      : "text-ink/65 hover:bg-primary-light/70 dark:text-white/70"
                  )}
                  href={item.href as any}
                  key={item.href}
                >
                  <Icon size={17} />
                  {item.label}
                </Link>
              );
            })}
          </nav>

          {/* Divider */}
          <div className="my-2 h-px bg-line dark:bg-white/10" />

          {/* Settings link */}
          <div className="space-y-0.5">
            <Link
              href="/settings"
              className={cn(
                "flex min-h-10 items-center gap-3 rounded-card px-3 text-[13px] font-bold transition",
                pathname?.startsWith("/settings")
                  ? "bg-primary-light text-primary-dark"
                  : "text-ink/65 hover:bg-primary-light/70 dark:text-white/70"
              )}
            >
              <SettingsIcon size={17} />
              Settings
            </Link>

            {/* Sign in / out */}
            {hasUser ? (
              <button
                onClick={handleSignOut}
                className="flex w-full min-h-10 items-center gap-3 rounded-card px-3 text-[13px] font-bold text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
              >
                <IconSignOut size={17} />
                Sign out
              </button>
            ) : (
              <Link
                href="/auth"
                className="flex min-h-10 items-center gap-3 rounded-card px-3 text-[13px] font-bold text-primary-dark hover:bg-primary-light dark:text-[#52B788] dark:hover:bg-white/10 transition"
              >
                <IconSignIn size={17} />
                Sign in
              </Link>
            )}
          </div>
        </aside>
      )}
    </div>
  );
}
