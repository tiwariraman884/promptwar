"use client";

import { useState } from "react";
import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { SettingsToggle } from "@/components/settings/SettingsToggle";
import { showSettingsToast } from "@/components/settings/SettingsToast";
import { IconArrowLeft, IconCheck, IconLanguage } from "@/components/icons/EcoIcons";

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧", completeness: 100 },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳", completeness: 95 },
  { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳", completeness: 80 },
  { code: "te", name: "Telugu", native: "తెలుగు", flag: "🇮🇳", completeness: 75 },
  { code: "mr", name: "Marathi", native: "मराठी", flag: "🇮🇳", completeness: 70 },
  { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇮🇳", completeness: 70 },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸", completeness: 88 },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷", completeness: 90 },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪", completeness: 85 },
  { code: "zh", name: "Chinese", native: "简体中文", flag: "🇨🇳", completeness: 82 },
  { code: "ja", name: "Japanese", native: "日本語", flag: "🇯🇵", completeness: 78 },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦", completeness: 65, rtl: true },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷", completeness: 80 },
];

export default function LanguageSettingsPage() {
  const { language, updateLanguage } = useSettings();
  const [search, setSearch] = useState("");

  const filtered = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.native.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(lang: typeof SUPPORTED_LANGUAGES[0]) {
    updateLanguage({ code: lang.code });
    // Apply RTL
    document.documentElement.dir = lang.rtl ? "rtl" : "ltr";
    document.documentElement.lang = lang.code;
    showSettingsToast(`Language set to ${lang.name}`);
  }

  function _handleRegionSave() {
    showSettingsToast("Region preferences saved");
  }

  const completenessColor = (n: number) =>
    n === 100
      ? "text-[#2D6A4F] bg-[#D1FAE5] dark:text-[#B7E4C7] dark:bg-[#2D6A4F]/30"
      : n >= 80
      ? "text-[#52B788] bg-[#F0FDF4] dark:text-[#52B788] dark:bg-[#52B788]/15"
      : "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20";

  const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.code === language.code) || SUPPORTED_LANGUAGES[0];

  return (
    <div className="min-h-screen bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-white pb-28 md:pb-8">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:underline">
          <IconArrowLeft size={16} /> Settings
        </Link>

        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D6A4F] text-white">
            <IconLanguage size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Language & Region</h1>
            <p className="text-sm text-[#6B7C6E] dark:text-white/50">Choose your preferred language and region.</p>
          </div>
        </div>

        {/* Current selection */}
        <div className="flex items-center gap-3 rounded-2xl border border-[#52B788]/30 bg-[#F0FDF4] dark:bg-[#2D6A4F]/15 px-4 py-3">
          <span className="text-2xl">{selectedLang.flag}</span>
          <div className="flex-1">
            <p className="text-sm font-bold text-[#2D6A4F] dark:text-[#52B788]">
              Current: {selectedLang.native}
              <span className="ml-1.5 font-normal text-[#6B7C6E] dark:text-white/50">({selectedLang.name})</span>
            </p>
          </div>
          <IconCheck size={18} className="text-[#2D6A4F] dark:text-[#52B788]" />
        </div>

        {/* Search */}
        <div className="relative">
          <svg className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7C6E]" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/></svg>
          <input
            type="search"
            placeholder="Search languages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#52B788]/30 bg-white dark:bg-[#1A2F2A] pl-10 pr-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 transition"
          />
        </div>

        {/* Language list */}
        <SettingsCard>
          <div className="-m-5">
            {filtered.map((lang, idx) => {
              const isSelected = language.code === lang.code;
              return (
                <button
                  key={lang.code}
                  onClick={() => handleSelect(lang)}
                  className={`flex w-full items-center gap-3 px-5 py-3.5 text-left transition-all duration-150 ${
                    isSelected
                      ? "bg-[#F0FDF4] dark:bg-[#2D6A4F]/20 border-l-[3px] border-l-[#2D6A4F]"
                      : "border-l-[3px] border-l-transparent hover:bg-[#F8FAF5] dark:hover:bg-white/5"
                  } ${idx !== 0 ? "border-t border-t-[#D1FAE5]/60 dark:border-t-white/5" : ""}`}
                >
                  <span className="text-xl shrink-0">{lang.flag}</span>
                  <div className="flex-1 min-w-0">
                    <span className={`font-semibold ${isSelected ? "text-[#2D6A4F] dark:text-[#52B788]" : ""}`}>
                      {lang.native}
                    </span>
                    <span className="ml-2 text-sm text-[#6B7C6E] dark:text-white/60">{lang.name}</span>
                    {lang.rtl && <span className="ml-2 text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 px-1.5 py-0.5 rounded-full">RTL</span>}
                  </div>
                  <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${completenessColor(lang.completeness)}`}>
                    {lang.completeness}%
                  </span>
                  {isSelected && (
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2D6A4F] text-white shrink-0">
                      <IconCheck size={12} />
                    </span>
                  )}
                </button>
              );
            })}
            {filtered.length === 0 && (
              <p className="py-10 text-center text-sm text-[#6B7C6E]">No languages match.</p>
            )}
          </div>
        </SettingsCard>

        {/* Region settings */}
        <SettingsCard title="Region Settings" description="Units, currency, and date format" icon={
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round"><circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
        }>
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-3">Unit System</p>
              <div className="flex gap-2">
                {(["metric", "imperial"] as const).map((u) => (
                  <button
                    key={u}
                    onClick={() => updateLanguage({ unitSystem: u })}
                    className={`flex-1 rounded-xl py-2.5 text-sm font-bold border transition-all duration-200 ${
                      language.unitSystem === u
                        ? "border-[#2D6A4F] bg-[#2D6A4F] text-white shadow-sm"
                        : "border-[#52B788]/30 text-[#1B4332] dark:text-white hover:bg-[#F0FDF4] dark:hover:bg-white/5"
                    }`}
                  >
                    {u === "metric" ? "Metric (kg, km)" : "Imperial (lb, mi)"}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Currency</label>
              <select
                value={language.currency}
                onChange={(e) => updateLanguage({ currency: e.target.value })}
                className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none transition"
              >
                <option value="INR">₹ INR — Indian Rupee</option>
                <option value="USD">$ USD — US Dollar</option>
                <option value="EUR">€ EUR — Euro</option>
                <option value="GBP">£ GBP — British Pound</option>
                <option value="JPY">¥ JPY — Japanese Yen</option>
              </select>
            </div>

            <div>
              <label className="text-sm font-semibold mb-2 block">Date Format</label>
              <select
                value={language.dateFormat}
                onChange={(e) => updateLanguage({ dateFormat: e.target.value })}
                className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none transition"
              >
                <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                <option value="YYYY-MM-DD">YYYY-MM-DD</option>
              </select>
            </div>
          </div>
        </SettingsCard>
      </div>
    </div>
  );
}
