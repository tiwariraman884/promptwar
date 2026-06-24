"use client";

/**
 * I18n context — provides the `t()` translation function to the entire app.
 *
 * HYDRATION-SAFE:
 * During SSR and the first client render, `loaded` is false, so we always
 * use the English dictionary. After the useEffect in SettingsProvider
 * hydrates language from localStorage, `loaded` flips to true and we
 * switch to the user's preferred language. This prevents the
 * "Text content does not match server-rendered HTML" hydration error.
 */

import { createContext, useContext, useCallback, useEffect, useMemo, useState, type ReactNode } from "react";
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
  const { language, loaded } = useSettings();

  // On the server and during initial client render, always use "en".
  // Only switch to the user's language after hydration is complete.
  const [hydrated, setHydrated] = useState(false);
  useEffect(() => { setHydrated(true); }, []);

  const locale = hydrated && loaded ? (language.code || "en") : "en";

  // WCAG 3.1.2: Update the document's lang attribute so screen readers
  // use the correct pronunciation rules for the active language.
  useEffect(() => {
    if (hydrated && loaded) {
      document.documentElement.lang = locale === "en" ? "en-IN" : locale;
    }
  }, [locale, hydrated, loaded]);

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
