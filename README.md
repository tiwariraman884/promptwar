<div align="center">

# 🌿 GreenStep India

**India-first Carbon Footprint Awareness PWA**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Build](https://github.com/tiwariraman884/promptwar/actions/workflows/testing.yml/badge.svg)](https://github.com/tiwariraman884/promptwar/actions/workflows/testing.yml)
[![Tests](https://img.shields.io/badge/Tests-448_passing-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Coverage](https://img.shields.io/badge/Coverage-80%25+-brightgreen?logo=codecov&logoColor=white)]()
[![Playwright](https://img.shields.io/badge/E2E-Playwright-2EAD33?logo=playwright&logoColor=white)](https://playwright.dev/)
[![Version](https://img.shields.io/badge/v0.1.0-blue?logo=github)]()
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel)](https://promptwar-orpin.vercel.app)
[![License](https://img.shields.io/badge/license-Private-red)]()

A full-stack, mobile-first Progressive Web App that helps Indian users track, reduce, and offset their carbon footprint — starting from Haridwar, Uttarakhand and designed to scale nationally.

[Live Demo](https://promptwar-orpin.vercel.app) · [Documentation](docs/) · [Report Bug](https://github.com/tiwariraman884/promptwar/issues)

</div>

---

## ✨ Features

### Core Modules

| Module | Description |
|--------|-------------|
| 🧮 **Carbon Calculator** | Multi-category calculator (transport, energy, diet, shopping, waste, digital) with live kgCO₂e totals and India-specific emission factors |
| 📊 **Dashboard** | Today's CO₂e, weekly comparison vs India average (5.2 kg/day), streak tracking, eco-coins, 30-day Recharts trend chart |
| 📈 **Enterprise Analytics** | 5-tab analytics engine with 12+ interactive charts — daily trends, weekly bars, forecast with confidence bands, goal rings, radar, heatmap, and gauges |
| 🤖 **AI Coach** | Gemini 2.5 Flash-powered sustainability advisor with India-specific knowledge (emission factors, government schemes, ₹ cost comparisons) |
| 📷 **Carbon Scanner** | Product carbon analysis via barcode, name, or AI — with local DB (8 products), OpenFoodFacts, and Gemini fallback |
| 🧬 **Carbon Twin** | Digital twin lifestyle model with 5 profile dimensions (diet, travel, energy, shopping, waste) and monthly emission snapshots |
| 🔬 **Carbon Intelligence** | Full lifestyle survey → personalized carbon risk score, monthly forecast, reduction roadmap with explainability (reason, confidence %, data source citation), and emissions timeline |
| 🎯 **Simulator** | What-if scenario analysis — change habits and see projected emission reductions in real-time |
| 🗺️ **Green Map** | Google Maps integration showing eco-friendly spots and green businesses in your city |
| 🌍 **Green Communities** | Community challenges, eco-groups, city/state leaderboards, and discussions |
| 🏠 **Energy Audit** | Home energy audit tool with personalized efficiency recommendations |
| 💡 **Quick Wins** | Curated eco tips with eco-coin rewards for completion |

### Enterprise Platform

| Feature | Description |
|---------|-------------|
| 🔐 **RBAC** | 6-tier role system (super_admin → guest) with 15 granular permissions |
| 🛡️ **Admin Panel** | User management, role assignment, session oversight, and force-logout |
| 📋 **Audit Logging** | 18 security action types across 3 severity levels — append-only, never-throw |
| 📱 **Device Fingerprinting** | Device registration, trust/block management, new-device detection alerts |
| 🔒 **Session Management** | Create, touch, revoke lifecycle with 30-day expiry and device linking |
| ⚡ **Rate Limiting** | Redis-backed (Upstash) with atomic Lua scripts — token bucket + sliding window algorithms, 4 configurable tiers |
| 🌐 **i18n** | Bilingual support (English + Hindi) with translation-ready architecture |
| 📱 **PWA** | Installable with offline caching — emission factors, core pages, Google Fonts |
| 🎮 **Gamification** | Eco-coins, badges, streaks, XP, challenges — with server-side validation |
| 📊 **Observability** | Structured JSON logging, UUID request tracing (`x-request-id`), global error boundary with digest |

---

## 🏗️ Architecture

```
┌──────────────────────────────────────────────────────────────────────┐
│                         Client (PWA)                                 │
│  Next.js 14 App Router · TailwindCSS · Framer Motion · Zustand      │
│  Recharts (12+ chart types) · Radix UI · Lucide Icons               │
├──────────────────────────────────────────────────────────────────────┤
│                       Middleware Layer                                │
│  Auth Gate · IP Injection · Request ID · Admin Guard · Route Protect │
├──────────────────────────────────────────────────────────────────────┤
│                      API Routes (25 endpoints)                       │
│  entries · dashboard · leaderboard · tips · challenges · ai-coach    │
│  scanner · green-spots · groups · profile · export · geocode         │
│  admin/users · admin/audit · admin/sessions · auth/role · activity   │
│  device/register · sessions · roadmap · carbon-intelligence · explain│
├───────────────────┬──────────────────────────────────────────────────┤
│    Supabase       │              External Services                   │
│  Auth (GoTrue)    │  Google Gemini 2.5 Flash · Google Maps           │
│  PostgreSQL 15    │  Upstash Redis · PostHog · OpenFoodFacts         │
│  17 Tables + RLS  │  Climatiq (optional)                             │
│  23 Foreign Keys  │                                                  │
│  17 Indexes       │                                                  │
└───────────────────┴──────────────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- (Optional) Supabase project for auth & database
- (Optional) Google Gemini API key, Google Maps API key

### Installation

```bash
# Clone the repository
git clone https://github.com/tiwariraman884/promptwar.git
cd promptwar

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see below)

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase environment variables, the app automatically runs in **demo mode** with 30 days of synthetic data — all features are fully explorable.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | For auth/DB | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth/DB | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | For admin ops | Supabase service role key |
| `GEMINI_API_KEY` | For AI features | Google Gemini API key |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | For Green Map | Google Maps JS API key |
| `GOOGLE_MAPS_API_KEY` | For geocoding | Google Maps server-side key |
| `UPSTASH_REDIS_REST_URL` | For rate limiting | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | For rate limiting | Upstash Redis REST token |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog analytics project key |
| `CLIMATIQ_API_KEY` | No | External emission factor enrichment |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL for SEO |

> **Note:** Rate limit thresholds are also configurable via env vars (`RATE_LIMIT_ANON_MAX`, `RATE_LIMIT_AUTH_MAX`, `RATE_LIMIT_AI_MAX`, `RATE_LIMIT_SENSITIVE_MAX`) — see `.env.example` for defaults.

---

## 🗄️ Database Setup

1. Create a [Supabase](https://supabase.com/) project
2. Run the following SQL files in order in the **Supabase SQL Editor**:
   ```
   supabase/schema.sql                          # Core tables (profiles, entries, gamification)
   supabase/migrations/001_carbon_twin_tables.sql  # Carbon Twin, snapshots, roadmaps
   supabase/migrations/002_security_tables.sql     # RBAC, devices, sessions, audit logs
   ```
3. Copy the Supabase URL and keys into `.env.local`
4. First admin: after signup, run in SQL Editor:
   ```sql
   INSERT INTO user_roles (user_id, role)
   VALUES ('<your-uuid>', 'super_admin')
   ON CONFLICT (user_id) DO UPDATE SET role = 'super_admin';
   ```

> In demo mode (no Supabase configured), all API routes return deterministic mock data.

---

## 📁 Project Structure

```
promptwar/
├── app/                          # Next.js App Router
│   ├── api/                      # 25 API route handlers
│   │   ├── entries/              # Emission entry CRUD
│   │   ├── dashboard/            # Dashboard aggregation
│   │   ├── ai-coach/             # Gemini AI chat proxy
│   │   ├── scanner/              # Product carbon scanner
│   │   ├── admin/                # Admin panel APIs (RBAC-protected)
│   │   │   ├── users/            # User management + ban + role
│   │   │   ├── audit/            # Audit log queries
│   │   │   └── sessions/         # Session management + revoke
│   │   └── ...                   # 15+ more route groups
│   ├── analytics/                # Enterprise analytics (5-tab)
│   ├── calculator/               # Carbon calculator
│   ├── dashboard/                # User dashboard
│   ├── carbon-twin/              # Digital twin profile
│   ├── simulator/                # What-if simulator
│   ├── admin/                    # Admin panel
│   └── ...                       # 20+ total pages
├── components/
│   ├── app-shell.tsx             # Navigation wrapper
│   ├── analytics/                # 10 chart components
│   │   ├── DailyTrendChart.tsx   # Recharts ComposedChart
│   │   ├── ForecastAreaChart.tsx  # Confidence band chart
│   │   ├── GoalProgressRing.tsx  # Animated SVG ring
│   │   ├── HotspotHeatmap.tsx    # CSS-based grid heatmap
│   │   └── ...
│   └── ui/                       # Design system primitives
├── lib/                          # Business logic (pure functions)
│   ├── calculator-engine.ts      # Core emission calculations
│   ├── analytics-engine.ts       # Analytics computations (6 functions)
│   ├── carbon-intelligence.ts    # Carbon Intelligence Engine + explainability
│   ├── emission-factors.ts       # India-specific factors
│   ├── rate-limit.ts             # Redis rate limiter (Lua scripts)
│   ├── audit-logger.ts           # Append-only audit logging
│   ├── session-manager.ts        # Session lifecycle
│   ├── logger.ts                 # Structured JSON logger (env-aware)
│   ├── request-id.ts             # UUID request ID generation
│   ├── rbac/                     # Role-based access control
│   ├── types/                    # TypeScript type definitions
│   └── ...
├── __tests__/                    # Test suite (448 tests)
│   ├── unit/                     # 21 unit test files
│   ├── integration/              # 5 integration test files
│   ├── lib/                      # 9 library tests
│   └── e2e/                      # 3 Playwright E2E tests
├── supabase/                     # Database schema + migrations
│   ├── schema.sql                # Base schema (8 tables)
│   └── migrations/               # 2 migration files (9 more tables)
├── docs/                         # Documentation suite (12 files)
└── vitest.config.ts              # Test configuration (80% thresholds)
```

---

## 🧪 Testing

**448 tests** across **35 test files** — all passing ✅

```bash
# Run all tests
npm test

# Unit tests only (verbose)
npm run test:unit

# Integration tests only
npm run test:integration

# E2E tests (Playwright)
npm run test:e2e

# Coverage report (80% threshold enforced)
npm run test:coverage

# Full validation pipeline
npm run validate    # typecheck → lint → test → build
```

### Test Architecture

```
__tests__/
├── unit/              # Pure function tests (21 files)
│   ├── security-types, rbac, audit-logger, rate-limit
│   ├── calculator-engine, emission-factors, health-score
│   ├── device-fingerprint, settings-db, forecast-engine
│   ├── request-id, logger, analytics-engine
│   ├── carbon-intelligence-explainability
│   └── ... (with dedicated branch coverage files)
├── integration/       # Multi-module workflows (5 files)
│   ├── calculator-flow, emission-pipeline, explainer-flow
│   ├── rbac-workflow, session-lifecycle
│   └── ...
├── lib/               # Library-level tests (9 files)
│   └── validations, gamification, rate-limit, utils, ...
└── e2e/               # Playwright browser tests (3 files)
    └── auth, calculator, dashboard
```

### Coverage Thresholds

All metrics enforced at **80%+** — statements, branches, functions, and lines.

---

## 🛠️ Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (`localhost:3000`) |
| `npm run build` | Production build + PWA service worker |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm test` | Run all unit + integration tests |
| `npm run test:unit` | Unit tests only (verbose) |
| `npm run test:integration` | Integration tests only (verbose) |
| `npm run test:e2e` | Playwright E2E tests |
| `npm run test:coverage` | Tests with V8 coverage report |
| `npm run test:all` | Unit + Integration + Coverage |
| `npm run validate` | Full pipeline: typecheck → lint → test → build |
| `npm run precommit` | Pre-commit: typecheck → lint → test |

---

## 🔒 Security

GreenStep implements defense-in-depth security:

| Layer | Implementation |
|-------|---------------|
| **Auth** | Supabase Auth (GoTrue) with HTTP-only cookie JWT |
| **RBAC** | 6 roles × 15 permissions — `super_admin`, `admin`, `moderator`, `premium_user`, `user`, `guest` |
| **RLS** | Row Level Security on all 17 tables — `auth.uid() = user_id` |
| **Rate Limiting** | 4-tier Redis rate limiting with atomic Lua scripts (token bucket + sliding window) |
| **Headers** | HSTS, CSP, X-Frame-Options: DENY, X-Content-Type-Options, Referrer-Policy, Permissions-Policy |
| **Audit** | 18 action types, 3 severity levels, append-only, metadata sanitization |
| **Input Validation** | Zod schemas on all API inputs |
| **API Keys** | All secrets server-side only (never `NEXT_PUBLIC_`) |
| **Sessions** | 30-day expiry with device fingerprinting, trust/block, and admin force-logout |

---

## 🚢 Deployment

Deployed on **Vercel** at [promptwar-orpin.vercel.app](https://promptwar-orpin.vercel.app).

1. Connect repository to [Vercel](https://vercel.com/)
2. Add environment variables from `.env.example` to Vercel project settings
3. Push to `main` — Vercel auto-deploys

**CI/CD Pipeline:** Lint → TypeCheck → Unit Tests → Integration Tests → Coverage Check (≥80%) → Build → Deploy

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router, Node.js Runtime) |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS 3.4 |
| **Animations** | Framer Motion 11 |
| **State** | Zustand 5 |
| **Validation** | Zod 4 |
| **Charts** | Recharts 2.15 (12+ chart types) |
| **Components** | Radix UI (Tabs, Collapsible) |
| **Icons** | Lucide React |
| **Auth & Database** | Supabase (PostgreSQL 15 + GoTrue Auth) |
| **AI** | Google Gemini 2.5 Flash |
| **Maps** | Google Maps API |
| **Cache** | Upstash Redis (serverless) |
| **Analytics** | PostHog |
| **Testing** | Vitest 4 + Playwright 1.61 |
| **Coverage** | @vitest/coverage-v8 |
| **Deployment** | Vercel (Edge CDN + Serverless) |
| **PWA** | next-pwa (Workbox runtime caching) |

---

## 📚 Documentation

Production-grade enterprise documentation suite — **125+ KB** across **11 files** with **17 Mermaid diagrams** + **OpenAPI 3.0.3 spec**.

```
docs/
├── PRD.md              # Product Requirements Document        (10.7 KB)
├── Architecture.md     # System Architecture & Data Flows     (13.2 KB)
├── ERD.md              # Entity Relationship Diagram           (18.0 KB)
├── API.md              # API Reference & OpenAPI Spec          (15.6 KB)
├── Testing.md          # Testing Strategy & CI/CD              (12.2 KB)
├── Security.md         # Security Model & OWASP Compliance     (14.0 KB)
├── Deployment.md       # Deployment & Infrastructure Guide     (10.6 KB)
├── UserGuide.md        # End-User Guide & FAQ                  (11.6 KB)
├── Accessibility.md    # WCAG 2.1 AA Compliance Audit          (7.5 KB)
├── Performance.md      # Performance Optimization Guide        (8.5 KB)
├── openapi.yaml        # OpenAPI 3.0.3 Specification           (12.0 KB)
└── coverage-summary.md # Test Coverage Breakdown                (3.0 KB)
```

| Document | Size | Diagrams | Key Sections |
|----------|------|:--------:|-------------|
| [PRD.md](docs/PRD.md) | 10.7 KB | — | Product vision · 4 user personas · 30 functional requirements · user stories · success metrics · phased roadmap |
| [Architecture.md](docs/Architecture.md) | 13.2 KB | 7 | System architecture · frontend/backend/DB layers · auth flow · data flow diagrams · caching strategy · scalability playbook |
| [ERD.md](docs/ERD.md) | 18.0 KB | 1 | Full ER diagram · 17 tables · 23 foreign keys · 17 indexes · 8 unique constraints · CHECK constraints · trigger functions |
| [API.md](docs/API.md) | 15.6 KB | 1 | All 25 endpoints · request/response schemas · rate limiting tiers · error codes · pagination |
| [Testing.md](docs/Testing.md) | 12.2 KB | 2 | Testing pyramid · 448 tests across 35 files · unit/integration/E2E breakdown · CI/CD pipeline |
| [Security.md](docs/Security.md) | 14.0 KB | 3 | Authentication flow · 6×15 RBAC permission matrix · OWASP Top 10 · CSP · 18 audit actions |
| [Deployment.md](docs/Deployment.md) | 10.6 KB | 3 | Vercel deployment · Supabase + Upstash config · CI/CD pipeline · rollback strategy |
| [UserGuide.md](docs/UserGuide.md) | 11.6 KB | — | Feature walkthroughs · gamification · AI features · troubleshooting · FAQ |
| [Accessibility.md](docs/Accessibility.md) | 7.5 KB | — | WCAG 2.1 AA audit · ARIA patterns · keyboard navigation · color contrast · screen reader support |
| [Performance.md](docs/Performance.md) | 8.5 KB | 1 | Lighthouse targets · bundle analysis · caching architecture · font/image optimization |
| [openapi.yaml](docs/openapi.yaml) | 12.0 KB | — | OpenAPI 3.0.3 spec · 15 endpoints · schemas · auth · rate limiting |
| [coverage-summary.md](docs/coverage-summary.md) | 3.0 KB | — | Per-module coverage · fully covered modules · gaps · new tests added |

> **Suitable for:** Enterprise deployment · Investor presentations · Academic evaluation · Open-source contribution · Team onboarding

---

## 🗺️ Roadmap

### Near-term
- [ ] WhatsApp bot for quick carbon logging
- [ ] OCR receipt scanning for automated entries
- [ ] Social features — friend challenges, carbon comparison
- [ ] Eco-coin marketplace with partner rewards

### Medium-term
- [ ] Vernacular languages (Tamil, Telugu, Bengali, Marathi)
- [ ] Household carbon tracking (multi-user profiles)
- [ ] Carbon offset marketplace (verified Indian projects)
- [ ] Enterprise API for corporate ESG reporting

### Long-term
- [ ] Government integration (Swachh Bharat, PM-KUSUM dashboards)
- [ ] Wearable integration (auto commute detection)
- [ ] Schools program (curriculum-integrated tracking)
- [ ] Blockchain-based carbon credit tokenization

---

## 🤝 Contributing

Contributions are welcome! See [CONTRIBUTING.md](CONTRIBUTING.md) for detailed guides on adding calculator categories, badges, and API routes.

```bash
# Run the full validation pipeline
npm run validate
```

---

## 📄 License

This project is private. All rights reserved.

---

<div align="center">

**Production Audit Score: 92.1 / 100** · [Full Audit Report](FINAL_PROJECT_AUDIT.md)

Built with 💚 for a greener India

**[GreenStep India](https://promptwar-orpin.vercel.app)** — Track. Reduce. Offset.

</div>
