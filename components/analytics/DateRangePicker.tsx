"use client";

import { Calendar } from "lucide-react";
import { useState } from "react";

const PRESETS = [
  { label: "7 Days", days: 7 },
  { label: "14 Days", days: 14 },
  { label: "30 Days", days: 30 },
  { label: "All Time", days: 0 },
] as const;

interface DateRangePickerProps {
  onRangeChange: (range: { start: string; end: string } | undefined) => void;
  maxDays?: number;
}

export function DateRangePicker({ onRangeChange, maxDays = 30 }: DateRangePickerProps) {
  const [active, setActive] = useState(maxDays);
  const [open, setOpen] = useState(false);

  const handleSelect = (days: number) => {
    setActive(days);
    setOpen(false);

    if (days === 0) {
      onRangeChange(undefined);
      return;
    }

    const end = new Date();
    const start = new Date();
    start.setDate(end.getDate() - days);

    onRangeChange({
      start: start.toISOString().slice(0, 10),
      end: end.toISOString().slice(0, 10),
    });
  };

  return (
    <div className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 rounded-xl bg-white dark:bg-[#1A2F2A] border border-[#52B788]/20 px-4 py-2.5 text-sm font-bold text-[#1B4332] dark:text-[#F8FAF5] hover:border-[#52B788]/50 transition-colors shadow-sm"
      >
        <Calendar size={16} className="text-[#52B788]" />
        {PRESETS.find(p => p.days === active)?.label ?? `${active} Days`}
      </button>

      {open && (
        <>
          <div className="fixed inset-0 z-40" onClick={() => setOpen(false)} />
          <div className="absolute right-0 top-full mt-2 z-50 rounded-xl bg-white dark:bg-[#1A2F2A] border border-[#52B788]/20 shadow-xl overflow-hidden min-w-[140px] animate-in fade-in slide-in-from-top-2 duration-200">
            {PRESETS.filter(p => p.days <= maxDays || p.days === 0).map((preset) => (
              <button
                key={preset.days}
                onClick={() => handleSelect(preset.days)}
                className={`w-full text-left px-4 py-2.5 text-sm font-semibold transition-colors ${
                  active === preset.days
                    ? "bg-[#52B788]/10 text-[#2D6A4F] dark:text-[#52B788]"
                    : "text-neutral-600 dark:text-neutral-400 hover:bg-[#F8FAF5] dark:hover:bg-black/20"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}
