# Contributing to GreenStep India

Welcome! This guide covers the project structure, development workflow, and how to add new features.

## Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run full validation (typecheck → lint → test → build)
npm run validate
```

## Project Structure

```
greenstep-india/
├── app/                          # Next.js App Router pages
│   ├── api/                      # 25 API route handlers
│   │   ├── entries/              # Emission entry CRUD
│   │   ├── dashboard/            # Dashboard aggregation
│   │   ├── ai-coach/             # Gemini AI chat proxy
│   │   ├── scanner/              # Product carbon scanner
│   │   ├── admin/                # Admin panel (RBAC-protected)
│   │   │   ├── users/            # User management + ban + role
│   │   │   ├── audit/            # Audit log queries
│   │   │   └── sessions/         # Session management + revoke
│   │   └── ...                   # 15+ more route groups
│   ├── analytics/                # Enterprise analytics (5-tab)
│   ├── calculator/               # Carbon calculator
│   ├── dashboard/                # User dashboard
│   ├── admin/                    # Admin panel
│   └── ...                       # 20+ total pages
├── components/
│   ├── app-shell.tsx             # Navigation wrapper
│   ├── analytics/                # 10 chart components
│   └── ui/                       # Design system primitives
├── lib/                          # Business logic (pure functions)
│   ├── calculator-engine.ts      # Core emission calculations
│   ├── analytics-engine.ts       # Analytics computations
│   ├── carbon-intelligence.ts    # Carbon Intelligence Engine
│   ├── emission-factors.ts       # India-specific factors
│   ├── rate-limit.ts             # Redis rate limiter (Lua scripts)
│   ├── audit-logger.ts           # Append-only audit logging
│   ├── session-manager.ts        # Session lifecycle
│   ├── logger.ts                 # Structured JSON logger
│   ├── request-id.ts             # Request ID generation
│   ├── rbac/                     # Role-based access control
│   ├── types/                    # TypeScript type definitions
│   ├── validations.ts            # Zod schemas for all API inputs
│   └── ...
├── __tests__/                    # Test suite (387 tests)
│   ├── unit/                     # 17 unit test files
│   ├── integration/              # 5 integration test files
│   ├── lib/                      # 9 library tests
│   └── e2e/                      # 3 Playwright E2E tests
├── supabase/                     # Database schema + migrations
│   ├── schema.sql                # Base schema (8 tables)
│   └── migrations/               # 2 migrations (9 more tables)
├── docs/                         # Documentation suite (10 files)
│   ├── PRD.md                    # Product Requirements
│   ├── Architecture.md           # System Architecture
│   ├── ERD.md                    # Entity Relationship Diagram
│   ├── API.md                    # API Documentation
│   ├── Security.md               # Security Model
│   ├── Testing.md                # Testing Strategy
│   ├── Deployment.md             # Deployment Guide
│   ├── UserGuide.md              # End-User Guide
│   ├── Accessibility.md          # WCAG 2.1 AA Compliance
│   └── Performance.md            # Performance Optimization
└── vitest.config.ts              # Test configuration (80% thresholds)
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (`localhost:3000`) |
| `npm run build` | Production build + PWA service worker |
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

## Testing

**387 tests** across **31 test files** — all passing ✅

```
__tests__/
├── unit/              # Pure function tests (17 files)
├── integration/       # Multi-module workflows (5 files)
├── lib/               # Library-level tests (9 files)
└── e2e/               # Playwright browser tests (3 files)
```

Coverage thresholds enforced at **80%+** for statements, branches, functions, and lines.

## How to Add a New Calculator Category

1. **Add emission factors** in `lib/emission-factors.json`:
   ```json
   "new_category": {
     "factor_name": 0.123
   }
   ```

2. **Create input type** in `lib/calculator-engine.ts`:
   ```ts
   export type NewCategoryInput = {
     someField: number;
   };
   ```

3. **Add to `EntryInput` union** in `lib/calculator-engine.ts`:
   ```ts
   | { category: "new_category"; input: NewCategoryInput }
   ```

4. **Implement calculation function**:
   ```ts
   export function calculateNewCategory(input: NewCategoryInput): CalculationResult {
     return resultFrom([{ label: "factor_name", kgCo2e: input.someField * EMISSION_FACTORS.newCategory.factor_name }]);
   }
   ```

5. **Add to `calculateEntry` switch** and `CATEGORY_ORDER`

6. **Write tests** in `__tests__/lib/calculator-engine.test.ts`

7. **Run validation**: `npm run validate`

## How to Add a New Badge

1. Add badge definition to `BADGES` array in `lib/gamification.ts`
2. Add evaluation logic in `evaluateBadgeAwards()` using `maybeAward()`
3. Add test case in `__tests__/lib/gamification.test.ts`

## How to Add a New API Route

1. Create route file in `app/api/<name>/route.ts`
2. Use `requireCurrentUser()` for authentication
3. Use `apiSuccess()` / `apiError()` from `lib/api.ts` for consistent responses
4. Add Zod validation schema in `lib/validations.ts`
5. Add rate limiting via the appropriate limiter (`authLimiter`, `aiLimiter`, etc.)
6. Write tests and run `npm run validate`

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

See `.env.example` for all required and optional variables. The app works in **demo mode** without any external services configured.

## PR Checklist

Before submitting a PR, run the full validation:

```bash
npm run validate
```

This runs:
- [x] TypeScript type checking (`tsc --noEmit`)
- [x] ESLint code quality (`next lint`)
- [x] Unit + Integration tests (387 tests)
- [x] Production build (`next build`)

All must pass before merging.

## Tech Stack

| Layer | Technology |
|-------|------------|
| **Framework** | Next.js 14 (App Router) |
| **Language** | TypeScript 5.7 |
| **Styling** | Tailwind CSS 3.4 |
| **Animation** | Framer Motion 11 |
| **State** | Zustand 5 |
| **Validation** | Zod 4 |
| **Charts** | Recharts 2.15 |
| **Auth & Database** | Supabase (PostgreSQL + GoTrue Auth) |
| **AI** | Google Gemini 2.5 Flash |
| **Rate Limiting** | Upstash Redis |
| **Testing** | Vitest 4 + Playwright 1.61 |
| **Deployment** | Vercel |
