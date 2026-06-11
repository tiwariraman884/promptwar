"use client";

import { useEffect, useState } from "react";

export function ThemeToggle() {
  const [dark, setDark] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    // Read the current state from the DOM — the inline script in layout.tsx
    // already set the `dark` class before React hydrated
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

  // Always render the same structure — only change classes after mount
  // This prevents any SSR/CSR element mismatch
  const bgClass = mounted
    ? dark ? "bg-[#1B4332]" : "bg-[#B7E4C7]"
    : "bg-gray-200";

  const knobClass = mounted
    ? dark
      ? "translate-x-8 bg-[#0B1815] ring-1 ring-[#52B788]/40"
      : "translate-x-0 bg-white ring-1 ring-[#2D6A4F]/10"
    : "translate-x-0 bg-white ring-1 ring-gray-200";

  return (
    <button
      aria-label="Toggle theme"
      onClick={toggle}
      type="button"
      suppressHydrationWarning
      className={`
        relative flex h-8 w-16 items-center rounded-full p-1 transition-colors duration-300 ease-in-out
        focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:ring-offset-2
        ${bgClass}
      `}
    >
      {/* Sun icon (left) */}
      <span className="absolute left-1.5 opacity-70" aria-hidden>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#D97706" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <circle cx="12" cy="12" r="4" />
          <path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41" />
        </svg>
      </span>

      {/* Moon icon (right) */}
      <span className="absolute right-1.5 opacity-70" aria-hidden>
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#52B788" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
        </svg>
      </span>

      {/* Sliding knob */}
      <span
        suppressHydrationWarning
        className={`relative z-10 h-6 w-6 rounded-full shadow-md transition-all duration-300 ease-in-out ${knobClass}`}
      />
    </button>
  );
}
