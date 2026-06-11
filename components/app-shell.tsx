"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/theme-toggle";
import Logo from "@/components/Logo";
import ProfileMenu from "@/components/ProfileMenu";
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
} from "@/components/icons/EcoIcons";
import type { ReactElement } from "react";

type NavIcon = (props: { size: number; className?: string }) => ReactElement;

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
  navItems[0],
  navItems[1],
  navItems[2],
  navItems[5],
  navItems[11],
];

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const isLanding = pathname === "/";
  const isOnboarding = pathname?.startsWith("/onboarding");
  const isAuth = pathname?.startsWith("/auth") || pathname?.startsWith("/sign-in") || pathname?.startsWith("/sign-up");
  const isBare = isLanding || isOnboarding || isAuth;

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
              <ThemeToggle />
              <ProfileMenu />
            </div>
          </div>
        </header>
      )}

      <main className={!isBare ? "md:pl-64" : undefined}>{children}</main>

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

      {!isBare && (
        <aside className="fixed bottom-6 left-6 top-24 hidden w-56 overflow-y-auto rounded-card border border-line bg-white p-2 shadow-soft dark:border-white/10 dark:bg-white/[0.04] md:block">
          <nav aria-label="Primary desktop" className="space-y-1">
            {navItems.map((item) => {
              const active = pathname?.startsWith(item.href);
              const Icon = item.icon;
              return (
                <Link
                  aria-current={active ? "page" : undefined}
                  className={cn(
                    "flex min-h-11 items-center gap-3 rounded-card px-3 text-sm font-bold transition",
                    active
                      ? "bg-primary-light text-primary-dark"
                      : "text-ink/65 hover:bg-primary-light/70 dark:text-white/70"
                  )}
                  href={item.href as any}
                  key={item.href}
                >
                  <Icon size={18} />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>
      )}
    </div>
  );
}
