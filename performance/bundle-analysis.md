# GreenStep India — JS Bundle Analysis & Audit

This report details the JavaScript bundle audit performed on the GreenStep India codebase, identifying heavy dependencies, duplicate modules, and dynamic loading targets.

## Summary of Shared Chunk Sizes (Global Entry)

Every route in the Next.js application imports a shared set of resources. Currently, the shared bundle is **87.7 kB** (gzip), which leaves minimal budget for page-specific code before hitting the 120 kB mobile performance target.

| Bundle / Chunk | Size (Gzipped) | Route Impact | Optimization Strategy |
|---|---|---|---|
| `framework.js` (React/Next) | ~53.6 kB | Loaded on all pages | Core React runtime. Cached long-term. No actions needed. |
| `posthog-js` | ~35.2 kB | Loaded on all pages | **Remove static imports from providers.** Defer initialization and capture page-views/events to browser idle time (`requestIdleCallback`) via lazy dynamic imports. |
| `@supabase/ssr` + client | ~18.4 kB | Loaded on all pages | Already wrapped as a singleton client to prevent multiple initialization contexts. |

---

## Route-Specific Bundle Audit

Several routes exceed the 120 kB target for first-load JS. Below is the breakdown of the heaviest routes and the corresponding optimization actions:

### 1. `/green-map`
- **First Load JS**: **172 kB** (exceeds budget by 52 kB)
- **Primary Bottleneck**: `@react-google-maps/api` (loaded statically on mount).
- **Impact**: Delays First Input Delay (FID) and hydration, blocking user interaction on mobile.
- **Optimization Strategy**: Split all map render logic, markers, layers, and search features into a separate `GoogleMapWrapper.tsx` component. Load it dynamically only when the user clicks "Load Green Map".

### 2. `/auth`
- **First Load JS**: **173 kB** (exceeds budget by 53 kB)
- **Primary Bottleneck**: Both `SignInForm` and `SignUpForm` are statically loaded on initial paint. The complex testimonial canvas ecosystem (`AuthHero`) is also loaded on mobile devices even though it's hidden from view.
- **Impact**: Slows down initial auth page loading and hydration on mobile devices.
- **Optimization Strategy**: Convert `/auth/page.tsx` to a Server Component. Load `AuthHero` dynamically with `ssr: false` (only loads on viewport sizes > `lg` when rendered). Place form elements in a dynamic client component (`AuthContainer.tsx`) and dynamic import the individual sign-in/up forms.

### 3. `/carbon-analytics` and `/analytics`
- **First Load JS**: **218 kB** / **249 kB**
- **Primary Bottleneck**: Recharts and all its subcomponents (shapes, lines, grids, tooltips) are imported statically.
- **Impact**: Extreme blocking time on 3G mobile devices during chart calculation.
- **Optimization Strategy**: Ensure all chart subcomponents (`DailyTrendChart`, `WeeklyBarChart`, `ForecastAreaChart`, etc.) are lazily loaded with `ssr: false` and render only when visible on the screen using Intersection Observer wrapper (`LazySection`).

---

## Recommended Optimization Actions

1. **Move PostHog to Dynamic Loader**: Refactor `app/providers.tsx` to completely remove static posthog references.
2. **Lazy Map Loading**: Refactor `app/green-map/page.tsx` to dynamically load map wrapper components only on user trigger.
3. **Lazy Forms & Auth Canvas**: Split `/auth` page components to omit desktop canvas code and form bundles from mobile loaders.
4. **CSS-based Animation Replacements**: Limit framer-motion imports to layout page fades; replace smaller card animations with lightweight Tailwind CSS animation rules.
