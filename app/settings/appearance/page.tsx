"use client";

import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { showSettingsToast } from "@/components/settings/SettingsToast";
import { IconArrowLeft } from "@/components/icons/EcoIcons";

const THEMES = [
  {
    value: "light" as const,
    label: "Light",
    emoji: "☀️",
    description: "Clean, bright interface",
    preview: "bg-white border-gray-200 text-gray-900",
    previewBg: "bg-[#F0FDF4]",
  },
  {
    value: "dark" as const,
    label: "Dark",
    emoji: "🌙",
    description: "Easy on the eyes",
    preview: "bg-[#0B1815] border-[#1B4332] text-white",
    previewBg: "bg-[#0F1F1A]",
  },
  {
    value: "system" as const,
    label: "System",
    emoji: "💻",
    description: "Match device settings",
    preview: "bg-gradient-to-r from-white to-[#0B1815] border-gray-300",
    previewBg: "bg-gradient-to-r from-[#F0FDF4] to-[#0F1F1A]",
  },
];

export default function AppearanceSettingsPage() {
  const { appearance, updateAppearance } = useSettings();

  function handleThemeSelect(theme: "light" | "dark" | "system") {
    updateAppearance({ theme });
    showSettingsToast(`Theme set to ${theme}`);
  }

  return (
    <div className="min-h-screen bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-white pb-28 md:pb-8">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:underline">
          <IconArrowLeft size={16} /> Settings
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Appearance</h1>
          <p className="mt-1 text-sm text-[#6B7C6E] dark:text-white/50">Customize how GreenStep looks.</p>
        </div>

        <SettingsCard title="Theme" description="Choose your preferred color scheme" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/></svg>
        }>
          <div className="grid gap-3 sm:grid-cols-3">
            {THEMES.map((theme) => {
              const active = appearance.theme === theme.value;
              return (
                <button
                  key={theme.value}
                  onClick={() => handleThemeSelect(theme.value)}
                  className={`relative group rounded-2xl border-2 p-4 text-left transition-all duration-200 ${
                    active
                      ? "border-[#2D6A4F] dark:border-[#52B788] shadow-md shadow-[#52B788]/10"
                      : "border-[#D1FAE5]/60 dark:border-white/[0.08] hover:border-[#52B788]/40 hover:shadow-sm"
                  }`}
                >
                  {/* Preview */}
                  <div className={`h-16 rounded-xl mb-3 ${theme.previewBg} border border-[#D1FAE5]/40 dark:border-white/10 overflow-hidden flex items-end p-2`}>
                    <div className={`h-6 w-full rounded-lg ${theme.preview} border`} />
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-lg">{theme.emoji}</span>
                    <div>
                      <p className="text-sm font-bold">{theme.label}</p>
                      <p className="text-[11px] text-[#6B7C6E] dark:text-white/40">{theme.description}</p>
                    </div>
                  </div>

                  {/* Active check */}
                  {active && (
                    <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#2D6A4F] text-white text-[10px]">✓</span>
                  )}
                </button>
              );
            })}
          </div>
        </SettingsCard>

        {/* Current theme info */}
        <div className="rounded-2xl border border-[#52B788]/20 bg-[#F0FDF4] dark:bg-[#2D6A4F]/10 px-4 py-3 text-center">
          <p className="text-sm text-[#2D6A4F] dark:text-[#52B788]">
            Current theme: <span className="font-bold capitalize">{appearance.theme}</span>
            {appearance.theme === "system" && (
              <span className="text-xs text-[#6B7C6E] dark:text-white/50 ml-2">
                (currently {typeof window !== "undefined" && window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"})
              </span>
            )}
          </p>
        </div>
      </div>
    </div>
  );
}
