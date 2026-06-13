"use client";

import { useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import { useGreenMapStore } from "@/lib/green-map-store";

export function Toast() {
  const message = useGreenMapStore((s) => s.toastMessage);
  const clearToast = useGreenMapStore((s) => s.clearToast);

  // Auto-dismiss is handled in the store, but also allow manual close
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(clearToast, 3500);
    return () => clearTimeout(timer);
  }, [message, clearToast]);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, x: 60, y: 0 }}
          animate={{ opacity: 1, x: 0, y: 0 }}
          exit={{ opacity: 0, x: 60 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          className="fixed top-20 right-4 z-[60] flex items-center gap-3 rounded-2xl bg-[#2D6A4F] px-5 py-3.5 text-sm font-bold text-white shadow-xl shadow-black/20 backdrop-blur-sm border border-[#52B788]/30"
        >
          <span>{message}</span>
          <button
            onClick={clearToast}
            className="rounded-full p-1 hover:bg-white/10 transition"
            aria-label="Dismiss"
          >
            <X size={14} />
          </button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
