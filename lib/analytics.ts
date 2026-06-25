/**
 * analytics.ts — Phase 7: requestIdleCallback wrapper
 *
 * All non-critical analytics events are deferred via requestIdleCallback so
 * they never run on the critical path (initial paint / main thread).
 *
 * Falls back to setTimeout(fn, 1) in browsers that don't support rIC
 * (e.g. Safari < 16.4).
 */

import type posthog from "posthog-js";

type EventPayload = Record<string, string | number | boolean | null | undefined>;

let posthogInstance: typeof posthog | null = null;
let initPromise: Promise<typeof posthog> | null = null;

/** Schedule work during browser idle time */
function scheduleIdle(cb: () => void, timeout = 2000) {
  if (typeof window === "undefined") return; // SSR guard
  if ("requestIdleCallback" in window) {
    window.requestIdleCallback(cb, { timeout });
  } else {
    setTimeout(cb, 1);
  }
}

/** Get or initialize the dynamic PostHog client */
function getPostHogClient(): Promise<typeof posthog> {
  if (posthogInstance) return Promise.resolve(posthogInstance);
  if (initPromise) return initPromise;

  initPromise = import("posthog-js")
    .then(({ default: ph }) => {
      const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;
      if (key) {
        ph.init(key, {
          api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || "https://app.posthog.com",
          capture_pageview: false,
          persistence: "localStorage+cookie",
        });
        posthogInstance = ph;
      }
      return ph;
    })
    .catch((err) => {
      initPromise = null; // Reset on failure so we can retry
      throw err;
    });

  return initPromise;
}

/**
 * Track a custom event via PostHog.
 * The actual posthog.capture() call is deferred to idle time.
 */
export function trackEvent(event: string, properties?: EventPayload) {
  scheduleIdle(() => {
    getPostHogClient()
      .then((ph) => {
        ph.capture(event, properties);
      })
      .catch(() => {
        /* silently ignore if PostHog not configured or fails */
      });
  });
}

/**
 * Track a page-view event deferred to idle time.
 */
export function trackPageView(path: string) {
  trackEvent("$pageview", { path });
}

/**
 * Log a carbon calculation result (non-critical).
 */
export function trackCalculation(totalKg: number, category: string) {
  trackEvent("carbon_calculated", { total_kg: totalKg, category });
}
