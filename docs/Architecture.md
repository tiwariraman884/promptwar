# System Architecture

> **Product:** GreenStep India  
> **Version:** 0.1.0  
> **Last Updated:** 2026-06-25  
> **Owner:** GreenStep Team  
> **Classification:** Internal / Technical

---

## Change Log

| Date       | Version | Author         | Description                         |
|------------|---------|----------------|-------------------------------------|
| 2026-06-25 | 0.1.0   | GreenStep Team | Initial architecture document       |

---

## 1. System Architecture Diagram

```mermaid
graph TB
    subgraph Client ["Client Layer (Browser/PWA)"]
        PWA["PWA Shell"]
        RC["React Components"]
        ZS["Zustand State"]
        RCH["Recharts Viz"]
        FM["Framer Motion"]
        SW["Service Worker"]
    end

    subgraph NextJS ["Next.js 14 Server (Node.js Runtime)"]
        MW["Middleware<br/>(Auth Gate + Security Headers)"]
        SSR["Server Components<br/>(App Router)"]
        API["API Routes<br/>(25 endpoints)"]
        RBAC["RBAC Layer"]
        RL["Rate Limiter"]
        AL["Audit Logger"]
        SM["Session Manager"]
    end

    subgraph Backend ["Backend Services"]
        SB["Supabase<br/>(Auth + PostgreSQL + RLS)"]
        RD["Upstash Redis<br/>(Rate Limiting)"]
        GM["Google Gemini AI<br/>(2.5 Flash)"]
        GEO["Google Maps<br/>(Geocoding)"]
        OFF["OpenFoodFacts<br/>(Product Data)"]
        PH["PostHog<br/>(Analytics)"]
    end

    Client -->|HTTPS| MW
    MW -->|Auth Check| SSR
    MW -->|Auth Check| API
    API -->|Rate Limit| RL
    RL -->|Redis| RD
    API -->|Permission Check| RBAC
    RBAC -->|service_role| SB
    API -->|Audit| AL
    AL -->|service_role| SB
    API -->|Session| SM
    SM -->|service_role| SB
    API -->|User Data| SB
    API -->|AI Requests| GM
    API -->|Geocoding| GEO
    API -->|Barcode Lookup| OFF
    Client -->|Event Tracking| PH
```

---

## 2. Frontend Architecture

### 2.1 Technology Stack

| Layer | Technology | Version | Purpose |
|-------|-----------|---------|---------|
| Framework | Next.js | 14.2.16 | SSR, App Router, API Routes |
| UI Library | React | 18.3.1 | Component rendering |
| State Management | Zustand | 5.0.14 | Global client state |
| Styling | TailwindCSS | 3.4.17 | Utility-first CSS |
| Components | Radix UI | Latest | Accessible primitives (Tabs, Collapsible) |
| Animation | Framer Motion | 11.18.2 | Page transitions, micro-animations |
| Charts | Recharts | 2.15.4 | Data visualization (12+ chart types) |
| Icons | Lucide React | 0.468.0 | Icon system |
| Validation | Zod | 4.4.3 | Schema validation |
| PWA | next-pwa | 5.6.0 | Service worker, offline caching |

### 2.2 Application Pages

```mermaid
graph LR
    subgraph Public
        AUTH["/auth"]
        CB["/auth/callback"]
    end

    subgraph Protected
        DASH["/dashboard"]
        CALC["/calculator"]
        TIPS["/tips"]
        AN["/analytics"]
        SCAN["/scanner"]
        COACH["/ai-coach"]
        LEADER["/leaderboard"]
        TWIN["/carbon-twin"]
        SIM["/simulator"]
        MAP["/green-map"]
        COMM["/communities"]
        CHAL["/challenges"]
        ROAD["/roadmap"]
        LEGACY["/legacy"]
        AQI["/air-quality"]
        QUIZ["/quiz"]
        SETTINGS["/settings"]
    end

    subgraph Admin
        ADM["/admin"]
    end

    AUTH -->|Login| DASH
    DASH --> CALC & AN & SCAN & COACH
```

### 2.3 Component Architecture

```
components/
├── app-shell.tsx              # Navigation wrapper (sidebar + mobile drawer)
├── ui/                        # Design system primitives
│   ├── tabs.tsx               # Radix Tabs
│   ├── collapsible.tsx        # Radix Collapsible
│   └── ...
├── analytics/                 # Enterprise analytics (10 components)
│   ├── DailyTrendChart.tsx    # Recharts ComposedChart
│   ├── WeeklyBarChart.tsx     # Color-coded bar chart
│   ├── ForecastAreaChart.tsx  # Area chart with confidence bands
│   ├── GoalProgressRing.tsx   # Animated SVG ring
│   ├── SustainabilityGauge.tsx# Half-circle SVG gauge
│   ├── CategoryRadar.tsx      # Radar chart
│   ├── HotspotHeatmap.tsx     # CSS-based grid heatmap
│   ├── InsightCard.tsx        # Stat card with sparkline
│   ├── DateRangePicker.tsx    # Preset date range selector
│   └── ExportButton.tsx       # CSV/PDF export
└── [feature]/                 # Feature-specific components
```

### 2.4 State Management Strategy

| Store | Library | Scope | Persistence |
|-------|---------|-------|-------------|
| UI State (theme, sidebar) | Zustand | Client | localStorage |
| Settings (language, units) | Zustand + Context | Client | localStorage |
| Map State | Zustand | Client | Memory |
| Auth State | Supabase SSR | Server + Client | HTTP-only cookies |
| Feature Data | React hooks (SWR pattern) | Component | Memory |

---

## 3. Backend Architecture

### 3.1 API Layer

The backend is a **serverless API** built with Next.js API Routes running on Node.js runtime.

```mermaid
graph TD
    REQ["Incoming Request"] --> MW["Middleware"]
    MW -->|Public Path| PASS["Pass Through"]
    MW -->|Protected Path| AUTH_CHECK{"Authenticated?"}
    AUTH_CHECK -->|No| REDIRECT["Redirect → /auth"]
    AUTH_CHECK -->|Yes| INJECT["Inject x-client-ip"]
    INJECT --> ROUTE["API Route Handler"]
    ROUTE --> RL_CHECK{"Rate Limit Check"}
    RL_CHECK -->|Exceeded| R429["429 Too Many Requests"]
    RL_CHECK -->|OK| VALIDATE["Zod Validation"]
    VALIDATE -->|Invalid| R422["422 Unprocessable"]
    VALIDATE -->|Valid| LOGIC["Business Logic"]
    LOGIC --> DB["Supabase Query"]
    LOGIC --> AI["Gemini AI Call"]
    DB --> RESPONSE["JSON Response"]
    AI --> RESPONSE
```

### 3.2 API Response Envelope

All API responses follow a consistent envelope:

```typescript
// Success
{ success: true, data: T, error: null }

// Failure
{ success: false, data: null, error: "message" }

// Paginated
{ success: true, data: T[], error: null, pagination: { page, limit, total, totalPages } }
```

### 3.3 Middleware Pipeline

| Order | Layer | Responsibility |
|-------|-------|---------------|
| 1 | Path Check | Skip auth for `/auth`, `/auth/callback`, `/auth/forgot` |
| 2 | Supabase SSR | Create server client, refresh tokens via cookies |
| 3 | Auth Gate | Redirect unauthenticated users to `/auth` |
| 4 | Admin Gate | Block unauthenticated admin path access |
| 5 | IP Injection | Set `x-client-ip` header from proxy headers |
| 6 | Logged-in Redirect | Redirect authenticated users away from `/auth` |

---

## 4. Database Architecture

### 4.1 Database Provider

- **PostgreSQL 15+** via Supabase (managed, hosted)
- **Row Level Security (RLS)** on every user-facing table
- **pgcrypto** extension for UUID generation

### 4.2 Schema Groups

| Group | Tables | Purpose |
|-------|--------|---------|
| **Core** | `profiles`, `emission_entries` | User data + carbon tracking |
| **Gamification** | `user_badges`, `user_streaks`, `eco_coins`, `challenges`, `user_challenges`, `completed_tips` | Engagement |
| **Carbon Twin** | `carbon_twin`, `emission_snapshots`, `ai_roadmaps`, `roadmap_completions` | Advanced analytics |
| **Security** | `user_roles`, `user_devices`, `user_sessions`, `audit_logs`, `activity_logs` | Enterprise security |

### 4.3 Data Isolation Model

```mermaid
graph LR
    USER["End User"] -->|"anon_key + JWT"| RLS["Row Level Security"]
    RLS -->|"auth.uid() = user_id"| OWN["Own Data Only"]

    ADMIN["Admin User"] -->|"anon_key + JWT"| RLS
    
    API["API Routes"] -->|"service_role_key"| BYPASS["Full Access"]
    
    style RLS fill:#f9f,stroke:#333
    style BYPASS fill:#ff9,stroke:#333
```

---

## 5. Authentication Flow

```mermaid
sequenceDiagram
    participant U as User (Browser)
    participant MW as Middleware
    participant API as API Route
    participant SB as Supabase Auth
    participant DB as PostgreSQL

    U->>SB: signUp(email, password)
    SB->>DB: INSERT auth.users
    DB->>DB: TRIGGER handle_new_user()
    Note over DB: Creates profile, streak, coins rows
    SB-->>U: Session JWT (HTTP-only cookie)
    
    U->>MW: GET /dashboard
    MW->>SB: getUser() (validate JWT)
    SB-->>MW: User object
    MW-->>U: Render dashboard

    U->>API: POST /api/entries
    API->>SB: getUser() from cookie
    API->>API: Rate limit check
    API->>API: Zod validation
    API->>DB: INSERT emission_entries
    API->>DB: UPDATE gamification
    API-->>U: { success: true, data: entry }
```

### Demo Mode Flow

When Supabase is not configured, the app operates in **demo mode**:
- `requireCurrentUser()` returns a demo user object
- All reads come from `lib/demo-data.ts` (30 days of synthetic data)
- All writes succeed but are not persisted
- Full feature set remains available for evaluation

---

## 6. Data Flow Diagrams

### 6.1 Emission Entry Flow

```mermaid
graph LR
    INPUT["User Input<br/>(category + input)"] --> VALIDATE["Zod Schema<br/>Validation"]
    VALIDATE --> CALC["Calculator Engine<br/>(India factors)"]
    CALC --> EXT{"External<br/>Provider?"}
    EXT -->|Yes| CLIMATIQ["Climatiq API"]
    EXT -->|No| LOCAL["Local kgCO2e"]
    CLIMATIQ --> MERGE["Merge Result"]
    LOCAL --> MERGE
    MERGE --> DB["Supabase INSERT"]
    DB --> GAMIFY["Gamification<br/>Engine"]
    GAMIFY --> RESPONSE["API Response"]
```

### 6.2 Product Scanner Flow

```mermaid
graph TD
    INPUT["Product Query"] --> TYPE{"Barcode?"}
    TYPE -->|Yes| LOCAL_DB["Local Barcode DB<br/>(8 products)"]
    TYPE -->|No| NAME_DB["Local Name DB<br/>(8 products)"]
    LOCAL_DB -->|Miss| OFF["OpenFoodFacts API"]
    NAME_DB -->|Miss| GEMINI["Gemini AI Analysis"]
    OFF -->|Found| GEMINI
    OFF -->|Not Found| GEMINI
    LOCAL_DB -->|Hit| RESPONSE["Response"]
    NAME_DB -->|Hit| RESPONSE
    GEMINI --> RESPONSE
```

---

## 7. Technology Stack Summary

```mermaid
graph TB
    subgraph Frontend
        NJ["Next.js 14"]
        RE["React 18"]
        TW["TailwindCSS 3"]
        ZU["Zustand 5"]
        RC["Recharts 2"]
        FM["Framer Motion 11"]
        ZD["Zod 4"]
    end

    subgraph Backend
        NR["Node.js Runtime"]
        SA["Supabase Auth"]
        PG["PostgreSQL 15"]
        UR["Upstash Redis"]
    end

    subgraph AI
        GF["Gemini 2.5 Flash"]
    end

    subgraph External
        GM["Google Maps"]
        OF["OpenFoodFacts"]
        CL["Climatiq"]
        PO["PostHog"]
    end

    subgraph DevOps
        VC["Vercel (Hosting)"]
        GH["GitHub (Source)"]
        VI["Vitest (Testing)"]
        PW["Playwright (E2E)"]
    end
```

---

## 8. Scalability Strategy

### 8.1 Current Architecture (0 – 10,000 users)

| Layer | Strategy | Limit |
|-------|----------|-------|
| **Compute** | Vercel Serverless Functions | Auto-scaling, cold start ~200ms |
| **Database** | Supabase Free/Pro (PostgreSQL) | 500MB – 8GB storage |
| **Cache** | Upstash Redis (serverless) | 10,000 req/day (free) – unlimited (paid) |
| **CDN** | Vercel Edge Network | Global, 100+ PoPs |
| **AI** | Gemini 2.5 Flash | 15 RPM free, 1000 RPM paid |

### 8.2 Growth Architecture (10,000 – 100,000 users)

| Upgrade | When | Impact |
|---------|------|--------|
| Supabase Pro | > 500MB DB | Higher connection pooling, daily backups |
| Upstash Pro | > 10K req/day | Dedicated Redis, higher throughput |
| Vercel Pro | > 100GB bandwidth | Faster builds, more serverless concurrency |
| Connection Pooling | > 50 concurrent queries | PgBouncer via Supabase |
| Read Replicas | > 1000 RPM reads | Supabase read replicas for leaderboards |

### 8.3 Horizontal Scaling Considerations

- **Stateless API:** All state stored in PostgreSQL/Redis, enabling horizontal scaling
- **Edge Caching:** Static assets cached for 1 year (`immutable`)
- **PWA Offline:** Service worker caches core pages and emission factors
- **Rate Limiting:** Redis-backed rate limiting prevents abuse at scale
- **Demo Mode:** Zero-dependency mode reduces load for trial users

---

## 9. Performance Considerations

### 9.1 Frontend Optimizations

| Optimization | Implementation |
|---|---|
| **Code Splitting** | Next.js App Router automatic splitting |
| **Tree Shaking** | `optimizePackageImports` for lucide-react, recharts, framer-motion |
| **Lazy Loading** | `next/dynamic` with `{ ssr: false }` for chart components |
| **Image Optimization** | AVIF/WebP auto-format, India-optimized `deviceSizes: [360, 414, 768, 1024, 1280]` |
| **Font Loading** | Plus Jakarta Sans + DM Sans via `next/font` with `display: swap` |
| **SWC Minification** | Enabled via `swcMinify: true` |
| **Console Stripping** | `removeConsole` in production builds |

### 9.2 Backend Optimizations

| Optimization | Implementation |
|---|---|
| **Rate Limiting** | Atomic Redis Lua scripts (token bucket + sliding window) |
| **Connection Pooling** | Supabase built-in PgBouncer |
| **Parallel Queries** | `Promise.all()` for dashboard (4 concurrent queries) |
| **Pagination** | Server-side with Supabase `.range()` |
| **Fail-Open** | Rate limiter fails open on Redis errors |
| **In-Memory Fallback** | Rate limiter works without Redis in development |

### 9.3 Caching Strategy

| Resource | Strategy | TTL |
|----------|----------|-----|
| Google Fonts | CacheFirst | 365 days |
| Emission Factors JSON | CacheFirst | 30 days |
| Core Pages | StaleWhileRevalidate | 7 days |
| Navigation | NetworkFirst (4s timeout) | 24 hours |
| Static Assets | Immutable | 1 year |

---

*This document is a living specification and will be updated as the architecture evolves.*
