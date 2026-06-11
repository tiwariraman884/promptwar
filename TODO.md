# TODO - EcoSphere 3.0

- [x] Investigate TypeScript/Next.js errors causing missing module/type declarations
- [ ] Fix TypeScript errors reported by `tsc --noEmit`
  - [x] app/calculator/page.tsx: handle possibly-undefined `result`

  - [ ] app/page.tsx: lucide icon + Link href typing
  - [ ] components/app-shell.tsx: lucide icon names + Link href typing
  - [ ] app/tips/page.tsx: iconMap Record missing keys
- [ ] Also ensure TypeScript noEmit completes cleanly (collect real errors from terminal)

- [ ] Re-run `npm run typecheck`
- [ ] Build `npm run build`
- [ ] Run `npm run dev` on a free port and verify site loads

## Plan Step 2 - EcoSphere 3.0 implementation (additive, production hardening first)
- [ ] Add runtime-safety validation patterns to existing API handlers (additive)
- [ ] Add consistent auth/RBAC guard helpers for all API routes (additive)
- [ ] Add observability utilities (request id + structured logs) (additive)

## Plan Step 3 - Module expansion (no breaking changes)
- [ ] AI ECO COACH persistence endpoints/tables (additive)
- [ ] AI CARBON SCANNER evidence storage (additive)
- [ ] GREEN MAP eco-routing extensions (additive)
- [ ] ECO STORE/ OFFSETS portfolio tracking & certificates (additive)
- [ ] COMMUNITY + EDUCATION growth features (additive)
- [ ] REPORTING ENGINE templates & richer exports (additive)
- [ ] Meal + Travel planners using carbon engine (additive)
- [ ] Smart energy ingestion endpoints (additive)
- [ ] Corporate ESG workspace (additive)
- [ ] Carbon wallet + certificate QR endpoints (additive)

## Plan Step 4 - Scalability & global readiness
- [ ] Redis caching strategy for heavy reads (additive)
- [ ] Background jobs for scan processing/report generation (additive)
- [ ] Accessibility, SEO, performance polish pass (additive)

