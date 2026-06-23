# Performance Audit — GreenStep India
# Generated: 2026-06-24
# Build: Next.js 14.2.35 production

## Shared JS (loaded by EVERY page)
Total shared: **87.7 kB**
- `fd9d1056-*.js` — **53.6 kB** (React + Next.js framework)
- `2117-*.js` — **31.9 kB** (shared components/providers — likely AppShell + Providers)
- other shared — 2.21 kB

> Even a blank page starts at ~88 kB. Target is <120 kB → only 32 kB headroom per route.

## 3 Largest Page Chunks (by page-specific JS)
| Rank | Route | Page JS | First Load JS | Issue |
|------|-------|---------|---------------|-------|
| 1 | `/auth` | **76.3 kB** | 173 kB | AuthHero animations, SignIn/SignUp forms all in one client bundle |
| 2 | `/green-map` | **44.5 kB** | 172 kB | Google Maps SDK + all map components bundled together |
| 3 | `/ai-assistant` | **21 kB** | 163 kB | Chat UI + demo data + framer-motion |

## Routes Exceeding 120 kB First Load JS (target: <120 kB)
| Route | First Load JS | Over by |
|-------|---------------|---------|
| `/carbon-engine` | **249 kB** | +129 kB |
| `/carbon-analytics` | **218 kB** | +98 kB |
| `/auth` | **173 kB** | +53 kB |
| `/green-map` | **172 kB** | +52 kB |
| `/ai-assistant` | **163 kB** | +43 kB |
| `/dashboard` | **155 kB** | +35 kB |
| `/calculator` | **145 kB** | +25 kB |
| `/scanner` | **141 kB** | +21 kB |
| `/` (home) | **141 kB** | +21 kB |
| `/profile` | **140 kB** | +20 kB |
| `/energy-audit` | **139 kB** | +19 kB |
| `/onboarding` | **137 kB** | +17 kB |
| `/bill-predict` | **136 kB** | +16 kB |
| `/legacy` | **136 kB** | +16 kB |
| `/aqi` | **134 kB** | +14 kB |
| `/commute` | **134 kB** | +14 kB |

> **27 of 30 page routes exceed 120 kB.** Root cause: shared chunk is 87.7 kB.

## Packages >50 kB in root bundle
1. **recharts** — imported directly in `/carbon-analytics` and `/carbon-engine` (not dynamically)
2. **framer-motion** — imported in multiple pages via `motion` components
3. **@supabase/ssr + supabase-js** — 53.6 kB shared chunk includes Supabase
4. **@react-google-maps/api** — loaded in `/green-map`

## Key Findings
1. **No `swcMinify`** in next.config.js (default true in Next 14, but worth confirming)
2. **No `compress: true`** — HTTP compression not explicitly enabled
3. **No image optimization config** — no `formats`, `deviceSizes`, or `minimumCacheTTL`
4. **No cache-control headers** for `/_next/static/` assets
5. **No `compiler.removeConsole`** — console.logs ship to production
6. **Supabase client not singleton** — `createBrowserClient()` called every time
7. **30 "use client" files** in `/app` — many pages are entirely client components
8. **recharts imported synchronously** in carbon-analytics and carbon-engine
9. **Middleware: 77.8 kB** — Supabase SSR in middleware adds weight
10. **Auth page: 76.3 kB** — should be the lightest page, is one of the heaviest

## Priority Fix Order
1. next.config.js optimizations (swcMinify, compress, images, headers, removeConsole)
2. Dynamic import recharts in carbon-analytics + carbon-engine (-98 kB, -129 kB)
3. Dynamic import framer-motion where used
4. Auth page: split into server shell + client LoginForm
5. Supabase client singleton pattern
6. "use client" audit — remove from pages that don't need it
