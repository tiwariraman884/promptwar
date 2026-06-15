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
promptwar/
├── app/                  # Next.js App Router pages
│   ├── api/              # API routes (server-side)
│   ├── calculator/       # Carbon calculator page
│   ├── dashboard/        # User dashboard
│   └── ...
├── components/           # Reusable React components
│   ├── app-shell.tsx     # Main layout wrapper
│   ├── ui/               # Design system primitives
│   └── ...
├── lib/                  # Business logic (pure functions)
│   ├── calculator-engine.ts   # 🔑 Core: emission calculations
│   ├── emission-factors.ts    # Emission factor constants
│   ├── gamification.ts        # Badge & coin logic
│   ├── validations.ts         # Zod schemas for API
│   ├── rate-limit.ts          # API rate limiting
│   └── ...
├── __tests__/            # Unit tests (Vitest)
│   └── lib/              # Tests for /lib modules
├── public/               # Static assets, PWA files
└── vitest.config.ts      # Test configuration
```

## Scripts

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start dev server (localhost:3000) |
| `npm run build` | Production build |
| `npm run lint` | ESLint check |
| `npm run typecheck` | TypeScript check (`tsc --noEmit`) |
| `npm run test` | Run all unit tests |
| `npm run test:watch` | Run tests in watch mode |
| `npm run test:coverage` | Run tests with coverage report |
| `npm run validate` | Full pipeline: typecheck → lint → test → build |

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

## Environment Variables

Copy `.env.example` to `.env.local` and fill in your values:

```bash
cp .env.example .env.local
```

See `.env.example` for all required and optional variables.

## PR Checklist

Before submitting a PR, run the full validation:

```bash
npm run validate
```

This runs:
- [x] TypeScript type checking
- [x] ESLint code quality
- [x] Unit tests (67+ tests)
- [x] Production build

All must pass before merging.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript 5 |
| Styling | Tailwind CSS 3 |
| Animation | Framer Motion 11 |
| State | Zustand 5 |
| Validation | Zod 4 |
| Testing | Vitest |
| Auth | Supabase (with localStorage fallback) |
