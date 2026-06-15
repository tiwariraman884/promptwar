"use client";

/**
 * I18n context — provides the `t()` translation function to the entire app.
 *
 * HOW IT WORKS:
 * - Reads the current language code from the SettingsProvider
 * - Looks up the matching translation dictionary from translations.ts
 * - The `t(key)` function returns the translated string, or falls back to English
 * - When the user changes language in settings, this context re-renders all
 *   consumers so the UI updates immediately (no page refresh needed)
 *
 * WHAT WAS BROKEN:
 * The language switcher updated the language.code in localStorage and showed
 * a ✓ checkmark, but nothing consumed that code to translate UI strings.
 * All text was hardcoded in English. This context bridges the gap.
 */

import { createContext, useContext, useCallback, useEffect, useMemo, type ReactNode } from "react";
import { useSettings } from "@/lib/settings-context";
import { translations, type TranslationDict } from "@/lib/translations";

interface I18nContextValue {
  /** Translate a key. Falls back to English, then to the key itself. */
  t: (key: string) => string;
  /** Current language code (e.g. "en", "hi", "es") */
  locale: string;
}

const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const { language } = useSettings();
  const locale = language.code || "en";

  // WCAG 3.1.2: Update the document's lang attribute so screen readers
  // use the correct pronunciation rules for the active language.
  useEffect(() => {
    document.documentElement.lang = locale === "en" ? "en-IN" : locale;
  }, [locale]);

  // Get the active dictionary, falling back to English
  const dict: TranslationDict = useMemo(
    () => translations[locale] || translations["en"] || {},
    [locale]
  );

  const enDict: TranslationDict = useMemo(
    () => translations["en"] || {},
    []
  );

  const t = useCallback(
    (key: string): string => {
      // 1. Try the active language
      if (dict[key]) return dict[key];
      // 2. Fallback to English
      if (enDict[key]) return enDict[key];
      // 3. Return the key itself (makes missing translations visible during dev)
      return key;
    },
    [dict, enDict]
  );

  const value = useMemo(() => ({ t, locale }), [t, locale]);

  return <I18nContext.Provider value={value}>{children}</I18nContext.Provider>;
}

/**
 * Hook to access the translation function.
 * Usage: const { t } = useT();
 *        <span>{t("nav.dashboard")}</span>
 */
export function useT() {
  const ctx = useContext(I18nContext);
  if (!ctx) throw new Error("useT must be used within I18nProvider");
  return ctx;
}
