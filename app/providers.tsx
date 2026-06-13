"use client";

import posthog from "posthog-js";
import { PostHogProvider } from "posthog-js/react";
import { usePathname } from "next/navigation";
import { useEffect, type ReactNode } from "react";
import { SettingsProvider } from "@/lib/settings-context";
import { I18nProvider } from "@/lib/i18n-context";
import { SettingsToastContainer } from "@/components/settings/SettingsToast";

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
    const posthogClient = posthog as typeof posthog & { __loaded?: boolean };
    if (!key || posthogClient.__loaded) return;

    posthogClient.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
      capture_pageview: false,
      persistence: "localStorage+cookie"
    });
  }, []);

  useEffect(() => {
    const posthogClient = posthog as typeof posthog & { __loaded?: boolean };
    if (!process.env.NEXT_PUBLIC_POSTHOG_KEY || !posthogClient.__loaded) return;

    posthogClient.capture("$pageview", {
      $current_url: window.location.href
    });
  }, [pathname]);

  return (
    <PostHogProvider client={posthog}>
      <SettingsProvider>
        <I18nProvider>
          {children}
        </I18nProvider>
        <SettingsToastContainer />
      </SettingsProvider>
    </PostHogProvider>
  );
}
