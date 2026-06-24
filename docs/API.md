# API Documentation

> **Product:** GreenStep India  
> **Version:** 0.1.0  
> **Last Updated:** 2026-06-25  
> **Base URL:** `https://promptwar-orpin.vercel.app/api`  
> **Owner:** GreenStep Team

---

## Change Log

| Date       | Version | Author         | Description                     |
|------------|---------|----------------|---------------------------------|
| 2026-06-25 | 0.1.0   | GreenStep Team | Initial API documentation       |

---

## 1. API Conventions

### 1.1 Response Envelope

All API responses use a consistent JSON envelope:

```json
// Success
{
  "success": true,
  "data": { ... },
  "error": null
}

// Error
{
  "success": false,
  "data": null,
  "error": "Human-readable error message"
}

// Paginated
{
  "success": true,
  "data": [ ... ],
  "error": null,
  "pagination": {
    "page": 1,
    "limit": 20,
    "total": 150,
    "totalPages": 8
  }
}
```

### 1.2 Authentication

All protected endpoints require a valid Supabase JWT token delivered via HTTP-only cookies (set by the Supabase SSR client). The middleware validates the token and attaches the user context.

**Demo Mode:** When Supabase is not configured, a demo user is returned and API calls succeed with synthetic data.

### 1.3 Rate Limiting

Every API response includes rate limit headers:

| Header | Description |
|--------|-------------|
| `X-RateLimit-Limit` | Maximum requests in window |
| `X-RateLimit-Remaining` | Requests remaining |
| `X-RateLimit-Reset` | Unix timestamp when window resets |
| `Retry-After` | Seconds until retry (only on 429) |

### 1.4 Error Codes

| Status | Meaning | When |
|--------|---------|------|
| `200` | OK | Successful read |
| `201` | Created | Successful creation |
| `401` | Unauthorized | Missing/invalid authentication |
| `403` | Forbidden | Insufficient permissions (RBAC) |
| `404` | Not Found | Resource not found |
| `422` | Unprocessable Entity | Validation failed (Zod) |
| `429` | Too Many Requests | Rate limit exceeded |
| `500` | Internal Server Error | Unexpected server error |
| `502` | Bad Gateway | External service (Gemini) unavailable |

---

## 2. Core Endpoints

### 2.1 Dashboard

#### `GET /api/dashboard`

Returns the user's dashboard overview for the last 30 days.

| Property | Value |
|----------|-------|
| **Auth** | Required |
| **Rate Limit** | authLimiter (100 req/60s) |
| **Demo Mode** | Returns `demoDashboard` from demo-data |

**Response Schema:**

```json
{
  "success": true,
  "data": {
    "profile": {
      "id": "uuid",
      "display_name": "string",
      "city": "string",
      "state": "string",
      "diet_type": "vegetarian | non_veg | vegan"
    },
    "todayKg": 3.45,
    "yesterdayKg": 5.12,
    "weeklyTotalKg": 28.50,
    "indiaDailyAverageKg": 5.2,
    "streak": 7,
    "longestStreak": 14,
    "coins": 250,
    "topCategory": "transport",
    "dailySeries": [
      { "date": "2026-05-27", "kgCo2e": 4.2, "average": 5.2 }
    ],
    "totalLoggedKg": 156.30,
    "totalSavedKg": 12.80
  }
}
```

---

### 2.2 Emission Entries

#### `POST /api/entries`

Log a new carbon emission entry.

| Property | Value |
|----------|-------|
| **Auth** | Required |
| **Rate Limit** | authLimiter (100 req/60s) |
| **Validation** | `entryBodySchema` (Zod) |

**Request Payload:**

```json
{
  "category": "transport",
  "input": {
    "mode": "petrol_car",
    "distanceKm": 15,
    "frequency": 1
  },
  "entry_date": "2026-06-25",
  "notes": "Office commute",
  "sub_type": "petrol_car",
  "externalActivityId": "passenger_vehicle-vehicle_type_car",
  "externalParameters": { "distance": 15, "distance_unit": "km" },
  "externalRegion": "IN"
}
```

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `category` | `string` | ✅ | One of: transport, energy, diet, shopping, waste, digital |
| `input` | `object` | ✅ | Category-specific input object |
| `entry_date` | `string` | ❌ | ISO date (YYYY-MM-DD), defaults to today |
| `notes` | `string` | ❌ | Max 500 characters |
| `sub_type` | `string` | ❌ | Auto-inferred from input if omitted |
| `quantity` | `number` | ❌ | Auto-inferred from input if omitted |
| `unit` | `string` | ❌ | Auto-inferred from category if omitted |
| `externalActivityId` | `string` | ❌ | Climatiq activity ID for external estimation |
| `externalParameters` | `object` | ❌ | Parameters for external estimation |
| `externalRegion` | `string` | ❌ | Region code for external estimation |

**Response (201):**

```json
{
  "success": true,
  "data": {
    "entry": {
      "id": "uuid",
      "user_id": "uuid",
      "entry_date": "2026-06-25",
      "category": "transport",
      "sub_type": "petrol_car",
      "quantity": 15,
      "unit": "km",
      "kg_co2e": 2.88,
      "notes": "Office commute",
      "created_at": "2026-06-25T12:00:00Z"
    },
    "calculation": {
      "kgCo2e": 2.88,
      "label": "Petrol Car",
      "breakdown": { ... }
    },
    "externalProvider": "india_offline_cache",
    "gamification": {
      "coinsEarned": 10,
      "badges": ["first_entry"]
    }
  }
}
```

#### `GET /api/entries`

Retrieve paginated emission entries.

| Property | Value |
|----------|-------|
| **Auth** | Required |
| **Rate Limit** | authLimiter (100 req/60s) |

**Query Parameters:**

| Param | Type | Default | Description |
|-------|------|---------|-------------|
| `date` | `string` | — | Filter by exact date (YYYY-MM-DD) |
| `from` | `string` | — | Filter from date (inclusive) |
| `to` | `string` | — | Filter to date (inclusive) |
| `page` | `number` | 1 | Page number (1-indexed) |
| `limit` | `number` | 20 | Items per page (1-100) |

**Response:**

```json
{
  "success": true,
  "data": [ { "id": "uuid", "category": "transport", "kg_co2e": 2.88, ... } ],
  "pagination": { "page": 1, "limit": 20, "total": 45, "totalPages": 3 }
}
```

---

### 2.3 Carbon Intelligence

#### `POST /api/carbon-intelligence`

Comprehensive carbon analysis across 5 lifestyle categories.

| Property | Value |
|----------|-------|
| **Auth** | Required |
| **Rate Limit** | authLimiter (100 req/60s) |
| **Validation** | `carbonIntelligenceSchema` (Zod) |

**Request Payload:**

```json
{
  "diet": {
    "food_type": "vegetarian",
    "frequency": "three",
    "meat_dairy_level": "low",
    "local_vs_imported": "mostly_local"
  },
  "travel": {
    "commute_mode": "public_transport",
    "km_per_week": 50,
    "flights_per_year": 2,
    "vehicle_type": "petrol"
  },
  "electricity": {
    "monthly_kwh": 200,
    "energy_source": "grid_only",
    "appliance_usage": "moderate"
  },
  "shopping": {
    "monthly_purchases": 10,
    "fashion_type": "mixed",
    "electronics_frequency": "occasionally"
  },
  "waste": {
    "weekly_waste_kg": 5,
    "recycling_percent": 30,
    "composting": false,
    "plastic_usage": "moderate"
  }
}
```

---

### 2.4 AI Coach

#### `POST /api/ai-coach`

AI sustainability advisor powered by Google Gemini 2.5 Flash.

| Property | Value |
|----------|-------|
| **Auth** | Required |
| **Rate Limit** | aiLimiter (10 req/60s) |
| **Validation** | `aiCoachSchema` (Zod) |
| **External** | Google Gemini API |

**Request Payload:**

```json
{
  "messages": [
    { "role": "user", "content": "How can I reduce my commute emissions?" }
  ],
  "userContext": {
    "footprint": 1900,
    "name": "Ananya",
    "city": "Haridwar"
  }
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `messages` | `array` | ✅ | 1-50 messages, content 1-4000 chars |
| `messages[].role` | `string` | ✅ | `user`, `assistant`, or `model` |
| `messages[].content` | `string` | ✅ | 1-4000 characters |
| `userContext` | `object` | ❌ | Enhances AI response with user data |

**Response:**

```json
{
  "success": true,
  "data": {
    "text": "Great question, Ananya! 🚲 Your daily commute..."
  }
}
```

---

### 2.5 Product Scanner

#### `POST /api/scanner`

Analyzes products for carbon footprint via barcode, name, or AI.

| Property | Value |
|----------|-------|
| **Auth** | Required |
| **Rate Limit** | aiLimiter (10 req/60s) |
| **Validation** | `scannerSchema` (Zod) |
| **External** | Gemini AI, OpenFoodFacts |

**Request Payload:**

```json
{
  "query": "iPhone 15",
  "type": "name"
}
```

| Field | Type | Required | Constraints |
|-------|------|----------|-------------|
| `query` | `string` | ✅ | 1-500 characters |
| `type` | `string` | ❌ | `barcode`, `name`, `qr`, `image` |

**Response:**

```json
{
  "success": true,
  "data": {
    "source": "local_db",
    "product": "iPhone 15",
    "brand": "Apple",
    "category": "Electronics",
    "footprint_kg": 70,
    "rating": "D",
    "rating_label": "High",
    "sustainability_score": 28,
    "breakdown": {
      "production": 56, "transport": 5, "use_phase": 6, "disposal": 3
    },
    "packaging": { "type": "Cardboard", "recyclable": true, "biodegradable": false },
    "comparison": "Equivalent to driving 300 km",
    "greener_alternative": "Refurbished iPhone or Fairphone",
    "alternative_footprint_kg": 14,
    "tip": "Keep your phone for 4+ years to halve its annual carbon impact",
    "eco_facts": ["80% of a phone's emissions come from manufacturing"]
  }
}
```

---

### 2.6 Leaderboard

#### `GET /api/leaderboard`

City or state-level emission reduction leaderboard.

| Property | Value |
|----------|-------|
| **Auth** | Required |
| **Query** | `?scope=city` or `?scope=state` |

---

### 2.7 Challenges

#### `GET /api/challenges`

List available challenges.

#### `POST /api/challenges/join`

Join a challenge.

**Request:** `{ "challengeId": "uuid" }`

---

### 2.8 Profile & Badges

#### `GET /api/profile/badges`

Get user's earned badges.

---

### 2.9 Tips

#### `POST /api/tips/complete`

Mark a tip as completed (idempotent).

**Request:** `{ "tipId": "string" }`

---

### 2.10 Roadmap

#### `POST /api/roadmap/generate`

Generate an AI-powered weekly reduction roadmap.

---

### 2.11 Explain

#### `POST /api/explain`

Get AI explanation of carbon footprint factors.

---

### 2.12 Export

#### `GET /api/export`

Export user data.

---

### 2.13 Geocode

#### `POST /api/geocode`

Geocode an address using Google Maps.

**Request:** `{ "address": "string" }`

---

### 2.14 Activity Logging

#### `POST /api/activity`

Log user activity event.

---

### 2.15 Device Management

#### `POST /api/device/register`

Register a new device fingerprint.

---

### 2.16 Session Management

#### `GET /api/sessions`

Get user's active sessions.

#### `POST /api/sessions/revoke`

Revoke a specific session.

---

### 2.17 Auth

#### `GET /api/auth/role`

Get current user's RBAC role.

**Response:** `{ "role": "user" | "admin" | "super_admin" | ... }`

---

## 3. Admin Endpoints

All admin endpoints require RBAC permission checks via `verifyApiPermission()`.

### 3.1 User Management

#### `GET /api/admin/users`

| Property | Value |
|----------|-------|
| **Permission** | `admin:manage_users` |
| **Rate Limit** | authLimiter |

**Response:**

```json
{
  "users": [
    {
      "userId": "uuid",
      "email": "user@example.com",
      "role": "user",
      "createdAt": "2026-01-01T00:00:00Z",
      "lastSignInAt": "2026-06-24T12:00:00Z",
      "activeSessions": 2,
      "totalActivityCount": 0,
      "isBanned": false
    }
  ]
}
```

### 3.2 Role Assignment

#### `PATCH /api/admin/users/[userId]/role`

| **Permission** | `admin:assign_roles` |
|----------------|---------------------|

### 3.3 User Ban

#### `POST /api/admin/users/[userId]/ban`

| **Permission** | `admin:manage_users` |
|----------------|---------------------|

### 3.4 Session Management

#### `GET /api/admin/sessions`

| **Permission** | `admin:view_all_sessions` |
|----------------|--------------------------|

#### `POST /api/admin/sessions/[sessionId]/revoke`

| **Permission** | `admin:force_logout` |
|----------------|---------------------|

### 3.5 Audit Logs

#### `GET /api/admin/audit`

| **Permission** | `admin:view_audit_logs` |
|----------------|------------------------|

---

## 4. Rate Limiting Configuration

| Limiter | Max Requests | Window | Algorithm | Key By | Use Case |
|---------|-------------|--------|-----------|--------|----------|
| `anonLimiter` | 20 | 60s | token_bucket | IP | Unauthenticated |
| `authLimiter` | 100 | 60s | token_bucket | User ID | Authenticated users |
| `aiLimiter` | 10 | 60s | token_bucket | User ID | AI endpoints |
| `sensitiveLimiter` | 5 | 900s (15 min) | sliding_window | IP + identifier | Login/signup/reset |

All limits are configurable via environment variables:
- `RATE_LIMIT_ANON_MAX`, `RATE_LIMIT_ANON_WINDOW_S`
- `RATE_LIMIT_AUTH_MAX`, `RATE_LIMIT_AUTH_WINDOW_S`
- `RATE_LIMIT_AI_MAX`, `RATE_LIMIT_AI_WINDOW_S`
- `RATE_LIMIT_SENSITIVE_MAX`, `RATE_LIMIT_SENSITIVE_WINDOW_S`

---

## 5. OpenAPI 3.0 Compatible Schema (Partial)

```yaml
openapi: "3.0.3"
info:
  title: GreenStep India API
  version: "0.1.0"
  description: India-first carbon footprint tracking platform API
  contact:
    name: GreenStep Team
servers:
  - url: https://promptwar-orpin.vercel.app/api
    description: Production
  - url: http://localhost:3000/api
    description: Local Development

paths:
  /entries:
    post:
      summary: Log emission entry
      security: [{ supabaseAuth: [] }]
      requestBody:
        required: true
        content:
          application/json:
            schema:
              $ref: "#/components/schemas/EntryBody"
      responses:
        "201":
          description: Entry created
          content:
            application/json:
              schema:
                $ref: "#/components/schemas/EntryResponse"
        "401":
          $ref: "#/components/responses/Unauthorized"
        "422":
          $ref: "#/components/responses/ValidationError"
        "429":
          $ref: "#/components/responses/RateLimited"

    get:
      summary: List emission entries
      security: [{ supabaseAuth: [] }]
      parameters:
        - name: date
          in: query
          schema: { type: string, format: date }
        - name: from
          in: query
          schema: { type: string, format: date }
        - name: to
          in: query
          schema: { type: string, format: date }
        - name: page
          in: query
          schema: { type: integer, default: 1 }
        - name: limit
          in: query
          schema: { type: integer, default: 20, maximum: 100 }
      responses:
        "200":
          description: Paginated entries
        "401":
          $ref: "#/components/responses/Unauthorized"

components:
  securitySchemes:
    supabaseAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT
      description: Supabase JWT token via HTTP-only cookie

  schemas:
    EntryBody:
      type: object
      required: [category, input]
      properties:
        category:
          type: string
          enum: [transport, energy, diet, shopping, waste, digital]
        input:
          type: object
          additionalProperties: true
        entry_date:
          type: string
          format: date
        notes:
          type: string
          maxLength: 500

    ApiSuccess:
      type: object
      properties:
        success: { type: boolean, enum: [true] }
        data: { type: object }
        error: { type: "null" }

    ApiError:
      type: object
      properties:
        success: { type: boolean, enum: [false] }
        data: { type: "null" }
        error: { type: string }

  responses:
    Unauthorized:
      description: Authentication required
      content:
        application/json:
          schema:
            $ref: "#/components/schemas/ApiError"
    ValidationError:
      description: Validation failed
    RateLimited:
      description: Too many requests
      headers:
        Retry-After:
          schema: { type: integer }
```

---

*This document is a living specification and will be updated as the API evolves.*
