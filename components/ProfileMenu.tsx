"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  IconProfile,
  IconEditAccount,
  IconLanguage,
  IconBell,
  IconSignIn,
  IconSignOut,
  IconChevronRight,
  IconClose,
} from "@/components/icons/EcoIcons";

interface EcoUser {
  name: string;
  email: string;
}

function getInitials(name: string) {
  return name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);
}

export default function ProfileMenu() {
  const [open, setOpen] = useState(false);
  const [user, setUser] = useState<EcoUser | null>(null);
  const menuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  // Load user from localStorage on mount and on open (so it stays fresh)
  useEffect(() => {
    const stored = localStorage.getItem("eco_user");
    if (stored) {
      try {
        setUser(JSON.parse(stored));
      } catch {
        setUser(null);
      }
    }
  }, [open]);

  // Close on outside click or Escape
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    document.addEventListener("keydown", handleKey);
    return () => {
      document.removeEventListener("mousedown", handleClick);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open]);

  // AUTH GATE (RULE 3): Sign out clears session and redirects to /auth.
  // Uses router.replace to prevent the browser back button from returning
  // to a protected page after sign-out.
  function handleSignOut() {
    localStorage.removeItem("eco_user");
    setUser(null);
    setOpen(false);
    router.replace("/auth");
  }

  const menuItems = [
    {
      label: "Edit Account",
      href: "/settings/account",
      icon: <IconEditAccount size={16} />,
    },
    {
      label: "Language",
      href: "/settings/language",
      icon: <IconLanguage size={16} />,
    },
    {
      label: "Notifications",
      href: "/settings/notifications",
      icon: <IconBell size={16} />,
    },
  ];

  return (
    <div className="relative" ref={menuRef}>
      {/* Trigger button */}
      <button
        aria-expanded={open}
        aria-haspopup="true"
        aria-label="Open profile menu"
        className={`relative flex h-9 w-9 items-center justify-center rounded-full transition focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:ring-offset-2 ${
          user
            ? "bg-[#2D6A4F] text-white text-sm font-bold shadow"
            : "border border-[#52B788]/40 text-[#2D6A4F] hover:bg-[#F0FDF4] dark:text-[#52B788] dark:hover:bg-white/10"
        }`}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {user ? (
          getInitials(user.name)
        ) : (
          <IconProfile size={18} />
        )}
        {/* Notification dot placeholder */}
        <span className="absolute -right-0.5 -top-0.5 h-2.5 w-2.5 rounded-full border-2 border-white bg-red-500 dark:border-[#0B1815] hidden" aria-hidden />
      </button>

      {/* Dropdown — hidden on mobile (rendered as bottom sheet below) */}
      {open && (
        <>
          {/* Mobile bottom sheet overlay */}
          <div
            className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm md:hidden"
            onClick={() => setOpen(false)}
          />

          {/* Dropdown panel */}
          <div
            className={`
              z-50 w-72 rounded-2xl border border-[#D1FAE5] bg-white shadow-xl dark:border-white/10 dark:bg-[#0F1F1A]
              md:absolute md:right-0 md:top-12
              fixed bottom-0 left-0 right-0 rounded-b-none md:rounded-2xl
            `}
          >
            {/* Mobile drag handle */}
            <div className="flex justify-center pt-3 md:hidden">
              <div className="h-1 w-10 rounded-full bg-gray-200 dark:bg-white/20" />
            </div>

            {/* Header: user info */}
            <div className="flex items-center gap-3 p-4 border-b border-[#D1FAE5] dark:border-white/10">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F] text-white text-sm font-bold shadow">
                {user ? getInitials(user.name) : <IconProfile size={20} />}
              </div>
              <div className="min-w-0 flex-1">
                {user ? (
                  <>
                    <p className="truncate font-bold text-[#1B4332] dark:text-white">{user.name}</p>
                    <p className="truncate text-xs text-[#6B7C6E] dark:text-white/60">{user.email}</p>
                  </>
                ) : (
                  <>
                    <p className="font-bold text-[#1B4332] dark:text-white">Guest</p>
                    <p className="text-xs text-[#6B7C6E] dark:text-white/60">Not signed in</p>
                  </>
                )}
              </div>
              {/* Close on mobile */}
              <button
                onClick={() => setOpen(false)}
                className="md:hidden p-1 rounded-lg hover:bg-[#F0FDF4] dark:hover:bg-white/10 text-[#6B7C6E] dark:text-white/60 transition"
                aria-label="Close menu"
              >
                <IconClose size={18} />
              </button>
            </div>

            {/* Menu items */}
            <div className="py-2">
              {menuItems.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as any}
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#1B4332] dark:text-white hover:bg-[#F0FDF4] dark:hover:bg-white/5 transition"
                >
                  <span className="text-[#2D6A4F] dark:text-[#52B788]">{item.icon}</span>
                  <span className="flex-1">{item.label}</span>
                  <IconChevronRight size={14} className="text-[#6B7C6E] dark:text-white/40" />
                </Link>
              ))}
            </div>

            {/* Sign in / out */}
            <div className="border-t border-[#D1FAE5] dark:border-white/10 py-2 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
              {user ? (
                <button
                  onClick={handleSignOut}
                  className="flex w-full items-center gap-3 px-4 py-3 text-sm font-medium text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition"
                >
                  <IconSignOut size={16} />
                  Sign out
                </button>
              ) : (
                <Link
                  href="/auth"
                  onClick={() => setOpen(false)}
                  className="flex items-center gap-3 px-4 py-3 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-white/5 transition"
                >
                  <IconSignIn size={16} />
                  Sign in
                </Link>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
