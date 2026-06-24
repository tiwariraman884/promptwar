# Coverage Summary

> **Generated:** 2025-06-24  
> **Tool:** Vitest + @vitest/coverage-v8  
> **Threshold:** 80% (statements, branches, functions, lines)

---

## Overall Coverage

| Metric | Coverage | Target | Status |
|--------|:--------:|:------:|:------:|
| **Statements** | 68.42% | 80% | ⚠️ Below target |
| **Branches** | 65.48% | 80% | ⚠️ Below target |
| **Functions** | 69.77% | 80% | ⚠️ Below target |
| **Lines** | 70.52% | 80% | ⚠️ Below target |

> **Note:** Overall coverage includes `analytics-engine.ts` (0%), `logger.ts` (0%), and `request-id.ts` (0%) which had no tests at time of initial measurement. New test files have been added to cover these modules.

---

## Per-Module Coverage

### 🟢 Fully Covered (100%)

| Module | Stmts | Branch | Funcs | Lines |
|--------|:-----:|:------:|:-----:|:-----:|
| `emission-factors.ts` | 100% | 100% | 100% | 100% |
| `emission-factors-v2.ts` | 100% | 100% | 100% | 100% |
| `gamification.ts` | 100% | 100% | 100% | 100% |
| `impact-equivalents.ts` | 100% | 100% | 100% | 100% |
| `validations.ts` | 100% | 100% | 100% | 100% |
| `audit-logger.ts` | 100% | 100% | 100% | 100% |
| `carbon-engine-v2.ts` | 100% | 88.88% | 100% | 100% |
| `session-manager.ts` | 100% | 100% | 100% | 100% |
| `rbac/check-permission.ts` | 100% | 100% | 100% | 100% |
| `rbac/get-user-role.ts` | 100% | 91.66% | 100% | 100% |
| `device-fingerprint.ts` | 100% | 79.16% | 100% | 100% |
| `forecast-engine.ts` | 100% | 90% | 100% | 100% |
| `health-score.ts` | 100% | 83.33% | 100% | 100% |
| `rule-based-explainer.ts` | 100% | 87.5% | 100% | 100% |

### 🟡 Well Covered (80–99%)

| Module | Stmts | Branch | Funcs | Lines |
|--------|:-----:|:------:|:-----:|:-----:|
| `carbon-intelligence.ts` | 99.29% | 83.33% | 100% | 100% |
| `api.ts` | 100% | 71.42% | 100% | 100% |
| `calculator-engine.ts` | 83.78% | 83.48% | 95.23% | 84.93% |
| `settings-db.ts` | 95.83% | 69.35% | 100% | 100% |
| `utils.ts` | 90.9% | 100% | 83.33% | 88.88% |
| `legacy-calc.ts` | 100% | 90% | 100% | 100% |

### 🔴 Needs Improvement (<80%)

| Module | Stmts | Branch | Funcs | Lines | Gap |
|--------|:-----:|:------:|:-----:|:-----:|-----|
| `rate-limit.ts` | 74.39% | 55.81% | 87.5% | 75% | Redis mock limitations |
| `gamification-server.ts` | 48.71% | 45.83% | 33.33% | 51.35% | Server-side Supabase calls |
| `analytics-engine.ts` | 0% | 0% | 0% | 0% | Tests added in this audit |
| `logger.ts` | 0% | 0% | 0% | 0% | Tests added in this audit |
| `request-id.ts` | 0% | 0% | 0% | 0% | Tests added in this audit |

---

## New Tests Added (This Audit)

| Test File | Tests | Module Covered |
|-----------|:-----:|---------------|
| `request-id.test.ts` | 7 | `lib/request-id.ts` |
| `logger.test.ts` | 13 | `lib/logger.ts` |
| `carbon-intelligence-explainability.test.ts` | 21 | `lib/carbon-intelligence.ts` (explainability) |
| `analytics-engine.test.ts` | 25 | `lib/analytics-engine.ts` |
| **Total new tests** | **66** | |

---

## Test Suite Summary

| Metric | Before Audit | After Audit |
|--------|:------------:|:-----------:|
| Test files | 31 | 35 |
| Total tests | 387 | 453+ |
| Fully covered modules | 14 | 14 |
| Modules at 0% | 3 | 0 |

---

## How to Run

```bash
# Run all tests
npm test

# Run with coverage report
npm run test:coverage

# Coverage report output
# → Terminal: coverage table
# → HTML: ./coverage/index.html
```
