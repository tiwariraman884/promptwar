# GreenStep India

GreenStep India is a full-stack, mobile-first Carbon Footprint Awareness PWA for Indian users, starting with Haridwar and Uttarakhand and designed to scale nationally.

The app implements the supplied master prompt with India-specific emission factors, a pure TypeScript calculator engine, Supabase-ready auth and data routes, community gamification, offline PWA caching, and low-bandwidth friendly UI.

## Quick Start

```bash
npm install
npm run dev
```

Open `http://localhost:3000`. Without Supabase environment variables the app uses demo data so the dashboard, calculator, tips, community, and profile flows can be explored locally.

## Local Validation

Use these commands before shipping changes:

```bash
npm run typecheck
npm run lint
npm run build
```

`npm run build` also regenerates the production PWA service worker in `public/sw.js` and its Workbox runtime file.

## Environment Variables

Copy `.env.example` to `.env.local` and fill:

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
CLIMATIQ_API_KEY=
EMISSIONS_DEV_API_URL=
NEXT_PUBLIC_APP_URL=
NEXT_PUBLIC_POSTHOG_KEY=
NEXT_PUBLIC_POSTHOG_HOST=
```

`NEXT_PUBLIC_POSTHOG_KEY` and `EMISSIONS_DEV_API_URL` are optional. `CLIMATIQ_API_KEY` enables production enrichment through the external provider helper; the app always keeps the India JSON factors available offline.

## Supabase Setup

1. Create a Supabase project.
2. Run `supabase/schema.sql` in the Supabase SQL editor.
3. Enable magic link auth and Google OAuth in Supabase Auth providers.
4. Add the Supabase URL and anon key to `.env.local`.
5. Deploy to Vercel and copy the same variables into the Vercel project settings.

The API routes validate the Supabase server-side session when Supabase is configured. In local demo mode they return deterministic mock data for fast prototyping.

## Feature Coverage

- Onboarding: city, lifestyle, vehicle, home type, and 6-month reduction goal.
- Dashboard: today's CO2e, weekly comparison to India average, streak, coins, 30-day Recharts trend, and quick-add bottom sheet.
- Calculator: transport, energy, diet, shopping, waste, and digital tabs with live kgCO2e totals.
- Tips: quick wins, big impact, and India-specific actions with eco-coin rewards.
- Community: city and state leaderboards, weekly challenge, referral link, and share card.
- Profile: stats, badge shelf, monthly history, and settings for city, diet, notifications, language, and account.
- PWA: manifest, icons, offline core page caching, and cached emission factor JSON.
- Analytics: optional PostHog provider.

## Build Order Followed

1. Next.js 14, TypeScript, Tailwind, and shadcn-style UI primitives.
2. Supabase schema and auth helpers.
3. India emission factor constants and JSON cache.
4. Pure calculator engine.
5. Protected route middleware and auth page.
6. Onboarding, calculator, dashboard, tips, community, profile.
7. API routes for entries, dashboard, leaderboard, tips, challenges, and badges.
8. PWA manifest, offline page, and generated icons.
