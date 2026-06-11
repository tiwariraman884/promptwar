"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconCheck, IconLanguage } from "@/components/icons/EcoIcons";

const SUPPORTED_LANGUAGES = [
  { code: "en", name: "English", native: "English", flag: "🇬🇧", completeness: 100 },
  { code: "hi", name: "Hindi", native: "हिन्दी", flag: "🇮🇳", completeness: 95 },
  { code: "ta", name: "Tamil", native: "தமிழ்", flag: "🇮🇳", completeness: 80 },
  { code: "te", name: "Telugu", native: "తెలుగు", flag: "🇮🇳", completeness: 75 },
  { code: "mr", name: "Marathi", native: "मराठी", flag: "🇮🇳", completeness: 70 },
  { code: "bn", name: "Bengali", native: "বাংলা", flag: "🇮🇳", completeness: 70 },
  { code: "fr", name: "French", native: "Français", flag: "🇫🇷", completeness: 90 },
  { code: "de", name: "German", native: "Deutsch", flag: "🇩🇪", completeness: 85 },
  { code: "es", name: "Spanish", native: "Español", flag: "🇪🇸", completeness: 88 },
  { code: "zh", name: "Chinese (Simplified)", native: "简体中文", flag: "🇨🇳", completeness: 82 },
  { code: "ar", name: "Arabic", native: "العربية", flag: "🇸🇦", completeness: 65 },
  { code: "pt", name: "Portuguese", native: "Português", flag: "🇧🇷", completeness: 80 },
];

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 rounded-2xl bg-[#2D6A4F] px-5 py-3 text-sm font-bold text-white shadow-xl">
      <IconCheck size={16} className="text-[#B7E4C7]" />
      {message}
    </div>
  );
}

export default function LanguageSettingsPage() {
  const [selected, setSelected] = useState("en");
  const [search, setSearch] = useState("");
  const [unitSystem, setUnitSystem] = useState<"metric" | "imperial">("metric");
  const [currency, setCurrency] = useState("INR");
  const [dateFormat, setDateFormat] = useState("DD/MM/YYYY");
  const [toast, setToast] = useState("");
  const [hasChanges, setHasChanges] = useState(false);

  // Load saved preferences
  useEffect(() => {
    const stored = localStorage.getItem("eco_language");
    if (stored) {
      try {
        const prefs = JSON.parse(stored);
        if (prefs.code) setSelected(prefs.code);
        if (prefs.unitSystem) setUnitSystem(prefs.unitSystem);
        if (prefs.currency) setCurrency(prefs.currency);
        if (prefs.dateFormat) setDateFormat(prefs.dateFormat);
      } catch {
        // ignore
      }
    }
  }, []);

  const filtered = SUPPORTED_LANGUAGES.filter(
    (l) =>
      l.name.toLowerCase().includes(search.toLowerCase()) ||
      l.native.toLowerCase().includes(search.toLowerCase())
  );

  function handleSelect(lang: (typeof SUPPORTED_LANGUAGES)[0]) {
    setSelected(lang.code);
    setHasChanges(true);
    // Save and apply immediately
    const prev = localStorage.getItem("eco_language");
    let prefs: Record<string, string> = {};
    if (prev) { try { prefs = JSON.parse(prev); } catch { /* ignore */ } }
    prefs.code = lang.code;
    localStorage.setItem("eco_language", JSON.stringify(prefs));
    // Apply to document
    document.documentElement.lang = lang.code;
    showToast(`Language set to ${lang.name}`);
  }

  function handleSave() {
    const prefs = { code: selected, unitSystem, currency, dateFormat };
    localStorage.setItem("eco_language", JSON.stringify(prefs));
    // Apply lang to document
    document.documentElement.lang = selected;
    setHasChanges(false);
    showToast("All preferences saved!");
  }

  function showToast(msg: string) {
    setToast(msg);
    setTimeout(() => setToast(""), 3000);
  }

  const completenessColor = (n: number) =>
    n === 100
      ? "text-[#2D6A4F] bg-[#D1FAE5] dark:text-[#B7E4C7] dark:bg-[#2D6A4F]/30"
      : n >= 80
      ? "text-[#52B788] bg-[#F0FDF4] dark:text-[#52B788] dark:bg-[#52B788]/15"
      : "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-900/20";

  const selectedLang = SUPPORTED_LANGUAGES.find((l) => l.code === selected);

  return (
    <div className="min-h-screen bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-white">
      <Toast message={toast} />

      <div className="mx-auto max-w-2xl px-4 py-8">
        {/* Back link */}
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:underline"
        >
          <IconArrowLeft size={16} /> Back to Profile
        </Link>

        {/* Header */}
        <div className="flex items-center gap-3 mb-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#2D6A4F] text-white">
            <IconLanguage size={20} />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Language &amp; Region</h1>
            <p className="text-sm text-[#6B7C6E] dark:text-white/60">
              Choose your preferred language for the GreenStep interface.
            </p>
          </div>
        </div>

        {/* Current selection badge */}
        {selectedLang && (
          <div className="mt-4 mb-6 flex items-center gap-3 rounded-2xl border border-[#52B788]/30 bg-[#F0FDF4] dark:bg-[#2D6A4F]/15 px-4 py-3">
            <span className="text-2xl" aria-hidden>{selectedLang.flag}</span>
            <div className="flex-1">
              <p className="text-sm font-bold text-[#2D6A4F] dark:text-[#52B788]">
                Current: {selectedLang.native}
                <span className="ml-1.5 font-normal text-[#6B7C6E] dark:text-white/50">({selectedLang.name})</span>
              </p>
            </div>
            <IconCheck size={18} className="text-[#2D6A4F] dark:text-[#52B788]" />
          </div>
        )}

        {/* Search */}
        <div className="relative mb-4">
          <svg
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B7C6E] dark:text-white/40"
            width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
          >
            <circle cx="11" cy="11" r="8" />
            <path d="m21 21-4.35-4.35" />
          </svg>
          <input
            type="search"
            placeholder="Search languages…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full rounded-xl border border-[#52B788]/30 bg-white dark:bg-[#1A2F2A] pl-10 pr-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 transition"
          />
        </div>

        {/* Language list */}
        <div className="rounded-2xl border border-[#D1FAE5] dark:border-white/10 bg-white dark:bg-[#111C18] overflow-hidden mb-8 shadow-sm">
          {filtered.map((lang, idx) => {
            const isSelected = selected === lang.code;
            return (
              <button
                key={lang.code}
                onClick={() => handleSelect(lang)}
                className={`flex w-full items-center gap-3 px-4 py-3.5 text-left transition-all duration-150 ${
                  isSelected
                    ? "bg-[#F0FDF4] dark:bg-[#2D6A4F]/20 border-l-[3px] border-l-[#2D6A4F]"
                    : "border-l-[3px] border-l-transparent hover:bg-[#F8FAF5] dark:hover:bg-white/5"
                } ${idx !== 0 ? "border-t border-t-[#D1FAE5]/60 dark:border-t-white/5" : ""}`}
              >
                <span className="text-xl shrink-0" aria-hidden>{lang.flag}</span>
                <div className="flex-1 min-w-0">
                  <span className={`font-semibold ${isSelected ? "text-[#2D6A4F] dark:text-[#52B788]" : "text-[#1B4332] dark:text-white"}`}>
                    {lang.native}
                  </span>
                  <span className="ml-2 text-sm text-[#6B7C6E] dark:text-white/60">{lang.name}</span>
                </div>
                <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${completenessColor(lang.completeness)}`}>
                  {lang.completeness}% translated
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
            <p className="py-10 text-center text-sm text-[#6B7C6E] dark:text-white/50">No languages match your search.</p>
          )}
        </div>

        {/* Region settings */}
        <div className="flex items-center gap-2 mb-4">
          <h2 className="text-lg font-bold">Region Settings</h2>
          <span className="rounded-full bg-[#52B788]/10 px-2 py-0.5 text-[10px] font-bold text-[#2D6A4F] dark:text-[#52B788]">
            Local preferences
          </span>
        </div>

        <div className="rounded-2xl border border-[#D1FAE5] dark:border-white/10 bg-white dark:bg-[#111C18] divide-y divide-[#D1FAE5]/60 dark:divide-white/5 overflow-hidden mb-6 shadow-sm">
          {/* Unit system */}
          <div className="px-4 py-4">
            <p className="text-sm font-semibold mb-3">Unit System</p>
            <div className="flex gap-2">
              {(["metric", "imperial"] as const).map((u) => (
                <button
                  key={u}
                  onClick={() => { setUnitSystem(u); setHasChanges(true); }}
                  className={`flex-1 rounded-xl py-2.5 text-sm font-bold border transition-all duration-200 ${
                    unitSystem === u
                      ? "border-[#2D6A4F] bg-[#2D6A4F] text-white shadow-sm"
                      : "border-[#52B788]/30 text-[#1B4332] dark:text-white hover:bg-[#F0FDF4] dark:hover:bg-white/5"
                  }`}
                >
                  {u === "metric" ? "Metric (kg, km)" : "Imperial (lb, miles)"}
                </button>
              ))}
            </div>
          </div>

          {/* Currency */}
          <div className="px-4 py-4">
            <label className="text-sm font-semibold mb-2 block">Currency Display</label>
            <select
              value={currency}
              onChange={(e) => { setCurrency(e.target.value); setHasChanges(true); }}
              className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none transition"
            >
              <option value="INR">₹ INR — Indian Rupee</option>
              <option value="USD">$ USD — US Dollar</option>
              <option value="EUR">€ EUR — Euro</option>
            </select>
          </div>

          {/* Date format */}
          <div className="px-4 py-4">
            <label className="text-sm font-semibold mb-2 block">Date Format</label>
            <select
              value={dateFormat}
              onChange={(e) => { setDateFormat(e.target.value); setHasChanges(true); }}
              className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none transition"
            >
              <option value="DD/MM/YYYY">DD/MM/YYYY</option>
              <option value="MM/DD/YYYY">MM/DD/YYYY</option>
              <option value="YYYY-MM-DD">YYYY-MM-DD</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!hasChanges}
          className={`w-full rounded-xl py-3.5 text-sm font-bold transition-all duration-200 ${
            hasChanges
              ? "bg-[#2D6A4F] text-white hover:bg-[#1B4332] shadow-sm"
              : "bg-[#2D6A4F]/40 text-white/60 cursor-not-allowed"
          }`}
        >
          {hasChanges ? "Save Preferences" : "✓ Preferences Saved"}
        </button>
      </div>
    </div>
  );
}
