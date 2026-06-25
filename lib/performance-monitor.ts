/**
 * performance-monitor.ts — Phase 10: Performance Monitoring
 *
 * Implements client-side Web Vitals capturing (LCP, CLS, FID, TBT, TTFB)
 * and formats performance metrics for analytics dashboard ingestion.
 */

import { trackEvent } from "./analytics";

export interface MetricPayload {
  id: string;
  name: string;
  value: number;
  rating: "good" | "needs-improvement" | "poor";
  delta: number;
  entries?: PerformanceEntry[];
}

/** Determines rating for the standard Web Vitals metric values */
export function getMetricRating(name: string, value: number): "good" | "needs-improvement" | "poor" {
  switch (name) {
    case "LCP": // Largest Contentful Paint (ms)
      return value <= 2500 ? "good" : value <= 4000 ? "needs-improvement" : "poor";
    case "FID": // First Input Delay (ms)
      return value <= 100 ? "good" : value <= 300 ? "needs-improvement" : "poor";
    case "CLS": // Cumulative Layout Shift (score)
      return value <= 0.1 ? "good" : value <= 0.25 ? "needs-improvement" : "poor";
    case "FCP": // First Contentful Paint (ms)
      return value <= 1800 ? "good" : value <= 3000 ? "needs-improvement" : "poor";
    case "TTFB": // Time to First Byte (ms)
      return value <= 800 ? "good" : value <= 1800 ? "needs-improvement" : "poor";
    case "INP": // Interaction to Next Paint (ms)
      return value <= 200 ? "good" : value <= 500 ? "needs-improvement" : "poor";
    default:
      return "good";
  }
}

/** Formats and captures Web Vitals metrics dynamically */
export function reportPerformanceMetric(metric: {
  id: string;
  name: string;
  value: number;
  delta: number;
  entries?: PerformanceEntry[];
}) {
  const rating = getMetricRating(metric.name, metric.value);

  const payload: MetricPayload = {
    id: metric.id,
    name: metric.name,
    value: Math.round(metric.value * 100) / 100, // round to 2 decimals
    rating,
    delta: Math.round(metric.delta * 100) / 100,
  };

  // Optionally include LCP component details to track element render delays
  if (metric.name === "LCP" && metric.entries && metric.entries.length > 0) {
    const lcpEntry = metric.entries[metric.entries.length - 1] as any;
    (payload as any).elementSelector = lcpEntry.element ? getCssSelector(lcpEntry.element) : undefined;
    (payload as any).size = lcpEntry.size;
  }

  // Log to console in development
  if (process.env.NODE_ENV === "development") {
    const color = rating === "good" ? "🟢" : rating === "needs-improvement" ? "🟡" : "🔴";
    console.log(
      `[Web Vital] ${color} ${metric.name}: ${payload.value} (Rating: ${rating}, Delta: ${payload.delta})`
    );
  }

  // Track event in analytics on browser idle
  trackEvent("web_vital_metric", {
    vital_name: payload.name,
    vital_value: payload.value,
    vital_rating: payload.rating,
    vital_delta: payload.delta,
    ...(payload as any).elementSelector ? { vital_lcp_selector: (payload as any).elementSelector } : {},
    ...(payload as any).size ? { vital_lcp_size: (payload as any).size } : {},
  });
}

/** Generates CSS selector hierarchy for debugging LCP targets */
function getCssSelector(el: HTMLElement): string {
  try {
    const path: string[] = [];
    let current: HTMLElement | null = el;
    while (current && current.nodeType === Node.ELEMENT_NODE) {
      let selector = current.nodeName.toLowerCase();
      if (current.id) {
        selector += `#${current.id}`;
        path.unshift(selector);
        break; // IDs are unique, stop traversing up
      }
      let sibling = current;
      let nth = 1;
      while (sibling.previousElementSibling) {
        sibling = sibling.previousElementSibling as HTMLElement;
        if (sibling.nodeName.toLowerCase() === current.nodeName.toLowerCase()) {
          nth++;
        }
      }
      if (nth > 1) {
        selector += `:nth-of-type(${nth})`;
      }
      path.unshift(selector);
      current = current.parentElement;
    }
    return path.join(" > ");
  } catch {
    return el.tagName.toLowerCase();
  }
}
