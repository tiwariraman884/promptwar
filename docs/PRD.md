# Product Requirements Document (PRD)

> **Product:** GreenStep India  
> **Version:** 0.1.0  
> **Last Updated:** 2026-06-25  
> **Owner:** GreenStep Team  
> **Status:** Active Development

---

## Change Log

| Date       | Version | Author         | Description                         |
|------------|---------|----------------|-------------------------------------|
| 2026-06-25 | 0.1.0   | GreenStep Team | Initial PRD generation              |

---

## 1. Product Vision

**GreenStep India** is an India-first carbon footprint awareness Progressive Web App (PWA) designed to make personal environmental impact tracking accessible, gamified, and actionable — starting from Haridwar, Uttarakhand, and scaling across India.

> *"Every step you take towards sustainability is a GreenStep."*

The platform transforms complex climate science into daily actionable insights, leveraging India-specific emission factors, AI-powered coaching, and community gamification to drive measurable behavior change.

---

## 2. Problem Statement

### The Problem
- The average Indian produces **~1.9 tonnes of CO₂ annually** (~5.2 kg/day), yet **fewer than 3% of Indians** actively track or understand their personal carbon footprint.
- Existing carbon calculators are Western-centric (using US/EU emission factors), generic, and lack engagement mechanisms.
- No tool exists that uses **India-specific data** (LPG cylinder emissions, metro rail factors, festival footprints, monsoon patterns) to provide culturally relevant guidance.

### The Gap
| Existing Tools | GreenStep Advantage |
|---|---|
| Western emission factors | India-specific: IPCC-calibrated for Indian grid, transport, diet |
| One-time calculators | Daily tracking with streak-based gamification |
| No AI guidance | Gemini-powered AI Coach + rule-based explainer |
| Desktop-only | PWA optimized for Indian 3G/4G mobile networks |
| English-only | Hindi + English bilingual support |

---

## 3. Business Objectives

| Objective | Key Result | Timeline |
|---|---|---|
| **User Acquisition** | 10,000 active users in Uttarakhand | Q4 2026 |
| **Engagement** | 60% weekly retention rate | Q1 2027 |
| **Impact** | Measurable 15% avg. reduction in user footprints | Q2 2027 |
| **Data** | Build India's largest personal carbon emissions dataset | Q3 2027 |
| **Revenue** | Premium tier conversion at 5% | Q1 2027 |

---

## 4. Target Audience

### Primary Market
- **Geography:** Urban and semi-urban India (Tier 2/3 cities like Haridwar, Dehradun, Rishikesh)
- **Age:** 18–35 years old, digitally native
- **Income:** ₹20,000–₹1,00,000/month household income
- **Tech:** Android-first, 4G/5G connectivity, budget smartphones

### Secondary Market
- Educational institutions for sustainability curricula
- Corporate ESG programs for employee engagement
- Government bodies (Swachh Bharat, PM-KUSUM alignment)

---

## 5. User Personas

### Persona 1: Ananya — The Conscious Student 🎓
- **Age:** 22, B.Tech student in Haridwar
- **Device:** Redmi Note 12, Jio 4G
- **Motivation:** Wants to reduce impact but doesn't know where to start
- **Pain Points:** Finds Western carbon tools confusing; wants guidance in Hindi
- **Key Features:** Calculator, AI Coach, Quick Wins, Community Challenges
- **Quote:** *"I want to do my part for the environment but I need someone to tell me what actually matters."*

### Persona 2: Rajesh — The Middle-Class Family Head 👨‍👩‍👧‍👦
- **Age:** 38, Government employee in Dehradun
- **Device:** Samsung Galaxy M34, Airtel 4G
- **Motivation:** Reduce electricity and LPG bills while being eco-friendly
- **Pain Points:** Skeptical about climate apps; needs to see ₹ savings
- **Key Features:** Energy Audit, Bill Predict, Commute optimizer
- **Quote:** *"Show me how much money I'll save, then I'll care about CO₂."*

### Persona 3: Priya — The Eco-Influencer 🌿
- **Age:** 27, Content creator in Rishikesh
- **Device:** iPhone 14, Wi-Fi
- **Motivation:** Content creation around sustainability; wants shareable data
- **Pain Points:** Needs visually appealing charts and exportable reports
- **Key Features:** Analytics, Carbon Twin, Scanner, Export features
- **Quote:** *"I need beautiful graphs I can share on Instagram to inspire my followers."*

### Persona 4: Admin Sharma — The Platform Manager 🔧
- **Age:** 30, Operations lead
- **Motivation:** Ensure platform integrity, monitor user growth, handle abuse
- **Key Features:** Admin dashboard, RBAC, Audit logs, Session management
- **Quote:** *"I need to see who's doing what and ensure nobody's gaming the system."*

---

## 6. Functional Requirements

### 6.1 Core Features

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| FR-001 | Carbon footprint calculator (10 categories) | P0 | ✅ Done |
| FR-002 | Daily emission entry logging | P0 | ✅ Done |
| FR-003 | Dashboard with daily/weekly/monthly trends | P0 | ✅ Done |
| FR-004 | AI Coach (Gemini-powered sustainability advisor) | P0 | ✅ Done |
| FR-005 | Product scanner (barcode + name + AI analysis) | P0 | ✅ Done |
| FR-006 | Gamification (eco-coins, badges, streaks, XP) | P0 | ✅ Done |
| FR-007 | Community challenges (individual + group) | P1 | ✅ Done |
| FR-008 | City/State leaderboards | P1 | ✅ Done |
| FR-009 | Enterprise analytics (5 views, 12+ charts) | P1 | ✅ Done |
| FR-010 | Carbon Twin (digital twin lifestyle model) | P1 | ✅ Done |

### 6.2 Advanced Features

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| FR-011 | Scenario simulator (what-if analysis) | P1 | ✅ Done |
| FR-012 | AI-generated personalized roadmap | P1 | ✅ Done |
| FR-013 | Green Map (eco-friendly locations) | P1 | ✅ Done |
| FR-014 | Green Communities | P1 | ✅ Done |
| FR-015 | Health Score (carbon health assessment) | P1 | ✅ Done |
| FR-016 | Energy Audit (household analysis) | P2 | ✅ Done |
| FR-017 | Air Quality Index monitor | P2 | ✅ Done |
| FR-018 | Bill Prediction (electricity cost forecast) | P2 | ✅ Done |
| FR-019 | Commute optimizer | P2 | ✅ Done |
| FR-020 | Legacy page (long-term impact view) | P2 | ✅ Done |

### 6.3 Platform Features

| ID | Feature | Priority | Status |
|----|---------|----------|--------|
| FR-021 | Supabase authentication (email/magic link) | P0 | ✅ Done |
| FR-022 | Demo mode (full offline without Supabase) | P0 | ✅ Done |
| FR-023 | RBAC (6 roles, 15 permissions) | P0 | ✅ Done |
| FR-024 | Admin dashboard (user management, audit) | P0 | ✅ Done |
| FR-025 | Session management (track, revoke, expire) | P1 | ✅ Done |
| FR-026 | Device fingerprinting | P1 | ✅ Done |
| FR-027 | Audit logging (18 action types, 3 severities) | P1 | ✅ Done |
| FR-028 | Rate limiting (Redis/Upstash, 4 tiers) | P0 | ✅ Done |
| FR-029 | CSV/PDF export | P2 | ✅ Done |
| FR-030 | Bilingual i18n (English + Hindi) | P1 | ✅ Done |

---

## 7. Non-Functional Requirements

| Category | Requirement | Target |
|---|---|---|
| **Performance** | First Contentful Paint | < 1.5s on 4G |
| **Performance** | Time to Interactive | < 3s on 4G |
| **Performance** | Lighthouse score | > 90 |
| **Availability** | Uptime SLA | 99.5% |
| **Scalability** | Concurrent users | 10,000+ |
| **Security** | OWASP Top 10 compliance | Full |
| **Security** | Data encryption | TLS 1.3 + AES-256 at rest |
| **Accessibility** | WCAG compliance | 2.1 AA |
| **Offline** | Core calculator & tips | Fully offline via PWA |
| **Mobile** | Responsive design | 360px – 1440px |
| **i18n** | Languages supported | English, Hindi |
| **Browser** | Support matrix | Chrome 90+, Safari 15+, Firefox 90+ |

---

## 8. User Stories

### Carbon Tracking
- **US-001:** As a user, I want to log my daily transport emissions so I can see how my commute impacts the environment.
- **US-002:** As a user, I want to see my weekly trend chart so I can track whether I'm improving.
- **US-003:** As a user, I want the calculator to use India-specific factors (metros, LPG, etc.) so the data is accurate for my lifestyle.

### AI & Intelligence
- **US-004:** As a user, I want to chat with an AI coach about sustainability so I get personalized advice.
- **US-005:** As a user, I want to scan a product barcode and see its carbon footprint so I can make greener purchase decisions.
- **US-006:** As a user, I want an AI-generated roadmap so I have a week-by-week plan to reduce my footprint.

### Gamification
- **US-007:** As a user, I want to earn eco-coins for logging entries so I feel rewarded for my efforts.
- **US-008:** As a user, I want to maintain a daily streak so I stay motivated to track consistently.
- **US-009:** As a user, I want to join community challenges so I can compete with others in my city.

### Analytics
- **US-010:** As a user, I want to see forecasted emissions so I know where I'm heading.
- **US-011:** As a user, I want to export my data as CSV so I can use it in reports.
- **US-012:** As a user, I want to see which day-of-week and category contributes most to my footprint (heatmap).

### Administration
- **US-013:** As an admin, I want to view all users and their roles so I can manage the platform.
- **US-014:** As an admin, I want audit logs for all security events so I can investigate incidents.
- **US-015:** As an admin, I want to force-logout suspicious sessions so I can protect user accounts.

---

## 9. Success Metrics

| Metric | Definition | Target | Measurement |
|---|---|---|---|
| **DAU/MAU** | Daily active / Monthly active | > 0.4 | PostHog analytics |
| **Streak Length** | Average consecutive logging days | > 7 days | Supabase query |
| **Entries/User/Week** | Emission entries per user per week | > 5 | API analytics |
| **Footprint Reduction** | Avg. % reduction after 30 days | > 10% | Before/after baseline |
| **AI Coach Usage** | % users engaging with AI Coach weekly | > 30% | API logs |
| **Scanner Usage** | Product scans per user per month | > 3 | API logs |
| **NPS** | Net Promoter Score | > 50 | In-app survey |
| **Crash Rate** | Unhandled errors / session | < 0.1% | Sentry/PostHog |

---

## 10. Future Roadmap

### Phase 2 — Q3 2026
- [ ] Social features: Friend challenges, carbon comparison
- [ ] Marketplace: Redeem eco-coins for partner rewards
- [ ] OCR receipt scanning for automated entry creation
- [ ] WhatsApp bot for quick logging

### Phase 3 — Q4 2026
- [ ] Vernacular languages: Tamil, Telugu, Bengali, Marathi
- [ ] Household carbon tracking (multi-user profiles)
- [ ] Carbon offset marketplace (verified Indian projects)
- [ ] Enterprise API for corporate ESG reporting

### Phase 4 — 2027
- [ ] Government integration (Swachh Bharat, PM-KUSUM dashboards)
- [ ] Schools program (curriculum-integrated tracking)
- [ ] Wearable integration (Fitbit/Samsung Health → auto commute detection)
- [ ] Blockchain-based carbon credit tokenization

---

*This document is a living specification and will be updated as the product evolves.*
