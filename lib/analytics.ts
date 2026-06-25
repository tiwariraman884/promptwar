/**
 * analytics.ts — Phase 7: requestIdleCallback wrapper
 *
 * All non-critical analytics events are deferred via requestIdleCallback so
 * they never run on the critical path (initial paint / main thread).
 *
 * Falls back to setTimeout(fn, 1) in browsers that don't support rIC
 * (e.g. Safari < 16.4).
 */

type EventPayload = Record<string, string | number | boolean | null | undefined>

/** Schedule work during browser idle time */
function scheduleIdle(cb: () => void, timeout = 2000) {
  if (typeof window === 'undefined') return // SSR guard
  if ('requestIdleCallback' in window) {
    requestIdleCallback(cb, { timeout })
  } else {
    setTimeout(cb, 1)
  }
}

/**
 * Track a custom event via PostHog.
 * The actual posthog.capture() call is deferred to idle time.
 */
export function trackEvent(event: string, properties?: EventPayload) {
  scheduleIdle(() => {
    try {
      // Dynamically import posthog-js so it never blocks the initial page load.
      import('posthog-js').then(({ default: posthog }) => {
        posthog.capture(event, properties)
      }).catch(() => {/* silently ignore if PostHog not configured */})
    } catch { /* ignore */ }
  })
}

/**
 * Track a page-view event deferred to idle time.
 */
export function trackPageView(path: string) {
  trackEvent('$pageview', { path })
}

/**
 * Log a carbon calculation result (non-critical).
 */
export function trackCalculation(totalKg: number, category: string) {
  trackEvent('carbon_calculated', { total_kg: totalKg, category })
}
