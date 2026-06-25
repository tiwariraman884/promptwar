import type { ReactNode } from "react";

/**
 * Page wrapper that fades + slides in on mount using pure CSS animation.
 * Replaces the previous framer-motion implementation to eliminate the ~22 kB
 * Framer Motion bundle cost from every route using this wrapper.
 *
 * Respects `prefers-reduced-motion` via CSS media query in globals.css.
 */
export function MotionPage({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 md:pb-24 lg:px-8 page-enter">
      {children}
    </div>
  );
}
