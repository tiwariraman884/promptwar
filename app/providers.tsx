"use client";

import { usePathname } from "next/navigation";
import { useReportWebVitals } from "next/web-vitals";
import { useEffect, type ReactNode } from "react";
import { SettingsProvider } from "@/lib/settings-context";
import { I18nProvider } from "@/lib/i18n-context";
import { SettingsToastContainer } from "@/components/settings/SettingsToast";
import { trackPageView } from "@/lib/analytics";
import { reportPerformanceMetric } from "@/lib/performance-monitor";

export function Providers({ children }: { children: ReactNode }) {
  const pathname = usePathname();

  // Next.js hook to report web vitals (LCP, FID, CLS, FCP, TTFB)
  useReportWebVitals((metric: any) => {
    reportPerformanceMetric(metric);
  });

  useEffect(() => {
    if (pathname) {
      // Trigger pageview tracking on browser idle time
      trackPageView(pathname);
    }
  }, [pathname]);

  return (
    <SettingsProvider>
      <I18nProvider>{children}</I18nProvider>
      <SettingsToastContainer />
    </SettingsProvider>
  );
}
