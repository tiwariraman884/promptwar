"use client";

import { motion } from "framer-motion";
import type { ReactNode } from "react";

export function MotionPage({ children }: { children: ReactNode }) {
  return (
    <motion.div
      animate={{ opacity: 1, y: 0 }}
      className="mx-auto w-full max-w-6xl px-4 pb-24 pt-4 sm:px-6 lg:px-8"
      initial={{ opacity: 0, y: 14 }}
      transition={{ duration: 0.32, ease: "easeOut" }}
    >
      {children}
    </motion.div>
  );
}
