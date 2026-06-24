// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHARED TYPESCRIPT TYPES — All 6 features import from here
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { TransportModeV2 } from "@/lib/emission-factors-v2";

// ── Carbon Twin ─────────────────────────────────────────────
export interface DietProfile {
  vegetarian: boolean;
  veganDays: number;
  meatServings: number;
  meatType: "chicken" | "mutton" | "beef" | "fish" | "mixed";
  dairyLitresPerWeek: number;
  riceKgPerWeek: number;
  localProduce: boolean;
}

export interface TravelProfile {
  primaryVehicle: TransportModeV2;
  dailyCommuteKm: number;
  flightsDomesticPerYear: number;
  flightsIntlPerYear: number;
  longDistanceTrainTripsPerYear: number;
  avgFlightDistanceKm: number;
}

export interface EnergyProfile {
  monthlyElectricityKwh: number;
  cookingFuel: "lpg" | "cng" | "piped_gas" | "electric" | "solar" | "biomass";
  lpgCylindersPerMonth: number;
  acUnits: number;
  acHoursPerDay: number;
  hasSolar: boolean;
  solarCapacityKw: number;
  acTemperatureSetting: number;
}

export interface ShoppingProfile {
  monthlyOnlineOrders: number;
  clothingItemsPerMonth: number;
  electronicsPerYear: number;
  usesClothBag: boolean;
  buysSecondHand: boolean;
}

export interface WasteProfile {
  weeklyWasteKg: number;
  composts: boolean;
  recyclesPaper: boolean;
  recyclesPlastic: boolean;
  ewasteKgPerYear: number;
}

export interface CarbonTwinProfile {
  userId: string;
  createdAt: string;
  updatedAt: string;
  diet: DietProfile;
  travel: TravelProfile;
  energy: EnergyProfile;
  shopping: ShoppingProfile;
  waste: WasteProfile;
}

// ── Emission Breakdown ───────────────────────────────────────
export type EmissionCategoryKey = "diet" | "travel" | "energy" | "shopping" | "waste";

export interface CategoryEmission {
  category: EmissionCategoryKey;
  monthlyCO2Kg: number;
  percentOfTotal: number;
  label: string;
  labelHindi: string;
}

export interface EmissionBreakdown {
  totalMonthlyCO2Kg: number;
  byCategory: CategoryEmission[];
  calculatedAt: string;
}

// ── Carbon Health Score ──────────────────────────────────────
export type ScoreGrade = "Excellent" | "Good" | "Average" | "Poor" | "Critical";

export interface CategoryScore {
  category: string;
  score: number;
  weight: number;
  label: string;
  labelHindi: string;
}

export interface CarbonHealthScore {
  overallScore: number;
  grade: ScoreGrade;
  gradeHindi: string;
  categoryScores: CategoryScore[];
  vsBaseline: number;
  trend: "improving" | "stable" | "worsening";
}

// ── Simulator ────────────────────────────────────────────────
export interface SimulatorScenario {
  habitKey: string;
  label: string;
  labelHindi: string;
  currentValue: number;
  newValue: number;
  unit: string;
  category: EmissionCategoryKey;
}

export interface SimulatorResult {
  currentMonthlyKg: number;
  newMonthlyKg: number;
  reductionKg: number;
  reductionPercent: number;
  treesEquivalent: number;
  changedHabits: SimulatorScenario[];
}

// ── Roadmap ──────────────────────────────────────────────────
export interface RoadmapWeek {
  weekNumber: number;
  action: string;
  actionHindi: string;
  category: EmissionCategoryKey;
  estimatedSavingKg: number;
  difficulty: "easy" | "medium" | "hard";
  isCompleted: boolean;
}

export interface AIRoadmap {
  userId: string;
  generatedAt: string;
  totalWeeks: number;
  totalProjectedSavingKg: number;
  weeks: RoadmapWeek[];
}

// ── Forecast ─────────────────────────────────────────────────
export interface ForecastPoint {
  period: "next_month" | "next_quarter" | "next_year";
  label: string;
  projectedKg: number;
  confidenceMin: number;
  confidenceMax: number;
  trend: "up" | "down" | "flat";
}

export interface CarbonForecast {
  dataPointsUsed: number;
  forecasts: ForecastPoint[];
  modelUsed: "linear_regression" | "weighted_average" | "insufficient_data";
  warning?: string;
}

// ── Explainability ───────────────────────────────────────────
export interface ExplanationFactor {
  name: string;
  nameHindi: string;
  contribution: number;
  percentOfTotal: number;
  direction: "positive" | "negative";
  detail: string;
}

export interface AIExplanation {
  headline: string;
  headlineHindi: string;
  summary: string;
  factors: ExplanationFactor[];
  recommendation: string;
  recommendationHindi: string;
  sourceLabel: string;
}

// ── Supabase Row Types ───────────────────────────────────────
export interface EmissionSnapshotRow {
  year_month: string;
  total_kg: number;
  diet_kg: number;
  travel_kg: number;
  energy_kg: number;
  shopping_kg: number;
  waste_kg: number;
  health_score: number | null;
}
