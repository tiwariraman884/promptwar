# GreenStep India — Client Component Audit & Reduction

This report documents the audit of `"use client"` components across the GreenStep India codebase, detailing the components successfully migrated to Server Components and the remaining client contexts.

## Converted Components

| Component / File Path | Previous State | New State | Rationale & Performance Impact |
|---|---|---|---|
| `components/Logo.tsx` | Client | **Server** | Removed `"use client"`. The component only contains static HTML logo wrappers and utilizes Next.js standard `Link`, which handles prefetching out-of-the-box in Server Components. Reduces client bundle sizes. |
| `app/auth/page.tsx` | Client | **Server** | Removed `"use client"`. Delegated client state management to `AuthContainer.tsx`. Dynamically loads the heavy visual slider canvas `AuthHero` only when rendered on desktop, bypassing execution on mobile. |
| `app/page.tsx` (Homepage) | Client | **Server** | (Migrated in previous iteration) Isolates cookie checking to a tiny client redirect shell. Resolves LCP element hydration delay. |

---

## Remaining Client Components & Justification

The following key components remain as Client Components due to their usage of interactive states, browser APIs, or React lifecycle hooks:

### 1. `components/auth/AuthContainer.tsx`
- **Justification**: Uses React state (`useState`) to toggle tabs between Sign In and Sign Up and coordinates dynamic chunk hydration.

### 2. `components/green-map/GoogleMapWrapper.tsx`
- **Justification**: Relies on browser-specific Geolocation APIs, Directions Rendering services, and instantiates visual map markers, requiring standard window execution context.

### 3. `components/LazySection.tsx`
- **Justification**: Utilizes `IntersectionObserver` to trigger lazy mounting of children upon scrolling into view.

### 4. `components/app-shell.tsx`
- **Justification**: Intercepts active route pathname and handles layout drawer gestures on mobile layouts.
