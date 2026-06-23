import {
  BADGES,
  ECO_COIN_REWARDS,
  type BadgeSlug
} from "@/lib/gamification";
import {
  INDIA_DAILY_AVERAGE_KG,
  type EmissionCategory
} from "@/lib/emission-factors";

const categoryCycle: EmissionCategory[] = [
  "transport",
  "energy",
  "diet",
  "shopping",
  "waste",
  "digital",
  "food_delivery",
  "water",
  "pet",
  "events"
];

function isoDate(daysAgo: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

export const demoProfile = {
  id: "00000000-0000-4000-8000-000000000001",
  display_name: "Ananya",
  avatar_url: "",
  city: "Haridwar",
  state: "Uttarakhand",
  diet_type: "vegetarian",
  vehicle_owned: "two_wheeler_petrol",
  home_type: "apartment",
  monthly_income: "20-50k",
  goal_pct: 20,
  goal_months: 6,
  baseline_kg_day: 5.67,
  language: "en",
  dark_mode: false,
  notif_enabled: true,
  onboarded: true,
  public_profile: false,
  anonymous_leaderboard: true
};

export const demoDailySeries = Array.from({ length: 30 }, (_, index) => {
  const day = 29 - index;
  const wave = Math.sin(index / 2.8) * 0.9;
  const weekendDrop = index % 7 === 0 ? -0.7 : 0;
  const kgCo2e = Number((4.4 + wave + weekendDrop + (index % 5) * 0.12).toFixed(2));

  return {
    date: isoDate(day),
    kgCo2e,
    average: INDIA_DAILY_AVERAGE_KG
  };
});

export const demoEntries = demoDailySeries.flatMap((day, index) => {
  const category = categoryCycle[index % categoryCycle.length];
  return [
    {
      id: `demo-entry-${index}`,
      user_id: demoProfile.id,
      entry_date: day.date,
      category,
      sub_type: category === "transport" ? "metro_rail" : category,
      quantity: Number((day.kgCo2e / 2).toFixed(2)),
      unit: category === "transport" ? "km" : "unit",
      kg_co2e: day.kgCo2e,
      source: index % 6 === 0 ? "scan" : "manual",
      notes: "Demo entry",
      lat: category === "transport" ? 29.956 : null,
      lng: category === "transport" ? 78.171 : null,
      created_at: `${day.date}T08:30:00.000Z`
    }
  ];
});

export const demoTodayEntries = [
  {
    id: "today-metro",
    category: "transport" as EmissionCategory,
    title: "Metro + e-rickshaw commute",
    kgCo2e: 0.74,
    source: "manual"
  },
  {
    id: "today-lunch",
    category: "diet" as EmissionCategory,
    title: "Vegetarian lunch",
    kgCo2e: 0.83,
    source: "manual"
  },
  {
    id: "today-water",
    category: "water" as EmissionCategory,
    title: "Tap water and hot water",
    kgCo2e: 0.22,
    source: "manual"
  }
];

export const demoCategoryBreakdown = [
  { category: "transport" as EmissionCategory, kg: 12.4, pct: 42 },
  { category: "energy" as EmissionCategory, kg: 8.1, pct: 27 },
  { category: "diet" as EmissionCategory, kg: 3.9, pct: 13 },
  { category: "food_delivery" as EmissionCategory, kg: 3.2, pct: 11 },
  { category: "waste" as EmissionCategory, kg: 1.8, pct: 6 },
  { category: "water" as EmissionCategory, kg: 0.4, pct: 1 }
];

export const demoDashboard = {
  profile: demoProfile,
  todayKg: demoDailySeries.at(-1)?.kgCo2e ?? 0,
  yesterdayKg: demoDailySeries.at(-2)?.kgCo2e ?? 0,
  weeklyTotalKg: Number(
    demoDailySeries.slice(-7).reduce((sum, day) => sum + day.kgCo2e, 0).toFixed(2)
  ),
  monthTotalKg: Number(
    demoDailySeries.reduce((sum, day) => sum + day.kgCo2e, 0).toFixed(2)
  ),
  indiaDailyAverageKg: INDIA_DAILY_AVERAGE_KG,
  budgetKg: 4.54,
  budgetUsedPct: 78,
  streak: 6,
  longestStreak: 14,
  streakShields: 1,
  coins: 340,
  lifetimeCoins: 910,
  xp: 780,
  level: "Sprout",
  topCategory: "transport" as EmissionCategory,
  topCategories: demoCategoryBreakdown.slice(0, 3),
  categoryBreakdown: demoCategoryBreakdown,
  dailySeries: demoDailySeries,
  todayEntries: demoTodayEntries,
  aiInsight:
    "Your highest emission this week was Transport at 42%. Try replacing two scooter trips with rail or shared auto to save about 2.1 kg this week.",
  totalLoggedKg: Number(
    demoDailySeries.reduce((sum, day) => sum + day.kgCo2e, 0).toFixed(2)
  ),
  totalSavedKg: 86.4,
  treesPlanted: 3,
  goalProgressPct: 38
};

export const demoTips = {
  quickWins: [
    {
      id: "metro-3x",
      category: "transport" as EmissionCategory,
      action: "Switch to metro 3x/week",
      monthlySavingKg: 8.4,
      difficulty: "Easy",
      context: "Haridwar-Dehradun commuters can combine rail and e-rickshaw hops."
    },
    {
      id: "swiggy-less",
      category: "food_delivery" as EmissionCategory,
      action: "Order delivery 2x less/week",
      monthlySavingKg: 3.2,
      difficulty: "Easy",
      context: "Pickup or home cooking cuts delivery km and packaging."
    },
    {
      id: "cloth-bag",
      category: "shopping" as EmissionCategory,
      action: "Carry a cloth bag",
      monthlySavingKg: 0.2,
      difficulty: "Easy",
      context: "Avoiding five plastic bags per week is small but repeatable."
    },
    {
      id: "bucket-bath",
      category: "water" as EmissionCategory,
      action: "Use bucket instead of shower",
      monthlySavingKg: 0.8,
      difficulty: "Easy",
      context: "Cuts hot water energy and water use together."
    }
  ],
  bigImpact: [
    {
      id: "veg-meal",
      category: "diet" as EmissionCategory,
      action: "Replace one non-veg meal/day",
      monthlySavingKg: 2.7,
      difficulty: "Medium",
      context: "Keep the plate familiar with dal, chana, paneer, or soy swaps."
    },
    {
      id: "rooftop-solar",
      category: "energy" as EmissionCategory,
      action: "Explore PM-Surya rooftop solar",
      monthlySavingKg: 10,
      difficulty: "Hard",
      context: "Estimated at 120 kgCO2e saved per year for a small home system."
    },
    {
      id: "ev-2w",
      category: "transport" as EmissionCategory,
      action: "Switch to electric 2-wheeler",
      monthlySavingKg: 18,
      difficulty: "Hard",
      context: "Best when your commute is predictable and charging is easy."
    },
    {
      id: "train-not-flight",
      category: "transport" as EmissionCategory,
      action: "Take rail instead of one flight",
      monthlySavingKg: 23,
      difficulty: "Medium",
      context: "Indian Railways is a strong option for many short routes."
    }
  ],
  indiaSpecific: [
    {
      id: "lpg-check",
      category: "energy" as EmissionCategory,
      action: "Pressure-check LPG leaks",
      monthlySavingKg: 1.2,
      difficulty: "Easy",
      context: "Small cooking-efficiency fixes are high-value in Indian homes."
    },
    {
      id: "compost-puja",
      category: "waste" as EmissionCategory,
      action: "Compost flowers and peels",
      monthlySavingKg: 2.4,
      difficulty: "Easy",
      context: "Great fit for households near local gardens and temple areas."
    },
    {
      id: "air-dry",
      category: "energy" as EmissionCategory,
      action: "Air-dry clothes",
      monthlySavingKg: 3.6,
      difficulty: "Easy",
      context: "Useful through long dry spells and sunny balconies."
    }
  ],
  seasonal: [
    {
      id: "diwali-crackers",
      category: "events" as EmissionCategory,
      action: "Plan a low-smoke Diwali",
      monthlySavingKg: 12,
      difficulty: "Medium",
      context: "Pool community lights, skip crackers, and log the avoided event footprint."
    },
    {
      id: "holi-colors",
      category: "water" as EmissionCategory,
      action: "Use dry natural Holi colors",
      monthlySavingKg: 1.4,
      difficulty: "Easy",
      context: "Cuts water cleanup and keeps local drains happier."
    },
    {
      id: "eid-cooking",
      category: "diet" as EmissionCategory,
      action: "Batch cook for guests",
      monthlySavingKg: 2.1,
      difficulty: "Medium",
      context: "Shared cooking can reduce LPG and food waste during gatherings."
    }
  ]
};

export const demoLeaderboard = {
  city: Array.from({ length: 10 }, (_, index) => ({
    rank: index + 1,
    displayName: `Haridwar Eco ${String(index + 1).padStart(2, "0")}`,
    city: "Haridwar",
    reductionPercent: Math.max(8, 31 - index * 2),
    coins: 740 - index * 42,
    level: index < 2 ? "Tree" : index < 5 ? "Sprout" : "Sapling",
    avgKgDay: Number((3.8 + index * 0.18).toFixed(1))
  })),
  state: [
    { rank: 1, city: "Haridwar", state: "Uttarakhand", reductionPercent: 24 },
    { rank: 2, city: "Dehradun", state: "Uttarakhand", reductionPercent: 21 },
    { rank: 3, city: "Rishikesh", state: "Uttarakhand", reductionPercent: 19 },
    { rank: 4, city: "Haldwani", state: "Uttarakhand", reductionPercent: 17 },
    { rank: 5, city: "Roorkee", state: "Uttarakhand", reductionPercent: 14 }
  ],
  friends: [
    { name: "Nisha", streak: 11, visible: true },
    { name: "Amit", streak: 4, visible: true },
    { name: "Private friend", streak: 0, visible: false }
  ]
};

export const demoChallenge = {
  id: "low-carbon-week",
  title: "Low-Carbon Week",
  description: "Reduce by 20% vs last week",
  targetKg: 7.5,
  progressKg: 4.8,
  durationDays: 7,
  participants: 1284,
  daysRemaining: 3,
  completed: false,
  rewardCoins: ECO_COIN_REWARDS.weeklyChallengeCompleted,
  type: "community"
};

export const demoGroupChallenge = {
  id: "family-vs-friends",
  title: "Family vs Friends",
  inviteCode: "GREEN-7421",
  groupFootprintKg: 38.4,
  rivalFootprintKg: 41.9,
  progressPct: 62,
  rewardCoins: 75
};

export const demoBadges: Array<{
  slug: BadgeSlug;
  title: string;
  description: string;
  earned: boolean;
}> = BADGES.map((badge, index) => ({
  ...badge,
  earned: index < 6
}));

export const demoMonthlyHistory = [
  {
    month: "June 2026",
    totalKg: 72.4,
    savedKg: 18.2,
    breakdown: [
      { category: "transport", kg: 24.1 },
      { category: "energy", kg: 19.4 },
      { category: "diet", kg: 12.3 }
    ]
  },
  {
    month: "May 2026",
    totalKg: 134.8,
    savedKg: 32.6,
    breakdown: [
      { category: "transport", kg: 48.6 },
      { category: "energy", kg: 35.2 },
      { category: "diet", kg: 22.8 }
    ]
  },
  {
    month: "April 2026",
    totalKg: 148.1,
    savedKg: 21.4,
    breakdown: [
      { category: "transport", kg: 52.5 },
      { category: "energy", kg: 37.1 },
      { category: "shopping", kg: 28.4 }
    ]
  }
];
