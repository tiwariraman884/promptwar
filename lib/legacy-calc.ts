/* ─── Carbon Inheritance / Legacy Calculator ─── */

/** IPCC: ~1000 Gt CO₂ cumulative = ~0.45°C warming (transient climate response to cumulative emissions) */
const TCRE = 0.45 / 1000e9; // °C per kg CO₂

/** 1 tree absorbs ~21.77 kg CO₂/year */
const KG_PER_TREE_YEAR = 21.77;

/** 1 flight around the world ≈ 5,600 kg CO₂ per passenger */
const KG_PER_ROUND_WORLD_FLIGHT = 5600;

/** 1 Olympic swimming pool volume ≈ 2,500,000 liters. CO₂ at STP: 1.98 kg/m³. Pool = 2500 m³ → ~4,950 kg CO₂ */
const KG_PER_OLYMPIC_POOL = 4950;

/** India average daily footprint (kg CO₂) */
const INDIA_AVG_DAILY_KG = 5.2;

export interface LegacyResult {
  lifetimeKg: number;
  lifetimeTonnes: number;
  temperatureContribution: number; // in micro-°C
  flightEquivalent: number;
  poolEquivalent: number;
  treesNeededToOffset: number;
  yearsRemaining: number;
}

export interface LegacySavings {
  kgSaved: number;
  tonnesSaved: number;
  tempSavedMicroC: number;
  flightsSaved: number;
  treesFreed: number;
  percentReduction: number;
}

/**
 * Calculate lifetime CO₂ at a given daily rate
 */
export function calculateLifetimeCO2(
  currentAge: number,
  lifespanYears: number,
  dailyKg: number,
): LegacyResult {
  const yearsRemaining = Math.max(0, lifespanYears - currentAge);
  const lifetimeKg = dailyKg * 365 * yearsRemaining;
  const lifetimeTonnes = lifetimeKg / 1000;
  const temperatureContribution = lifetimeKg * TCRE * 1e6; // micro-°C
  const flightEquivalent = lifetimeKg / KG_PER_ROUND_WORLD_FLIGHT;
  const poolEquivalent = lifetimeKg / KG_PER_OLYMPIC_POOL;
  const treesNeededToOffset = lifetimeKg / KG_PER_TREE_YEAR;

  return {
    lifetimeKg,
    lifetimeTonnes,
    temperatureContribution,
    flightEquivalent,
    poolEquivalent,
    treesNeededToOffset,
    yearsRemaining,
  };
}

/**
 * Calculate savings between current trajectory and goal trajectory
 */
export function calculateSavings(
  current: LegacyResult,
  goal: LegacyResult,
): LegacySavings {
  const kgSaved = current.lifetimeKg - goal.lifetimeKg;
  return {
    kgSaved,
    tonnesSaved: kgSaved / 1000,
    tempSavedMicroC: current.temperatureContribution - goal.temperatureContribution,
    flightsSaved: current.flightEquivalent - goal.flightEquivalent,
    treesFreed: current.treesNeededToOffset - goal.treesNeededToOffset,
    percentReduction: current.lifetimeKg > 0 ? (kgSaved / current.lifetimeKg) * 100 : 0,
  };
}

/**
 * Get the CO₂ comparison to India average
 */
export function getComparisonToAverage(dailyKg: number): {
  vsAverage: number; // percentage difference
  label: string;
  tone: "green" | "amber" | "red";
} {
  const pct = ((dailyKg - INDIA_AVG_DAILY_KG) / INDIA_AVG_DAILY_KG) * 100;
  if (pct <= -10) return { vsAverage: pct, label: "Below India average", tone: "green" };
  if (pct <= 10) return { vsAverage: pct, label: "Near India average", tone: "amber" };
  return { vsAverage: pct, label: "Above India average", tone: "red" };
}

/**
 * Generate milestone ages for the timeline visualization
 */
export function getLifetimeMilestones(
  currentAge: number,
  lifespanYears: number,
  dailyKg: number,
): Array<{ age: number; cumulativeKg: number; label: string }> {
  const milestones: Array<{ age: number; cumulativeKg: number; label: string }> = [];
  const ages = [currentAge, 30, 40, 50, 60, 70, 80].filter(
    a => a >= currentAge && a <= lifespanYears
  );
  // Deduplicate
  const uniqueAges = Array.from(new Set(ages)).sort((a, b) => a - b);

  for (const age of uniqueAges) {
    const yearsFrom = age - currentAge;
    const cumulativeKg = dailyKg * 365 * yearsFrom;
    const label = age === currentAge ? "Now" : `Age ${age}`;
    milestones.push({ age, cumulativeKg, label });
  }

  return milestones;
}
