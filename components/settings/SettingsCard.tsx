"use client";

import type { ReactNode } from "react";

interface SettingsCardProps {
  children: ReactNode;
  title?: string;
  description?: string;
  icon?: ReactNode;
  className?: string;
  danger?: boolean;
}

export function SettingsCard({ children, title, description, icon, className = "", danger }: SettingsCardProps) {
  return (
    <div
      className={`
        rounded-2xl border bg-white/80 backdrop-blur-sm shadow-sm
        transition-all duration-200
        dark:bg-white/[0.03] dark:backdrop-blur-xl
        ${danger
          ? "border-red-200 dark:border-red-900/40 hover:border-red-300 dark:hover:border-red-800/50"
          : "border-[#D1FAE5]/80 dark:border-white/[0.08] hover:border-[#52B788]/40 dark:hover:border-white/[0.15] hover:shadow-md"
        }
        ${className}
      `}
    >
      {(title || icon) && (
        <div className="flex items-start gap-3 px-5 pt-5 pb-1">
          {icon && (
            <div className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-xl ${danger ? "bg-red-50 text-red-600 dark:bg-red-900/20 dark:text-red-400" : "bg-[#D1FAE5] text-[#2D6A4F] dark:bg-[#2D6A4F]/30 dark:text-[#52B788]"}`}>
              {icon}
            </div>
          )}
          <div className="min-w-0 flex-1">
            {title && <h3 className={`text-sm font-bold ${danger ? "text-red-600 dark:text-red-400" : "text-[#1B4332] dark:text-white"}`}>{title}</h3>}
            {description && <p className="mt-0.5 text-xs text-[#6B7C6E] dark:text-white/50">{description}</p>}
          </div>
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
}
