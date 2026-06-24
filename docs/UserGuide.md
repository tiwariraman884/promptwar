# User Guide

> **Product:** GreenStep India  
> **Version:** 0.1.0  
> **Last Updated:** 2026-06-25  
> **Owner:** GreenStep Team  
> **Audience:** End Users

---

## Change Log

| Date       | Version | Author         | Description                         |
|------------|---------|----------------|-------------------------------------|
| 2026-06-25 | 0.1.0   | GreenStep Team | Initial user guide                  |

---

## 1. Getting Started

### What is GreenStep India?

GreenStep India is a Progressive Web App (PWA) that helps you understand, track, and reduce your personal carbon footprint — designed specifically for Indian lifestyles.

### Key Features at a Glance

| Feature | What It Does |
|---------|-------------|
| 🌿 **Carbon Calculator** | Log your daily emissions across 10 categories |
| 📊 **Dashboard** | See your daily, weekly, and monthly trends |
| 🤖 **AI Coach** | Chat with EcoCoach for personalized sustainability advice |
| 📷 **Product Scanner** | Scan products to see their carbon footprint |
| 🏆 **Gamification** | Earn eco-coins, badges, and maintain streaks |
| 📈 **Analytics** | 12+ interactive charts for deep emissions analysis |
| 🗺️ **Green Map** | Find eco-friendly spots near you |
| 👥 **Community** | Join challenges and compete on leaderboards |
| 🎯 **Goal Tracking** | Set and track emission reduction goals |
| 💡 **Quick Wins** | Get actionable tips to reduce your impact |

### System Requirements

- Any modern web browser (Chrome 90+, Safari 15+, Firefox 90+)
- Works on mobile, tablet, and desktop
- Optional: Install as PWA for offline access

---

## 2. Registration

### Creating Your Account

1. Visit [GreenStep India](https://promptwar-orpin.vercel.app)
2. You'll be directed to the **login page**
3. Enter your email address and create a password
4. Click **Sign Up**
5. Check your email for a verification link (if configured)
6. Click the verification link to activate your account

### Demo Mode

Don't want to create an account yet? GreenStep works in **demo mode** — you can explore all features with sample data, no sign-up required.

---

## 3. Login

### Signing In

1. Navigate to the login page at `/auth`
2. Enter your registered email and password
3. Click **Sign In**
4. You'll be redirected to your **Dashboard**

### Session Management

- Your session lasts **30 days** by default
- You can view all active sessions in **Settings → Security**
- Revoke any suspicious sessions from the settings page

---

## 4. Dashboard Usage

### Overview

The dashboard is your daily command center. Here's what each section shows:

```
┌─────────────────────────────────────┐
│  🌿 Welcome, [Name]!                │
│  📍 Haridwar, Uttarakhand           │
├─────────────────────────────────────┤
│  Today: 3.45 kg    │ Streak: 🔥 7   │
│  Weekly: 28.5 kg   │ Coins: 🪙 250  │
├─────────────────────────────────────┤
│  📈 30-Day Trend Chart              │
│  [Daily emissions vs. India avg]    │
├─────────────────────────────────────┤
│  🏆 Top Category: Transport         │
│  💰 Total Saved: 12.8 kg CO₂       │
└─────────────────────────────────────┘
```

### Key Metrics

| Metric | Description |
|--------|-------------|
| **Today's Emissions** | Total CO₂e logged today |
| **Weekly Total** | Sum of last 7 days' emissions |
| **India Average** | 5.2 kg/day — the national daily average |
| **Streak** | Consecutive days with logged entries |
| **Eco-Coins** | Rewards earned for logging and reducing |
| **Top Category** | Your highest-emission category |
| **Total Saved** | Difference between average and your actual emissions |

### Daily Trend Chart

The 30-day trend chart shows:
- **Green bars**: Your daily emissions
- **Dotted line**: India daily average (5.2 kg/day)
- Days below the average line = you're doing better than most Indians!

---

## 5. Carbon Calculator Usage

### How to Log an Entry

1. Navigate to **Calculator** from the sidebar
2. **Choose a category:**

   | Category | Examples |
   |----------|---------|
   | 🚗 Transport | Car commute, bus ride, flight, metro |
   | ⚡ Energy | Electricity, LPG cooking, AC usage |
   | 🍛 Diet | Vegetarian meal, chicken, beef |
   | 🛍️ Shopping | Clothing, electronics, online orders |
   | 🗑️ Waste | Weekly garbage, recycling |
   | 💻 Digital | Streaming, video calls |

3. **Fill in the details:**
   - For **Transport**: Select mode, enter distance (km), frequency
   - For **Energy**: Enter monthly kWh or LPG cylinders
   - For **Diet**: Select diet type and meal frequency
   
4. Click **Calculate** to see your result
5. The result shows:
   - **kg CO₂e** — your carbon equivalent
   - **Impact comparison** — e.g., "equivalent to driving 15 km"
   - **Eco-coins earned** — rewards for logging

### Understanding Your Results

| Rating | CO₂e Range | Meaning |
|--------|-----------|---------|
| 🟢 Low | < 1 kg | Great choice! Below average |
| 🟡 Moderate | 1–5 kg | Average impact |
| 🟠 High | 5–10 kg | Consider alternatives |
| 🔴 Very High | > 10 kg | Significant impact — look for changes |

---

## 6. Goal Tracking

### Setting Goals

1. Navigate to **Analytics → Goals** tab
2. Your default goal is the **India daily average** (5.2 kg/day)
3. View your progress ring showing how close you are to target

### Tracking Progress

| Metric | Description |
|--------|-------------|
| **Progress Ring** | Visual % toward your goal |
| **Current Streak** | Consecutive days meeting goal |
| **Best Streak** | All-time best consecutive days |
| **Predicted Success** | AI-calculated probability of meeting goal |

---

## 7. Analytics Usage

### Navigating Analytics

The Analytics page has **5 tabs**, each offering different insights:

#### Tab 1: Daily Trends 📈
- **Line chart** showing daily emissions with rolling 7-day average
- **Day-over-day change** cards with trend arrows
- **Category breakdown** for each day

#### Tab 2: Weekly Trends 📊
- **Bar chart** comparing weekly emissions
- **Radar chart** showing category distribution
- **Week-over-week performance** scores

#### Tab 3: Forecast 🔮
- **Area chart** with predicted future emissions
- **Confidence bands** (90% interval) showing prediction certainty
- **4 time horizons**: 7 days, 30 days, 90 days, 365 days

#### Tab 4: Goals 🎯
- **Progress ring** for current goal
- **Streak history** and milestone tracking
- **AI success prediction** based on your trend

#### Tab 5: Insights 💡
- **Sustainability gauge** (overall score 0–100)
- **Heatmap** showing emission hotspots by day and category
- **Top activities** ranked by carbon impact
- **AI recommendations** for reduction

### Exporting Data

1. Click the **Export** button (top-right of Analytics)
2. Choose:
   - **CSV** — Downloads a spreadsheet of all your emission data
   - **PDF** — Opens a print-friendly version for reports

---

## 8. AI Features

### AI Coach (EcoCoach)

1. Navigate to **AI Coach** from the sidebar
2. Ask any sustainability question, for example:
   - *"How can I reduce my commute emissions?"*
   - *"Is oat milk better than dairy?"*
   - *"How much CO₂ does my AC produce?"*
3. EcoCoach responds with **quantified advice** (kg CO₂e numbers) tailored to Indian context
4. The AI remembers your conversation context for follow-up questions

### Product Scanner

1. Navigate to **Scanner** from the sidebar
2. Enter a **product name** (e.g., "iPhone 15") or **barcode number**
3. View the analysis:
   - Carbon footprint breakdown (production, transport, use, disposal)
   - Sustainability score (0–100) and rating (A+ to F)
   - Greener alternative suggestions
   - Packaging recyclability
   - Eco facts

---

## 9. Gamification

### Eco-Coins 🪙

| Action | Coins Earned |
|--------|-------------|
| Log a daily entry | +10 coins |
| Maintain streak (7 days) | +50 bonus |
| Complete a challenge | +100 bonus |
| Mark a tip as done | +5 coins |

### Badges 🏅

Badges are earned for milestones:
- **First Entry** — Log your first emission
- **Week Warrior** — 7-day streak
- **Month Champion** — 30-day streak
- **Category Explorer** — Log in all 6 categories
- **Below Average** — Daily emissions below India average

### Streaks 🔥

- Log at least one entry per day to maintain your streak
- Streaks reset if you miss a day
- Your longest streak is tracked and displayed

### Leaderboards 🏆

1. Navigate to **Leaderboard** from the sidebar
2. Toggle between:
   - **City** — Compare with users in your city
   - **State** — Compare with users in your state
3. Rankings are based on emission reduction percentage vs. India average

---

## 10. Troubleshooting

### Common Issues

| Issue | Solution |
|-------|----------|
| **App won't load** | Clear browser cache, try incognito mode |
| **Login fails** | Check email/password, try "Forgot Password" |
| **Data not saving** | Check internet connection, refresh page |
| **Charts not rendering** | Ensure JavaScript is enabled, try Chrome |
| **AI Coach not responding** | Check if Gemini API key is configured (admin) |
| **Scanner returns "N/A"** | Product not in database; needs Gemini API key |
| **Dark mode issues** | Toggle via Settings → Appearance |
| **PWA not installing** | Use Chrome or Edge on mobile for best PWA support |

### Performance Tips

- **Slow on mobile?** Install as PWA for faster loads (caches pages offline)
- **High data usage?** The app caches fonts and static data after first load
- **Charts laggy?** Close other browser tabs to free memory

### Getting Help

- **In-app:** Use the AI Coach to ask questions about features
- **Settings:** Access app settings via the gear icon in the sidebar
- **Admin:** Contact your platform administrator for account issues

---

## 11. FAQ

### General

**Q: Do I need to create an account?**  
A: No — you can use the app in demo mode without an account. However, your data won't be saved across sessions.

**Q: Is my data private?**  
A: Yes. Row Level Security ensures you can only see your own data. See the [Security Documentation](./Security.md) for details.

**Q: Does the app work offline?**  
A: The core calculator and tips pages work offline when installed as a PWA. Data will sync when you reconnect.

### Carbon Tracking

**Q: How accurate are the emission calculations?**  
A: We use India-specific emission factors calibrated from IPCC AR6 data. For example:
- Indian electricity grid: 0.82 kg CO₂/kWh
- Petrol car: 192g CO₂/km
- LPG cylinder: 41 kg CO₂/cylinder

**Q: What's the India daily average?**  
A: 5.2 kg CO₂e per person per day (1.9 tonnes/year ÷ 365 days).

**Q: Can I edit or delete past entries?**  
A: Yes — entries can be modified or deleted from your entry history.

### AI Features

**Q: Does the AI Coach remember my conversations?**  
A: Yes, within a single session. Conversations are not saved between sessions.

**Q: How does the Product Scanner work?**  
A: It first checks a local database of common Indian products. If not found, it queries OpenFoodFacts (for barcodes) and uses Google Gemini AI for analysis.

### Gamification

**Q: How do I earn eco-coins?**  
A: Log daily entries (+10), maintain streaks (+50 bonus at 7 days), and complete challenges (+100).

**Q: Do leaderboards show my real name?**  
A: No — leaderboard entries are anonymized (e.g., "GreenStep 01").

---

*This guide is a living document and will be updated as new features are released.*
