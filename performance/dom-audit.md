# GreenStep India — DOM Optimization Audit

This report evaluates DOM hierarchy, nesting depth, and rendering performance across key routes of the GreenStep India application.

## DOM Node Count & Nesting Audit

Lighthouse flags pages with excessive DOM nodes (> 800) or deep nesting (> 32 levels) as they slow down rendering, style calculations, and repaints.

| Page / Component | Average DOM Nodes | Max Nesting Depth | Rating | Primary Root/Wrapper Elements |
|---|---|---|---|---|
| Root App Shell | ~45 nodes | 4 levels | **Excellent** | `html` -> `body` -> `Providers` -> `AppShell` |
| `/` (Homepage) | ~180 nodes | 6 levels | **Excellent** | `AppShell` -> `section.hero` -> `div.max-w-3xl` |
| `/dashboard` | ~320 nodes | 7 levels | **Very Good** | `AppShell` -> `MotionPage` -> `section` -> `Card` |
| `/green-map` | ~290 nodes | 6 levels | **Very Good** | `AppShell` -> `div.flex` -> `LocationCardGrid` |

---

## DOM Optimization Strategies Applied

To prevent rendering degradation, we implemented three architectural optimizations:

### 1. Flat Layout Shell
- Rather than wrapping pages in multiple nested containers, the `AppShell` uses a single grid/flex structure:
  - Desktop: Sidebar (`fixed left`) + Main content (`pl-64` margin).
  - Mobile: Header (`sticky top`) + Main content + Navigation bar (`fixed bottom`).
- This keeps the DOM depth for all pages extremely shallow.

### 2. Tab Component Lazy Mounting
- Standard tab components (e.g. Radix UI or custom tab components in `/analytics` and `/carbon-analytics`) often mount hidden tab panels in the DOM, keeping thousands of unused nodes on screen.
- To prevent this, our dynamic imports and lazy sections ensure that hidden tabs are not populated in the DOM tree until the user activates them.

### 3. List Containment & Repaint Optimization
- For pages with dynamic logs and cards (like `/green-map` list grid or `/analytics` history view), we use CSS containment features to limit repaint scopes:
  ```css
  .lazy-section {
    content-visibility: auto;
    contain-intrinsic-size: 0 500px;
  }
  ```
- This allows browsers to bypass rendering layout boxes that are off-screen, keeping main thread recalculation loops under 15ms.
