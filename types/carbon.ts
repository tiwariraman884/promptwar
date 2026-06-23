/* ═══════════════════════════════════════════════════════════════
   Carbon Intelligence Engine — TypeScript Interfaces
   ═══════════════════════════════════════════════════════════════ */

/* ── Enums ── */

export type RiskTier = "Low" | "Moderate" | "High" | "Critical";
export type TrendLabel = "Improving" | "Stable" | "Worsening";
export type EffortLevel = "Easy" | "Medium" | "Hard";

/* ── Input Types ── */

export interface DietInputData {
  food_type: "vegan" | "vegetarian" | "non_vegetarian";
  meat_meals_per_week: number;    // 0–14
  dairy_daily: boolean;
  local_produce_percent: number;  // 0–100
}

export interface TravelInputData {
  commute_mode: "walk_cycle" | "public_transport" | "two_wheeler" | "car" | "mixed";
  km_per_week: number;
  flights_per_year: number;
  vehicle_type?: "petrol" | "diesel" | "electric" | "cng";
}

export interface ElectricityInputData {
  monthly_kwh: number;
  energy_source: "grid" | "solar" | "mixed";
  ac_hours_per_day: number;
}

export interface ShoppingInputData {
  monthly_spend_inr: number;
  fast_fashion_percent: number;   // 0–100
  electronics_per_year: number;
}

export interface WasteInputData {
  weekly_waste_kg: number;
  recycling_habit: "never" | "sometimes" | "always";
  composting: boolean;
  plastic_bags_per_week: number;
}

export interface UserInputData {
  diet: DietInputData;
  travel: TravelInputData;
  electricity: ElectricityInputData;
  shopping: ShoppingInputData;
  waste: WasteInputData;
  city: string;
  household_size: number;
}

/* ── Output Types ── */

export interface RoadmapAction {
  rank: number;
  action_title: string;
  estimated_monthly_reduction_kg: number;
  effort_level: EffortLevel;
  india_tip: string;
}

export interface CarbonAnalysisResult {
  carbon_risk_score: {
    overall: number;
    risk_tier: RiskTier;
    category_breakdown: {
      diet: number;
      travel: number;
      electricity: number;
      shopping: number;
      waste: number;
    };
    india_comparison: string;
  };
  monthly_forecast: {
    month_1_kg: number;
    month_2_kg: number;
    month_3_kg: number;
    trend: TrendLabel;
    seasonal_note: string;
  };
  reduction_roadmap: RoadmapAction[];
  predicted_emissions_timeline: {
    business_as_usual: [number, number, number, number, number, number];
    optimized_path: [number, number, number, number, number, number];
    total_annual_savings_kg: number;
  };
}

/* ── Form step metadata ── */

export interface StepMeta {
  id: number;
  title: string;
  description: string;
  icon: string;
  category: keyof Pick<UserInputData, "diet" | "travel" | "electricity" | "shopping" | "waste">;
}

export const FORM_STEPS: StepMeta[] = [
  { id: 0, title: "Diet", description: "Your food and eating habits", icon: "🥗", category: "diet" },
  { id: 1, title: "Travel", description: "Your commute and travel patterns", icon: "🚗", category: "travel" },
  { id: 2, title: "Electricity", description: "Your energy consumption at home", icon: "⚡", category: "electricity" },
  { id: 3, title: "Shopping", description: "Your purchasing and fashion habits", icon: "🛍️", category: "shopping" },
  { id: 4, title: "Waste", description: "Your waste and recycling practices", icon: "♻️", category: "waste" },
];
