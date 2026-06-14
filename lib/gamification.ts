export const ECO_COIN_REWARDS = {
  dailyEntry: 10,
  tipCompleted: 5,
  billScanned: 15,
  greenMapCheckIn: 20,
  badgeUnlocked: 25,
  sevenDayStreak: 25,
  thirtyDayStreak: 100,
  hundredDayStreak: 500,
  weeklyChallengeCompleted: 50,
  referralFirstEntry: 100,
  monthlyChallengeCompleted: 200,
  quizCorrect: 5,
  quizPerfectScore: 25,
  energyAuditComplete: 50,
  impactStoryShared: 10,
} as const;

export const BADGES = [
  {
    slug: "first_entry",
    title: "First Footprint",
    description: "Logged first entry"
  },
  {
    slug: "streak_7",
    title: "7-Day Streak",
    description: "7 consecutive days"
  },
  {
    slug: "streak_30",
    title: "30-Day Streak",
    description: "30 consecutive days"
  },
  {
    slug: "ton_saved",
    title: "Ton Saved",
    description: "Saved 1000 kgCO2e vs baseline"
  },
  {
    slug: "commuter_hero",
    title: "Commuter Hero",
    description: "Chose sustainable transport 30 times"
  },
  {
    slug: "haridwar_champion",
    title: "Haridwar Champion",
    description: "Top 10 in city for a month"
  },
  {
    slug: "scanner_pro",
    title: "Scanner Pro",
    description: "Scanned 10 bills"
  },
  {
    slug: "ai_learner",
    title: "AI Learner",
    description: "Completed 5 AI coach sessions"
  },
  {
    slug: "recycler",
    title: "Recycler",
    description: "Logged recycling 20 times"
  },
  {
    slug: "solar_adopter",
    title: "Solar Adopter",
    description: "Added solar to profile"
  },
  {
    slug: "tree_planter",
    title: "Tree Planter",
    description: "Redeemed plant-a-tree 5 times"
  },
  {
    slug: "veggie_week",
    title: "Veggie Week",
    description: "Logged vegetarian meals for 7 days"
  },
  {
    slug: "walker",
    title: "Walker",
    description: "Logged walking or cycling 15 times"
  },
  {
    slug: "water_saver",
    title: "Water Saver",
    description: "Logged water entries 10 times"
  },
  {
    slug: "event_zero",
    title: "Event Zero",
    description: "Logged a zero-waste event"
  },
  {
    slug: "family_green",
    title: "Family Green",
    description: "Joined a family group"
  },
  {
    slug: "challenge_master",
    title: "Challenge Master",
    description: "Completed 5 challenges"
  },
  {
    slug: "community_star",
    title: "Community Star",
    description: "Top 3 in city"
  },
  {
    slug: "data_nerd",
    title: "Data Nerd",
    description: "Logged 100 entries"
  },
  {
    slug: "india_hero",
    title: "India Hero",
    description: "Annual footprint below 1500 kgCO2e"
  },
  {
    slug: "quiz_master",
    title: "Quiz Master",
    description: "Completed 30 carbon literacy quizzes"
  },
  {
    slug: "energy_auditor",
    title: "Energy Auditor",
    description: "Completed a home energy audit"
  },
  {
    slug: "legacy_planner",
    title: "Legacy Planner",
    description: "Calculated your carbon inheritance"
  }
] as const;

export type BadgeSlug = (typeof BADGES)[number]["slug"];

export type BadgeEvaluationInput = {
  totalEntries: number;
  currentStreak: number;
  totalSavedKg: number;
  sustainableTransportCount: number;
  cityRank?: number;
  existingBadges?: string[];
  billScans?: number;
  aiSessions?: number;
  recyclingLogs?: number;
  hasSolar?: boolean;
  treesRedeemed?: number;
  vegetarianDays?: number;
  walkingLogs?: number;
  waterEntries?: number;
  zeroWasteEvents?: number;
  joinedGroup?: boolean;
  completedChallenges?: number;
  annualFootprintKg?: number;
};

export function evaluateBadgeAwards(input: BadgeEvaluationInput) {
  const earned = new Set(input.existingBadges ?? []);
  const awards: BadgeSlug[] = [];

  const maybeAward = (slug: BadgeSlug, condition: boolean) => {
    if (condition && !earned.has(slug)) {
      awards.push(slug);
      earned.add(slug);
    }
  };

  maybeAward("first_entry", input.totalEntries >= 1);
  maybeAward("streak_7", input.currentStreak >= 7);
  maybeAward("streak_30", input.currentStreak >= 30);
  maybeAward("ton_saved", input.totalSavedKg >= 1000);
  maybeAward("commuter_hero", input.sustainableTransportCount >= 30);
  maybeAward(
    "haridwar_champion",
    typeof input.cityRank === "number" && input.cityRank <= 10
  );
  maybeAward("community_star", typeof input.cityRank === "number" && input.cityRank <= 3);
  maybeAward("scanner_pro", (input.billScans ?? 0) >= 10);
  maybeAward("ai_learner", (input.aiSessions ?? 0) >= 5);
  maybeAward("recycler", (input.recyclingLogs ?? 0) >= 20);
  maybeAward("solar_adopter", Boolean(input.hasSolar));
  maybeAward("tree_planter", (input.treesRedeemed ?? 0) >= 5);
  maybeAward("veggie_week", (input.vegetarianDays ?? 0) >= 7);
  maybeAward("walker", (input.walkingLogs ?? 0) >= 15);
  maybeAward("water_saver", (input.waterEntries ?? 0) >= 10);
  maybeAward("event_zero", (input.zeroWasteEvents ?? 0) >= 1);
  maybeAward("family_green", Boolean(input.joinedGroup));
  maybeAward("challenge_master", (input.completedChallenges ?? 0) >= 5);
  maybeAward("data_nerd", input.totalEntries >= 100);
  maybeAward("india_hero", (input.annualFootprintKg ?? Number.POSITIVE_INFINITY) < 1500);

  return awards;
}
