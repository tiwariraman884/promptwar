"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type ToastType = "success" | "error" | "info";

interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
}

let addToastExternal: ((message: string, type?: ToastType) => void) | null = null;

/** Call from anywhere: showSettingsToast("Saved!", "success") */
export function showSettingsToast(message: string, type: ToastType = "success") {
  addToastExternal?.(message, type);
}

export function SettingsToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
    const timer = timersRef.current.get(id);
    if (timer) clearTimeout(timer);
    timersRef.current.delete(id);
  }, []);

  const addToast = useCallback((message: string, type: ToastType = "success") => {
    const id = Math.random().toString(36).slice(2, 8);
    setToasts((prev) => [...prev.slice(-4), { id, message, type }]);
    const timer = setTimeout(() => removeToast(id), 3500);
    timersRef.current.set(id, timer);
  }, [removeToast]);

  useEffect(() => {
    addToastExternal = addToast;
    return () => { addToastExternal = null; };
  }, [addToast]);

  const icons: Record<ToastType, string> = {
    success: "✓",
    error: "✕",
    info: "ℹ",
  };

  const colors: Record<ToastType, string> = {
    success: "bg-[#2D6A4F] border-[#52B788]/30",
    error: "bg-red-600 border-red-400/30",
    info: "bg-blue-600 border-blue-400/30",
  };

  return (
    <div className="fixed top-20 right-4 z-[60] flex flex-col gap-2 pointer-events-none sm:right-6">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`
            pointer-events-auto flex items-center gap-2.5 rounded-2xl border px-5 py-3
            text-sm font-bold text-white shadow-xl backdrop-blur-sm
            animate-in slide-in-from-right-5 fade-in duration-300
            ${colors[toast.type]}
          `}
        >
          <span className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-white/20 text-[11px]">
            {icons[toast.type]}
          </span>
          <span>{toast.message}</span>
          <button
            onClick={() => removeToast(toast.id)}
            className="ml-2 rounded-full p-0.5 hover:bg-white/20 transition"
            aria-label="Dismiss"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round"><path d="M18 6L6 18M6 6l12 12"/></svg>
          </button>
        </div>
      ))}
    </div>
  );
}
