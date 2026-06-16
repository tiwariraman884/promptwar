"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(true);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const isDark = document.documentElement.classList.contains("dark");
    setDark(isDark);
    setMounted(true);
  }, []);

  const toggle = () => {
    const next = !dark;
    setDark(next);
    document.documentElement.classList.toggle("dark", next);
    localStorage.setItem("greenstep-theme", next ? "dark" : "light");
  };

  const bgClass = mounted
    ? dark ? "bg-forest-teal" : "bg-[#D1E7DD]"
    : "bg-forest-teal";

  const knobClass = mounted
    ? dark
      ? "translate-x-8 bg-forest-deep shadow-[0_0_8px_rgba(184,243,74,0.3)]"
      : "translate-x-0 bg-white shadow-md"
    : "translate-x-8 bg-forest-deep";

  return (
    <button
      aria-label={mounted ? (dark ? "Switch to light mode" : "Switch to dark mode") : "Toggle theme"}
      onClick={toggle}
      type="button"
      suppressHydrationWarning
      className={`
        relative flex h-8 w-16 items-center rounded-full p-1 transition-all duration-500 ease-in-out
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2 focus-visible:ring-offset-forest-deep
        ${bgClass}
      `}
    >
      {/* Sun icon (left — visible in light mode) */}
      <span
        className={`absolute left-1.5 transition-opacity duration-300 ${
          mounted && !dark ? "opacity-90" : "opacity-30"
        }`}
        aria-hidden
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      </span>

      {/* Moon icon (right — visible in dark mode) */}
      <span
        className={`absolute right-1.5 transition-opacity duration-300 ${
          mounted && dark ? "opacity-90" : "opacity-30"
        }`}
        aria-hidden
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#B8F34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>

      {/* Sliding knob */}
      <span
        suppressHydrationWarning
        className={`relative z-10 h-6 w-6 rounded-full transition-all duration-500 ease-[cubic-bezier(0.68,-0.55,0.265,1.55)] ${knobClass}`}
      >
        {/* Tiny icon inside knob */}
        <span className="absolute inset-0 flex items-center justify-center">
          {mounted && dark ? (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#B8F34A" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          ) : (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#F59E0B" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="4" />
              <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
            </svg>
          )}
        </span>
      </span>
    </button>
  );
}
