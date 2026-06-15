"use client";

import { motion, useReducedMotion } from "framer-motion";
import type { ReactNode } from "react";

export function MotionPage({ children }: { children: ReactNode }) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-6xl px-4 pb-28 pt-4 sm:px-6 md:pb-24 lg:px-8"
      initial={prefersReduced ? false : { opacity: 0, y: 14 }}
      transition={{ duration: prefersReduced ? 0 : 0.15, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
