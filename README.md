<div align="center">

# 🌿 GreenStep India

**India-first Carbon Footprint Awareness PWA**

[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-3-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com/)
[![Supabase](https://img.shields.io/badge/Supabase-Auth_&_DB-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com/)
[![Vitest](https://img.shields.io/badge/Vitest-113_tests-6E9F18?logo=vitest&logoColor=white)](https://vitest.dev/)
[![Vercel](https://img.shields.io/badge/Deployed_on-Vercel-000?logo=vercel)](https://promptwar-orpin.vercel.app)
[![License](https://img.shields.io/badge/license-Private-red)]()

A full-stack, mobile-first Progressive Web App that helps Indian users track, reduce, and offset their carbon footprint — starting from Haridwar, Uttarakhand and designed to scale nationally.

[Live Demo](https://promptwar-orpin.vercel.app) · [Contributing](CONTRIBUTING.md) · [Report Bug](https://github.com/tiwariraman884/promptwar/issues)

</div>

---

## ✨ Features

### Core Modules

| Module | Description |
|--------|-------------|
| 🧮 **Carbon Calculator** | Multi-category calculator (transport, energy, diet, shopping, waste, digital) with live kgCO₂e totals and India-specific emission factors |
| 📊 **Dashboard** | Today's CO₂e, weekly comparison vs India average, streak tracking, eco-coins, 30-day Recharts trend chart, and quick-add bottom sheet |
| 🤖 **AI Eco Coach** | Gemini-powered conversational coach that provides personalized sustainability advice |
| 📷 **Carbon Scanner** | AI-powered product scanner that estimates the carbon footprint of items via camera/image upload |
| 🗺️ **Green Map** | Google Maps integration showing eco-friendly spots, green businesses, and eco-routing in your city |
| 💡 **Tips & Quick Wins** | Curated quick wins, big impact actions, and India-specific eco tips with eco-coin rewards |
| 🏆 **Community** | City and state leaderboards, weekly challenges, referral links, and shareable eco cards |
| 👤 **Profile** | Stats, badge shelf, monthly history, and settings for city, diet, notifications, and language |
| 🧩 **Eco Quiz** | Interactive sustainability quizzes to educate and engage users |
| 🛒 **Eco Store** | Browse and discover eco-friendly products and sustainable alternatives |
| 🌍 **Carbon Offsets** | Explore and track verified carbon offset projects |
| 📅 **Green Calendar** | Eco-events calendar with seasonal tips and environmental awareness days |
| 📈 **Reports** | Detailed carbon reports with export capabilities |
| 🔔 **Notifications** | In-app notification center for challenges, badges, and community updates |
| 👥 **Groups** | Create and join eco-groups for collaborative carbon reduction |
| ⚡ **Energy Audit** | Home energy audit tool with personalized efficiency recommendations |
| 🏠 **Bill Predictor** | Predict future utility bills based on current usage patterns |
| 🚗 **Commute Tracker** | Track daily commute emissions with route alternatives |
| 📜 **History** | Complete emission history log with filtering and search |

### Platform Features

- 📱 **PWA** — Installable on any device with offline page caching and cached emission factor data
- 🔒 **Auth** — Supabase magic link + Google OAuth with localStorage fallback for demo mode
- 🛡️ **Security** — HSTS, CSP, X-Frame-Options, rate limiting (Upstash Redis) on all API routes
- 🌐 **i18n Ready** — Translation-ready architecture with separated string files
- 📊 **Analytics** — Optional PostHog integration for usage insights
- 🎨 **Animations** — Framer Motion page transitions, 3D Earth globe, and interactive India map
- ♿ **SEO** — Dynamic sitemap, robots.txt, and meta tags on every page

---

## 🏗️ Architecture

```
┌────────────────────────────────────────────────────────────────┐
│                          Client (PWA)                          │
│  Next.js 14 App Router · Tailwind · Framer Motion · Zustand   │
├────────────────────────────────────────────────────────────────┤
│                      Middleware Layer                           │
│  Auth Gate · Rate Limiting · Route Protection                  │
├────────────────────────────────────────────────────────────────┤
│                      API Routes (/api/*)                       │
│  entries · dashboard · leaderboard · tips · challenges         │
│  ai-coach · scanner · green-spots · groups · eco-store         │
│  profile · export · offset · geocode                           │
├──────────────────────┬─────────────────────────────────────────┤
│     Supabase         │           External Services             │
│  Auth · PostgreSQL   │  Google Gemini · Google Maps · Climatiq │
│  Row Level Security  │  Upstash Redis · PostHog · OpenFoodFacts│
└──────────────────────┴─────────────────────────────────────────┘
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** 18+ and **npm** 9+
- (Optional) Supabase project for auth & database
- (Optional) Google Maps API key, Gemini API key

### Installation

```bash
# Clone the repository
git clone https://github.com/tiwariraman884/promptwar.git
cd promptwar

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env.local
# Edit .env.local with your values (see Environment Variables below)

# Start the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). Without Supabase environment variables, the app automatically uses **demo data** so the dashboard, calculator, tips, community, and profile flows can all be explored locally.

---

## ⚙️ Environment Variables

Copy `.env.example` to `.env.local` and configure:

| Variable | Required | Description |
|----------|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | For auth/DB | Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | For auth/DB | Supabase anonymous key |
| `SUPABASE_SERVICE_ROLE_KEY` | For server ops | Supabase service role key |
| `NEXT_PUBLIC_GOOGLE_MAPS_API_KEY` | For Green Map | Google Maps JS API key |
| `GOOGLE_MAPS_API_KEY` | For geocoding | Google Maps server-side key |
| `GEMINI_API_KEY` | For AI features | Google Gemini API key |
| `NEXT_PUBLIC_ANTHROPIC_API_KEY` | No | Legacy AI provider (optional) |
| `UPSTASH_REDIS_REST_URL` | For rate limiting | Upstash Redis REST URL |
| `UPSTASH_REDIS_REST_TOKEN` | For rate limiting | Upstash Redis REST token |
| `CLIMATIQ_API_KEY` | No | External emission factor enrichment |
| `EMISSIONS_DEV_API_URL` | No | Development emission API endpoint |
| `NEXT_PUBLIC_POSTHOG_KEY` | No | PostHog analytics project key |
| `NEXT_PUBLIC_POSTHOG_HOST` | No | PostHog host (default: `https://app.posthog.com`) |
| `NEXT_PUBLIC_APP_URL` | No | Public app URL for SEO/sitemap |

> **Note:** Rate limit thresholds are also configurable via env vars (`RATE_LIMIT_ANON_MAX`, `RATE_LIMIT_AUTH_MAX`, etc.) — see `.env.example` for defaults.

---

## 🗄️ Supabase Setup

1. Create a [Supabase](https://supabase.com/) project
2. Run [`supabase/schema.sql`](supabase/schema.sql) in the Supabase SQL editor
3. Enable **Magic Link** auth and **Google OAuth** in Supabase Auth providers
4. Copy the Supabase URL and Anon Key into `.env.local`
5. For production, add the same variables to your Vercel project settings

> In demo mode (no Supabase configured), all API routes return deterministic mock data for fast prototyping.

---

## 📁 Project Structure

```
promptwar/
├── app/                      # Next.js App Router
│   ├── api/                  # 16 API route groups
│   │   ├── ai-coach/         # AI coaching endpoints
│   │   ├── scanner/          # Carbon scanner endpoints
│   │   ├── dashboard/        # Dashboard data
│   │   ├── entries/          # Carbon entry CRUD
│   │   ├── leaderboard/      # Community rankings
│   │   └── ...               # groups, eco-store, offset, etc.
│   ├── calculator/           # Carbon calculator page
│   ├── dashboard/            # User dashboard
│   ├── ai-coach/             # AI Eco Coach chat UI
│   ├── scanner/              # Product carbon scanner
│   ├── green-map/            # Eco-friendly locations map
│   ├── community/            # Leaderboards & challenges
│   ├── eco-store/            # Sustainable products
│   ├── offsets/              # Carbon offset projects
│   └── ...                   # 20+ total routes
├── components/               # Reusable React components
│   ├── EarthGlobe.tsx        # 3D rotating earth animation
│   ├── IndiaMap3D.tsx        # Interactive India map
│   ├── app-shell.tsx         # Main layout with nav & auth gate
│   ├── ui/                   # Design system primitives
│   └── ...
├── lib/                      # Business logic (pure functions)
│   ├── calculator-engine.ts  # Core emission calculations
│   ├── emission-factors.ts   # India-specific factors
│   ├── gamification.ts       # Badges, coins, streaks
│   ├── rate-limit.ts         # API rate limiting (Upstash)
│   ├── validations.ts        # Zod input schemas
│   └── ...
├── __tests__/                # Unit tests (Vitest)
├── supabase/                 # Database schema
├── public/                   # PWA assets, icons, manifest
└── vitest.config.ts          # Test configuration
```

---

## 🧪 Testing

The project uses [Vitest](https://vitest.dev/) with V8 coverage.

```bash
# Run all tests
npm run test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Current Coverage (113 tests, 8 test files — all passing ✅)

| File | Statements | Branches | Functions | Lines |
|------|-----------|----------|-----------|-------|
| **Overall** | **45.84%** | **49.31%** | **45.54%** | **48.20%** |
| emission-factors.ts | 100% | 100% | 100% | 100% |
| gamification.ts | 100% | 100% | 100% | 100% |
| impact-equivalents.ts | 100% | 100% | 100% | 100% |
| validations.ts | 100% | 100% | 100% | 100% |
| legacy-calc.ts | 100% | 90% | 100% | 100% |
| calculator-engine.ts | 83.78% | 83.48% | 95.23% | 84.93% |
| utils.ts | 90.9% | 100% | 83.33% | 88.88% |
| rate-limit.ts | 78.04% | 55.81% | 100% | 78.75% |

---

## 🛠️ Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (`localhost:3000`) |
| `npm run build` | Production build + PWA service worker |
| `npm run start` | Start production server |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run test` | Run all unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with V8 coverage report |
| `npm run validate` | Full pipeline: typecheck → lint → test → build |
| `npm run precommit` | Pre-commit check: typecheck → lint → test |

---

## 🚢 Deployment

The app is deployed on **Vercel** at [promptwar-orpin.vercel.app](https://promptwar-orpin.vercel.app).

### Deploy to Vercel

1. Push to the `main` branch on GitHub
2. Connect the repository to [Vercel](https://vercel.com/)
3. Add all environment variables from `.env.example` to the Vercel project settings
4. Vercel auto-deploys on every push to `main`

### Security Headers (auto-configured)

The app ships with production-grade security headers:
- `Strict-Transport-Security` (HSTS)
- `Content-Security-Policy` (CSP)
- `X-Frame-Options: DENY`
- `X-Content-Type-Options: nosniff`
- `Referrer-Policy: strict-origin-when-cross-origin`
- `Permissions-Policy` (camera, microphone, geolocation)

---

## 🧰 Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5 |
| **Styling** | Tailwind CSS 3 |
| **Animations** | Framer Motion 11 |
| **State Management** | Zustand 5 |
| **Validation** | Zod 4 |
| **Auth & Database** | Supabase (PostgreSQL + Auth) |
| **AI** | Google Gemini API |
| **Maps** | Google Maps API |
| **Rate Limiting** | Upstash Redis |
| **Analytics** | PostHog |
| **Charts** | Recharts |
| **Testing** | Vitest + @vitest/coverage-v8 |
| **Deployment** | Vercel |
| **PWA** | next-pwa (Workbox) |

---

## 🗺️ Roadmap

- [ ] Runtime-safety validation patterns for all API handlers
- [ ] Consistent auth/RBAC guard helpers across routes
- [ ] Observability utilities (request IDs + structured logs)
- [ ] AI Eco Coach conversation persistence
- [ ] Carbon Scanner evidence storage
- [ ] Green Map eco-routing extensions
- [ ] Eco Store portfolio tracking & certificates
- [ ] Meal & travel planners using the carbon engine
- [ ] Smart energy ingestion endpoints
- [ ] Corporate ESG workspace
- [ ] Carbon wallet + certificate QR codes
- [ ] Redis caching for heavy reads
- [ ] Background jobs for scan processing & report generation
- [ ] Accessibility & performance polish pass

---

## 🤝 Contributing

Contributions are welcome! Please see [CONTRIBUTING.md](CONTRIBUTING.md) for development workflow, project structure, and how to add new features.

```bash
# Full validation before submitting a PR
npm run validate
```

---

## 📄 License

This project is private. All rights reserved.

---

<div align="center">

Built with 💚 for a greener India

**[GreenStep India](https://promptwar-orpin.vercel.app)** — Track. Reduce. Offset.

</div>
