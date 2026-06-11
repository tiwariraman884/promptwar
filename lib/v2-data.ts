import type { EmissionCategory } from "@/lib/emission-factors";

export const featurePages = [
  {
    href: "/",
    page: "Page 0",
    title: "Splash / Landing",
    summary: "Animated leaf logo, Track. Reduce. Thrive. tagline, India per-capita stat, and start routing."
  },
  {
    href: "/onboarding",
    page: "Page 1",
    title: "Onboarding",
    summary: "Five-step setup for city, lifestyle, commute, energy, and reduction goal."
  },
  {
    href: "/dashboard",
    page: "Page 2",
    title: "Dashboard",
    summary: "Today CO2, streak risk, stat cards, chart, budget ring, AI insight, quick add, and mini log."
  },
  {
    href: "/calculator",
    page: "Page 3",
    title: "Calculator",
    summary: "Ten-category live calculator with India-specific factors and sticky log bar."
  },
  {
    href: "/coach",
    page: "Page 4",
    title: "AI Carbon Coach",
    summary: "Claude-ready chat UI, prompt chips, voice input affordance, weekly plan, and export action."
  },
  {
    href: "/scanner",
    page: "Page 5",
    title: "Bill Scanner",
    summary: "Camera/gallery OCR flow with editable parsed values and scan history."
  },
  {
    href: "/tips",
    page: "Page 6",
    title: "Tips & Actions",
    summary: "Impact-by-ease ranked tips, India schemes, reminders, and AI deep links."
  },
  {
    href: "/map",
    page: "Page 7",
    title: "Green Map",
    summary: "Filterable Haridwar green spots, radius control, add spot, directions, and check-ins."
  },
  {
    href: "/community",
    page: "Page 8",
    title: "Community",
    summary: "City/state leaderboards, weekly challenge, group challenges, sharing, referrals, and friends."
  },
  {
    href: "/store",
    page: "Page 9",
    title: "Eco Store",
    summary: "Eco-coin reward catalog with redemption flow and earning summary."
  },
  {
    href: "/offsets",
    page: "Page 10",
    title: "Carbon Offset Marketplace",
    summary: "India-focused offset projects, kg slider, Razorpay-ready purchase API, and certificates."
  },
  {
    href: "/groups",
    page: "Page 11",
    title: "Family / Group Dashboard",
    summary: "Create/join groups, household/corporate dashboards, invite codes, and ESG exports."
  },
  {
    href: "/profile",
    page: "Page 12",
    title: "Profile & Settings",
    summary: "Avatar, stats, badges, history, language, privacy, exports, IoT, and account controls."
  }
] as const;

export const coachSystemPrompt =
  "You are GreenStep Coach, an expert carbon footprint advisor for Indian users. You know India-specific emission factors such as CEA grid 0.82 kg/kWh and Indian Railways 0.012 kg/km. Speak warmly, never with guilt. Suggest practical, affordable actions for Indian middle-class users. Reference the user's actual data when context is supplied. Match the user's language preference, English or Hindi. Keep responses under 120 words unless asked to elaborate.";

export const aiModelConfig = {
  provider: "Anthropic Claude API",
  model: "claude-sonnet-4-20250514",
  maxTokens: 400,
  streaming: true
} as const;

export const quickPromptChips = [
  "What's my biggest source of emissions?",
  "Give me a 7-day green challenge",
  "How can I reduce my food delivery impact?",
  "Explain carbon offsets in simple terms",
  "What government schemes can I use in India?",
  "How do I reduce my electricity bill AND carbon footprint?",
  "Generate my monthly carbon report"
] as const;

export const demoUserContext = {
  name: "Ananya",
  city: "Haridwar",
  diet: "vegetarian",
  vehicle: "two_wheeler_petrol",
  top_categories: [
    { name: "Transport", kg: 12.4, pct: 42 },
    { name: "Energy", kg: 8.1, pct: 27 },
    { name: "Food Delivery", kg: 3.2, pct: 11 }
  ],
  streak: 6,
  coins: 340,
  level: "Sapling",
  goal_pct: 20,
  goal_progress_pct: 38,
  language: "en"
} as const;

export const scanTypes = [
  "electricity",
  "lpg",
  "petrol",
  "flight",
  "food",
  "ride"
] as const;

export const demoScanHistory = [
  {
    id: "scan-upcl-001",
    scanType: "electricity",
    title: "UPCL electricity bill",
    parsedUnits: 142,
    kgCo2e: 116.44,
    scannedAt: "2026-06-05T10:30:00.000Z"
  },
  {
    id: "scan-lpg-001",
    scanType: "lpg",
    title: "LPG delivery receipt",
    parsedUnits: 1,
    kgCo2e: 29.5,
    scannedAt: "2026-06-03T09:15:00.000Z"
  },
  {
    id: "scan-food-001",
    scanType: "food",
    title: "Zomato dinner order",
    parsedUnits: 3.5,
    kgCo2e: 0.44,
    scannedAt: "2026-06-01T20:15:00.000Z"
  }
] as const;

export const greenSpotTypes = [
  { type: "ev_charger", label: "EV charging", color: "#378ADD" },
  { type: "recycling", label: "Recycling", color: "#1D9E75" },
  { type: "cycle_rental", label: "Cycle rental", color: "#BA7517" },
  { type: "organic_store", label: "Organic store", color: "#085041" },
  { type: "tree_plantation", label: "Tree drives", color: "#5A8F42" },
  { type: "solar_dealer", label: "Solar dealer", color: "#E0A800" },
  { type: "e_waste", label: "E-waste", color: "#7C3AED" }
] as const;

export const demoGreenSpots = [
  {
    id: "spot-patanjali-organic",
    name: "Patanjali organic store",
    type: "organic_store",
    lat: 29.927,
    lng: 78.132,
    city: "Haridwar",
    address: "Patanjali Yogpeeth area",
    hours: "9 AM - 8 PM",
    description: "Local produce and low-packaging staples.",
    verified: true
  },
  {
    id: "spot-upcl-solar",
    name: "UPCL office solar queries",
    type: "solar_dealer",
    lat: 29.946,
    lng: 78.164,
    city: "Haridwar",
    address: "Haridwar UPCL office area",
    hours: "10 AM - 5 PM",
    description: "Start PM-Surya Ghar rooftop solar paperwork.",
    verified: true
  },
  {
    id: "spot-har-ki-pauri-cycle",
    name: "Har-Ki-Pauri cycle stand",
    type: "cycle_rental",
    lat: 29.956,
    lng: 78.171,
    city: "Haridwar",
    address: "Near Har-Ki-Pauri",
    hours: "6 AM - 9 PM",
    description: "Cycle access for short local trips.",
    verified: true
  },
  {
    id: "spot-shivalik-ewaste",
    name: "Shivalik Nagar e-waste drive",
    type: "e_waste",
    lat: 29.935,
    lng: 78.081,
    city: "Haridwar",
    address: "Shivalik Nagar community area",
    hours: "Weekend drives",
    description: "Periodic phone, battery, and electronics collection.",
    verified: true
  },
  {
    id: "spot-rail-recycling",
    name: "Haridwar railway recycling point",
    type: "recycling",
    lat: 29.947,
    lng: 78.155,
    city: "Haridwar",
    address: "Haridwar Junction",
    hours: "Open daily",
    description: "Segregated waste bins near transit flows.",
    verified: true
  },
  {
    id: "spot-sidcul-charger",
    name: "SIDCUL EV charging point",
    type: "ev_charger",
    lat: 29.949,
    lng: 78.062,
    city: "Haridwar",
    address: "SIDCUL industrial area",
    hours: "24 hours",
    description: "Useful charging stop for e-scooter and EV commuters.",
    verified: true
  },
  {
    id: "spot-ranipur-recycling",
    name: "Ranipur recycling drop-off",
    type: "recycling",
    lat: 29.934,
    lng: 78.128,
    city: "Haridwar",
    address: "Ranipur Mor area",
    hours: "8 AM - 6 PM",
    description: "Dry waste sorting point for paper, plastic, and metal.",
    verified: false
  },
  {
    id: "spot-bhel-tree-drive",
    name: "BHEL tree plantation drive",
    type: "tree_plantation",
    lat: 29.945,
    lng: 78.103,
    city: "Haridwar",
    address: "BHEL township green belt",
    hours: "Event based",
    description: "Community plantation and cleanup events.",
    verified: true
  },
  {
    id: "spot-kankhal-organic",
    name: "Kankhal local produce store",
    type: "organic_store",
    lat: 29.927,
    lng: 78.15,
    city: "Haridwar",
    address: "Kankhal market",
    hours: "8 AM - 8 PM",
    description: "Seasonal produce and low-mileage groceries.",
    verified: false
  },
  {
    id: "spot-jwalapur-solar",
    name: "Jwalapur solar installer desk",
    type: "solar_dealer",
    lat: 29.93,
    lng: 78.12,
    city: "Haridwar",
    address: "Jwalapur market",
    hours: "10 AM - 7 PM",
    description: "Rooftop solar consultation and installation leads.",
    verified: false
  }
] as const;

export const ecoCoinEarnings = [
  { action: "Log entry", coins: 10 },
  { action: "Complete tip", coins: 5 },
  { action: "Scan bill", coins: 15 },
  { action: "Green Map check-in", coins: 20 },
  { action: "Badge unlock", coins: 25 },
  { action: "7-day streak", coins: 25 },
  { action: "Weekly challenge", coins: 50 },
  { action: "Refer friend", coins: 100 },
  { action: "Monthly challenge", coins: 200 }
] as const;

export const ecoRewards = [
  {
    id: "tree-sankalptaru",
    title: "Plant a tree",
    description: "50 coins funds one tree through an India tree partner.",
    coinCost: 50,
    category: "plant_a_tree",
    partnerName: "SankalpTaru / WeForest India",
    stock: 220,
    discountPct: 0
  },
  {
    id: "ngo-goonj",
    title: "NGO donation",
    description: "100 coins maps to Rs 50 donated to a vetted India NGO.",
    coinCost: 100,
    category: "ngo_donation",
    partnerName: "Goonj, WWF India, Greenpeace India",
    stock: 180,
    discountPct: 0
  },
  {
    id: "ev-discount",
    title: "EV accessory discount",
    description: "Partner coupon for EV helmets, chargers, or servicing.",
    coinCost: 150,
    category: "coupon",
    partnerName: "EV partner network",
    stock: 48,
    discountPct: 12
  },
  {
    id: "cleanup-ticket",
    title: "Cleanup drive ticket",
    description: "Free entry to a local cleanup walk or nature event.",
    coinCost: 75,
    category: "event_ticket",
    partnerName: "Namami Gange volunteers",
    stock: 64,
    discountPct: 0
  },
  {
    id: "gold-standard-offset",
    title: "Carbon offset certificate",
    description: "200 coins issues a 10 kg CO2 offset certificate.",
    coinCost: 200,
    category: "offset_certificate",
    partnerName: "Gold Standard project pool",
    stock: 95,
    discountPct: 0
  }
] as const;

export const offsetProjects = [
  {
    id: "uttarakhand-reforestation",
    title: "Uttarakhand reforestation",
    location: "Uttarakhand",
    priceInrPerKg: 12,
    description: "Native hillside planting and maintenance."
  },
  {
    id: "rajasthan-solar",
    title: "Rajasthan solar farm",
    location: "Rajasthan",
    priceInrPerKg: 15,
    description: "Verified solar generation replacing grid emissions."
  },
  {
    id: "bihar-cookstoves",
    title: "Bihar improved cookstoves",
    location: "Bihar",
    priceInrPerKg: 10,
    description: "Efficient stoves that reduce fuel use and indoor smoke."
  },
  {
    id: "maharashtra-mangroves",
    title: "Maharashtra mangrove restoration",
    location: "Maharashtra",
    priceInrPerKg: 18,
    description: "Coastal blue-carbon restoration and protection."
  }
] as const;

export const groupDemo = {
  id: "family-haridwar-01",
  name: "Haridwar Home Team",
  type: "family",
  inviteCode: "GREEN-7421",
  totalFootprintKg: 38.4,
  weeklyReductionPct: 8,
  goalKg: 34,
  members: [
    { name: "Ananya", role: "admin", kg: 9.8, optedIn: true },
    { name: "Ravi", role: "member", kg: 11.4, optedIn: true },
    { name: "Member 3", role: "member", kg: 0, optedIn: false },
    { name: "Dadi", role: "member", kg: 7.2, optedIn: true }
  ],
  corporate: {
    employeeCount: 184,
    departments: [
      { name: "Operations", kg: 420, reductionPct: 6 },
      { name: "Sales", kg: 315, reductionPct: 11 },
      { name: "Admin", kg: 160, reductionPct: 14 }
    ],
    esgExportReady: true,
    carbonNeutralProgressPct: 46
  }
} as const;

export const monthlyReportDemo = {
  month: "June 2026",
  userName: "Ananya",
  totalKg: 72.4,
  lastMonthKg: 88.6,
  indiaAverageKg: 170.1,
  badgesEarned: ["First Footprint", "7-Day Streak"],
  topActions: [
    "Switched to metro 3 times",
    "Completed rooftop solar research",
    "Reduced food delivery by 2 orders"
  ],
  categoryBreakdown: [
    { category: "transport" as EmissionCategory, kg: 24.1 },
    { category: "energy" as EmissionCategory, kg: 19.4 },
    { category: "diet" as EmissionCategory, kg: 12.3 },
    { category: "food_delivery" as EmissionCategory, kg: 4.8 },
    { category: "waste" as EmissionCategory, kg: 3.2 }
  ],
  nextMonthTips: [
    "Try one rail trip instead of a short flight.",
    "Move two delivery orders to pickup or home cooking.",
    "Set AC to 26 C and use a fan first."
  ],
  deliveryChannels: ["push notification", "email via Resend", "in-app download"]
} as const;

export const governmentSchemes = [
  {
    name: "PM-Surya Ghar Muft Bijli Yojana",
    category: "energy",
    description: "Rooftop solar support that can reduce household electricity CO2."
  },
  {
    name: "FAME II",
    category: "transport",
    description: "EV subsidy context for lower-carbon two-wheeler and vehicle choices."
  },
  {
    name: "Gobardhan",
    category: "waste",
    description: "Biogas and organic waste conversion for communities."
  },
  {
    name: "Namami Gange",
    category: "community",
    description: "Local river cleanup and volunteer events around the Ganga."
  }
] as const;

export const xpLevels = [
  { level: 1, name: "Sapling", minXp: 0, maxXp: 500 },
  { level: 2, name: "Sprout", minXp: 500, maxXp: 1500 },
  { level: 3, name: "Young Tree", minXp: 1500, maxXp: 3000 },
  { level: 4, name: "Tree", minXp: 3000, maxXp: 6000 },
  { level: 5, name: "Forest", minXp: 6000, maxXp: 12000 },
  { level: 6, name: "Ecosystem", minXp: 12000, maxXp: null }
] as const;

export const seasonalEvents = [
  {
    name: "Earth Day",
    date: "April 22",
    benefit: "2x coins all week"
  },
  {
    name: "Green Diwali",
    date: "Festival season",
    benefit: "Crackers avoided challenge and bonus coins"
  },
  {
    name: "World Environment Day",
    date: "June 5",
    benefit: "City cleanup event badge"
  },
  {
    name: "Van Mahotsav",
    date: "July 1-7",
    benefit: "Plant-a-tree week and discounted offset prices"
  }
] as const;

export const profileSettingsCatalog = [
  "Language toggle EN/HI",
  "Dark mode toggle",
  "City update",
  "Diet type update",
  "Notification preferences",
  "IoT device linking",
  "Connected Google and Apple accounts",
  "Public profile and anonymous leaderboard privacy",
  "CSV data export",
  "Monthly PDF report export",
  "Account deletion with data wipe"
] as const;
