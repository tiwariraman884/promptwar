/**
 * Carbon Intelligence Engine
 *
 * Pure-TypeScript analysis module that takes structured lifestyle data across
 * 5 categories and produces personalized carbon footprint insights:
 *   1. Personal Carbon Risk Score (0–100)
 *   2. Monthly Carbon Forecast (3 months)
 *   3. Reduction Roadmap (5 prioritised India-specific actions)
 *   4. Predicted Emissions Timeline (6-month BAU vs optimised)
 *
 * All calculations are deterministic — no external AI calls — and leverage
 * the emission factors from @/lib/emission-factors.json.
 */

import {
  INDIA_ANNUAL_AVERAGE_KG,
  EMISSION_FACTORS,
} from "@/lib/emission-factors";
import { clamp } from "@/lib/utils";

/* ═══════════════════════════════════════════════════════════════════
   INPUT TYPES
   ═══════════════════════════════════════════════════════════════════ */

export type DietInput = {
  food_type: "vegan" | "vegetarian" | "non_veg_chicken" | "non_veg_mixed" | "non_veg_beef";
  frequency: "one" | "two" | "three"; // meals per day
  meat_dairy_level: "none" | "low" | "moderate" | "high";
  local_vs_imported: "mostly_local" | "mixed" | "mostly_imported";
};

export type TravelInput = {
  commute_mode: "walk_cycle" | "public_transport" | "two_wheeler" | "car" | "mixed";
  km_per_week: number;
  flights_per_year: number;
  vehicle_type?: "petrol" | "diesel" | "electric" | "cng";
};

export type ElectricityInput = {
  monthly_kwh: number;
  energy_source: "grid_only" | "partial_solar" | "full_solar";
  appliance_usage: "minimal" | "moderate" | "heavy";
};

export type ShoppingInput = {
  monthly_purchases: number; // count of items
  fashion_type: "sustainable" | "mixed" | "fast_fashion";
  electronics_frequency: "rarely" | "occasionally" | "frequently";
};

export type WasteInput = {
  weekly_waste_kg: number;
  recycling_percent: number; // 0–100
  composting: boolean;
  plastic_usage: "minimal" | "moderate" | "heavy";
};

export type CarbonIntelligenceInput = {
  diet: DietInput;
  travel: TravelInput;
  electricity: ElectricityInput;
  shopping: ShoppingInput;
  waste: WasteInput;
  current_month?: number; // 1–12, defaults to current
};

/* ═══════════════════════════════════════════════════════════════════
   OUTPUT TYPES
   ═══════════════════════════════════════════════════════════════════ */

export type RoadmapAction = {
  rank: number;
  action_title: string;
  estimated_monthly_reduction_kg: number;
  effort_level: "Easy" | "Medium" | "Hard";
  india_tip: string;
};

export type CarbonIntelligenceOutput = {
  carbon_risk_score: {
    overall: number;
    risk_tier: "Low" | "Moderate" | "High" | "Critical";
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
    trend: "Improving" | "Stable" | "Worsening";
    seasonal_note: string;
  };
  reduction_roadmap: RoadmapAction[];
  predicted_emissions_timeline: {
    business_as_usual: [number, number, number, number, number, number];
    optimized_path: [number, number, number, number, number, number];
    total_annual_savings_kg: number;
  };
};

/* ═══════════════════════════════════════════════════════════════════
   CONSTANTS & LOOKUP TABLES
   ═══════════════════════════════════════════════════════════════════ */

/** India per-capita monthly average in kgCO₂e (~1.9 t/yr) */
const INDIA_MONTHLY_AVG_KG = INDIA_ANNUAL_AVERAGE_KG / 12; // ≈ 172.5

/** Seasonal multipliers indexed 0–11 (Jan–Dec) for India */
const SEASONAL_MULTIPLIERS: Record<number, { factor: number; note: string }> = {
  0:  { factor: 0.95, note: "Winter — lower AC usage in most regions" },
  1:  { factor: 0.93, note: "Late winter — mild weather, lower energy demand" },
  2:  { factor: 0.98, note: "Spring — weather warming up, transitional period" },
  3:  { factor: 1.05, note: "Pre-summer — rising AC usage across northern India" },
  4:  { factor: 1.15, note: "Peak summer — heavy AC and cooler usage across India" },
  5:  { factor: 1.12, note: "Summer/early monsoon — high electricity demand, travel for vacations" },
  6:  { factor: 1.00, note: "Monsoon — moderate energy use, reduced travel" },
  7:  { factor: 0.98, note: "Monsoon — moderate energy, lower commute distances" },
  8:  { factor: 1.00, note: "Post-monsoon — transitional weather" },
  9:  { factor: 1.10, note: "Festival season — Dussehra/Diwali shopping and travel spikes" },
  10: { factor: 1.15, note: "Diwali/festive peak — highest shopping, fireworks, and travel emissions" },
  11: { factor: 1.02, note: "Year-end — moderate shopping, holiday travel" },
};

/** Candidate reduction actions pool — sorted by typical impact */
type ActionCandidate = Omit<RoadmapAction, "rank"> & { category: keyof CarbonIntelligenceOutput["carbon_risk_score"]["category_breakdown"]; min_score: number };

const ACTION_POOL: ActionCandidate[] = [
  {
    category: "travel",
    min_score: 30,
    action_title: "Switch commute to public transport or EV",
    estimated_monthly_reduction_kg: 45,
    effort_level: "Medium",
    india_tip: "Under FAME-II, electric 2-wheelers get ₹15,000+ subsidy. Check state EV policies for additional discounts.",
  },
  {
    category: "travel",
    min_score: 40,
    action_title: "Replace 2 short flights with train travel",
    estimated_monthly_reduction_kg: 35,
    effort_level: "Medium",
    india_tip: "Indian Railways runs on 60% electric traction (Green Railways mission). Delhi–Mumbai Rajdhani emits 90% less CO₂ than a flight.",
  },
  {
    category: "travel",
    min_score: 20,
    action_title: "Carpool or use shared autos for daily commute",
    estimated_monthly_reduction_kg: 20,
    effort_level: "Easy",
    india_tip: "Apps like Quick Ride and sRide are popular carpooling options in metro cities; save ₹2,000+/month.",
  },
  {
    category: "electricity",
    min_score: 30,
    action_title: "Install rooftop solar panels",
    estimated_monthly_reduction_kg: 55,
    effort_level: "Hard",
    india_tip: "PM-KUSUM and state net-metering policies offer 40% subsidy. A 3kW system pays for itself in 4–5 years.",
  },
  {
    category: "electricity",
    min_score: 20,
    action_title: "Switch to LED lighting and 5-star rated appliances",
    estimated_monthly_reduction_kg: 15,
    effort_level: "Easy",
    india_tip: "UJALA scheme offers LED bulbs at ₹70. BEE 5-star ACs use 30% less energy than 3-star models.",
  },
  {
    category: "electricity",
    min_score: 40,
    action_title: "Reduce AC usage by 2 hours daily",
    estimated_monthly_reduction_kg: 25,
    effort_level: "Easy",
    india_tip: "Set AC to 24°C (BEE recommendation) — every degree below 24 increases consumption by 6%.",
  },
  {
    category: "diet",
    min_score: 30,
    action_title: "Adopt 3 vegetarian days per week",
    estimated_monthly_reduction_kg: 20,
    effort_level: "Easy",
    india_tip: "India has the world's richest vegetarian cuisine. A thali meal has ~60% lower footprint than a non-veg one.",
  },
  {
    category: "diet",
    min_score: 20,
    action_title: "Buy local and seasonal produce from mandis",
    estimated_monthly_reduction_kg: 10,
    effort_level: "Easy",
    india_tip: "Local sabzi mandis and farmer cooperatives cut transport emissions. Apps like Kisan Network connect directly to farms.",
  },
  {
    category: "diet",
    min_score: 50,
    action_title: "Reduce food waste by planning meals weekly",
    estimated_monthly_reduction_kg: 12,
    effort_level: "Medium",
    india_tip: "Indian households waste ~50 kg food/year. Meal planning and using leftovers can cut this by 60%.",
  },
  {
    category: "shopping",
    min_score: 30,
    action_title: "Switch to sustainable and thrift fashion",
    estimated_monthly_reduction_kg: 15,
    effort_level: "Easy",
    india_tip: "Indian brands like No Nasties, Doodlage, and local khadi stores offer sustainable alternatives at similar prices.",
  },
  {
    category: "shopping",
    min_score: 40,
    action_title: "Extend electronics lifecycle by 1–2 years",
    estimated_monthly_reduction_kg: 10,
    effort_level: "Easy",
    india_tip: "Repair instead of replace — India's Right to Repair movement is growing. Cashify and OLX offer refurbished devices.",
  },
  {
    category: "shopping",
    min_score: 20,
    action_title: "Reduce impulse purchases by 50%",
    estimated_monthly_reduction_kg: 8,
    effort_level: "Medium",
    india_tip: "Use a 48-hour rule before buying non-essentials. The average Indian household can save ₹3,000/month this way.",
  },
  {
    category: "waste",
    min_score: 30,
    action_title: "Start home composting for wet waste",
    estimated_monthly_reduction_kg: 12,
    effort_level: "Medium",
    india_tip: "Daily Dump and similar composters cost ₹1,500–3,000. Swachh Bharat Abhiyan encourages source segregation in all ULBs.",
  },
  {
    category: "waste",
    min_score: 20,
    action_title: "Eliminate single-use plastics",
    estimated_monthly_reduction_kg: 5,
    effort_level: "Easy",
    india_tip: "India banned single-use plastics in 2022. Carry cloth bags, steel bottles, and tiffin boxes — most shops now accept them.",
  },
  {
    category: "waste",
    min_score: 40,
    action_title: "Increase recycling to 60%+ of household waste",
    estimated_monthly_reduction_kg: 8,
    effort_level: "Medium",
    india_tip: "Register with local kabadiwala apps like Bintix or ScrapQ for doorstep dry-waste pickup and earn ₹200–500/month.",
  },
];

/* ═══════════════════════════════════════════════════════════════════
   INTERNAL HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

/**
 * Sigmoid-style scoring: maps a monthly kgCO₂e value for a single category
 * to a 0–100 risk score. Calibrated so the India average per-category share
 * (~INDIA_MONTHLY_AVG_KG / 5 ≈ 34.5 kg) maps to ~40–50 score.
 */
function categoryRiskScore(monthlyKg: number, categoryAvgKg: number): number {
  if (monthlyKg <= 0) return 0;
  // Ratio to India average for this category
  const ratio = monthlyKg / categoryAvgKg;
  // Sigmoid centered at ratio=1.0 → score=45, rising to ~95 at ratio=3.0
  const raw = 100 / (1 + Math.exp(-1.5 * (ratio - 1.2)));
  return Math.round(clamp(raw, 0, 100));
}

function riskTier(score: number): "Low" | "Moderate" | "High" | "Critical" {
  if (score <= 30) return "Low";
  if (score <= 60) return "Moderate";
  if (score <= 80) return "High";
  return "Critical";
}

/* ═══════════════════════════════════════════════════════════════════
   CATEGORY MONTHLY EMISSION CALCULATORS
   ═══════════════════════════════════════════════════════════════════ */

/** Approximate average category shares for India (summing to ~172.5 kg/mo) */
const INDIA_CATEGORY_AVG: Record<string, number> = {
  diet: 42,         // ~24% — high due to dairy/cooking fuel
  travel: 35,       // ~20%
  electricity: 50,  // ~29% — grid + cooking fuels
  shopping: 25,     // ~15%
  waste: 20.5,      // ~12%
};

export function calculateDietMonthly(input: DietInput): number {
  const dailyFactors: Record<DietInput["food_type"], number> = {
    vegan: EMISSION_FACTORS.dietDaily.vegan,
    vegetarian: EMISSION_FACTORS.dietDaily.vegetarian,
    non_veg_chicken: EMISSION_FACTORS.dietDaily.non_veg_chicken,
    non_veg_mixed: EMISSION_FACTORS.dietDaily.non_veg_mixed,
    non_veg_beef: EMISSION_FACTORS.dietDaily.non_veg_beef,
  };
  const mealMultiplier: Record<DietInput["frequency"], number> = {
    one: 0.5,
    two: 0.75,
    three: 1.0,
  };
  const dairyMultiplier: Record<DietInput["meat_dairy_level"], number> = {
    none: 0,
    low: 0.3,
    moderate: 0.7,
    high: 1.2,
  };
  const importMultiplier: Record<DietInput["local_vs_imported"], number> = {
    mostly_local: 0.85,
    mixed: 1.0,
    mostly_imported: 1.25,
  };

  const baseDailyKg = dailyFactors[input.food_type] * mealMultiplier[input.frequency];
  const dairyDailyKg = dairyMultiplier[input.meat_dairy_level] * EMISSION_FACTORS.dietDaily.dairy_litre;
  const daily = (baseDailyKg + dairyDailyKg) * importMultiplier[input.local_vs_imported];
  return round2(daily * 30);
}

export function calculateTravelMonthly(input: TravelInput): number {
  const modeFactors: Record<TravelInput["commute_mode"], number> = {
    walk_cycle: EMISSION_FACTORS.transport.walk_cycle,
    public_transport: (EMISSION_FACTORS.transport.bus_diesel + EMISSION_FACTORS.transport.metro_rail) / 2,
    two_wheeler: EMISSION_FACTORS.transport.two_wheeler_petrol,
    car: EMISSION_FACTORS.transport.petrol_car,
    mixed: 0.10, // weighted average
  };

  // Adjust car factor by vehicle type
  let commuteFactor = modeFactors[input.commute_mode];
  if (input.commute_mode === "car" && input.vehicle_type) {
    const vehicleFactors: Record<string, number> = {
      petrol: EMISSION_FACTORS.transport.petrol_car,
      diesel: EMISSION_FACTORS.transport.diesel_car,
      electric: EMISSION_FACTORS.transport.electric_car,
      cng: EMISSION_FACTORS.transport.auto_cng,
    };
    commuteFactor = vehicleFactors[input.vehicle_type] ?? commuteFactor;
  }

  // Monthly commute: km_per_week * 4.33 weeks/month
  const commuteMonthly = input.km_per_week * 4.33 * commuteFactor;

  // Flights: average domestic flight ≈ 1200 km, spread over 12 months
  const flightMonthly = (input.flights_per_year * 1200 * EMISSION_FACTORS.transport.flight_domestic) / 12;

  return round2(commuteMonthly + flightMonthly);
}

export function calculateElectricityMonthly(input: ElectricityInput): number {
  const solarShare: Record<ElectricityInput["energy_source"], number> = {
    grid_only: 0,
    partial_solar: 0.35,
    full_solar: 0.85,
  };
  const applianceMultiplier: Record<ElectricityInput["appliance_usage"], number> = {
    minimal: 0.8,
    moderate: 1.0,
    heavy: 1.3,
  };

  const effectiveKwh = input.monthly_kwh * (1 - solarShare[input.energy_source]);
  const kgCo2e = effectiveKwh * EMISSION_FACTORS.energy.grid_electricity_kwh * applianceMultiplier[input.appliance_usage];
  return round2(kgCo2e);
}

export function calculateShoppingMonthly(input: ShoppingInput): number {
  const fashionFactor: Record<ShoppingInput["fashion_type"], number> = {
    sustainable: EMISSION_FACTORS.shopping.clothing_sustainable,
    mixed: (EMISSION_FACTORS.shopping.clothing_sustainable + EMISSION_FACTORS.shopping.clothing_fast_fashion) / 2,
    fast_fashion: EMISSION_FACTORS.shopping.clothing_fast_fashion,
  };
  const electronicsFactor: Record<ShoppingInput["electronics_frequency"], number> = {
    rarely: 0,       // ~0 devices/month
    occasionally: 5,  // amortised ~5 kg/month
    frequently: 15,   // ~15 kg/month (new gadgets often)
  };

  const clothingKg = input.monthly_purchases * fashionFactor[input.fashion_type];
  const electronicsKg = electronicsFactor[input.electronics_frequency];
  return round2(clothingKg + electronicsKg);
}

export function calculateWasteMonthly(input: WasteInput): number {
  const weeklyKg = input.weekly_waste_kg;
  const recyclePercent = clamp(input.recycling_percent, 0, 100);
  const compostPercent = input.composting ? 25 : 0; // assume 25% if composting
  const landfillPercent = clamp(100 - recyclePercent - compostPercent, 0, 100);

  const plasticMultiplier: Record<WasteInput["plastic_usage"], number> = {
    minimal: 0.85,
    moderate: 1.0,
    heavy: 1.3,
  };

  const weeklyEmissions =
    weeklyKg * (landfillPercent / 100) * EMISSION_FACTORS.wastePerKg.landfill_waste +
    weeklyKg * (recyclePercent / 100) * EMISSION_FACTORS.wastePerKg.recycled_waste +
    weeklyKg * (compostPercent / 100) * EMISSION_FACTORS.wastePerKg.composted_waste;

  return round2(weeklyEmissions * 4.33 * plasticMultiplier[input.plastic_usage]);
}

/* ═══════════════════════════════════════════════════════════════════
   MAIN ENGINE
   ═══════════════════════════════════════════════════════════════════ */

export function analyzeCarbon(input: CarbonIntelligenceInput): CarbonIntelligenceOutput {
  const month = (input.current_month ?? new Date().getMonth() + 1) - 1; // 0-indexed

  // ── 1. Calculate monthly emissions per category ──
  const dietKg = calculateDietMonthly(input.diet);
  const travelKg = calculateTravelMonthly(input.travel);
  const electricityKg = calculateElectricityMonthly(input.electricity);
  const shoppingKg = calculateShoppingMonthly(input.shopping);
  const wasteKg = calculateWasteMonthly(input.waste);
  const totalMonthlyKg = round2(dietKg + travelKg + electricityKg + shoppingKg + wasteKg);

  // ── 2. Risk scores per category ──
  const dietScore = categoryRiskScore(dietKg, INDIA_CATEGORY_AVG.diet);
  const travelScore = categoryRiskScore(travelKg, INDIA_CATEGORY_AVG.travel);
  const electricityScore = categoryRiskScore(electricityKg, INDIA_CATEGORY_AVG.electricity);
  const shoppingScore = categoryRiskScore(shoppingKg, INDIA_CATEGORY_AVG.shopping);
  const wasteScore = categoryRiskScore(wasteKg, INDIA_CATEGORY_AVG.waste);

  // Weighted overall score
  const weights = { diet: 0.20, travel: 0.25, electricity: 0.25, shopping: 0.15, waste: 0.15 };
  const overallScore = Math.round(
    dietScore * weights.diet +
    travelScore * weights.travel +
    electricityScore * weights.electricity +
    shoppingScore * weights.shopping +
    wasteScore * weights.waste
  );
  const clampedOverall = clamp(overallScore, 0, 100);

  // India comparison
  const annualProjected = totalMonthlyKg * 12;
  const indiaAvgT = INDIA_ANNUAL_AVERAGE_KG / 1000;
  const userT = round2(annualProjected / 1000);
  const comparison = annualProjected <= INDIA_ANNUAL_AVERAGE_KG
    ? `Your projected annual footprint of ${userT}t CO₂e is below India's average of ${indiaAvgT}t. Great job!`
    : `Your projected annual footprint of ${userT}t CO₂e is ${round2((annualProjected / INDIA_ANNUAL_AVERAGE_KG - 1) * 100)}% above India's average of ${indiaAvgT}t per capita.`;

  // ── 3. Monthly forecast (next 3 months) ──
  const m1Idx = (month + 1) % 12;
  const m2Idx = (month + 2) % 12;
  const m3Idx = (month + 3) % 12;

  const m1 = round2(totalMonthlyKg * SEASONAL_MULTIPLIERS[m1Idx].factor);
  const m2 = round2(totalMonthlyKg * SEASONAL_MULTIPLIERS[m2Idx].factor);
  const m3 = round2(totalMonthlyKg * SEASONAL_MULTIPLIERS[m3Idx].factor);

  // Trend based on 3-month direction
  let trend: "Improving" | "Stable" | "Worsening" = "Stable";
  if (m3 < m1 * 0.97) trend = "Improving";
  else if (m3 > m1 * 1.03) trend = "Worsening";

  const seasonalNote = SEASONAL_MULTIPLIERS[m1Idx].note;

  // ── 4. Reduction roadmap (top 5) ──
  const categoryScores = { diet: dietScore, travel: travelScore, electricity: electricityScore, shopping: shoppingScore, waste: wasteScore };
  const roadmap = buildRoadmap(categoryScores);

  // ── 5. Predicted emissions timeline (6 months) ──
  const totalRoadmapReduction = roadmap.reduce((sum, a) => sum + a.estimated_monthly_reduction_kg, 0);

  const bau: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];
  const optimized: [number, number, number, number, number, number] = [0, 0, 0, 0, 0, 0];

  for (let i = 0; i < 6; i++) {
    const mIdx = (month + i + 1) % 12;
    const seasonal = SEASONAL_MULTIPLIERS[mIdx].factor;
    bau[i] = round2(totalMonthlyKg * seasonal);

    // Gradual adoption: 20% of savings in month 1, ramping to 100% by month 5+
    const adoptionRate = Math.min(1, (i + 1) * 0.2);
    const reduction = totalRoadmapReduction * adoptionRate;
    optimized[i] = round2(Math.max(0, (totalMonthlyKg - reduction) * seasonal));
  }

  const totalAnnualSavings = round2(
    (bau.reduce((s, v) => s + v, 0) - optimized.reduce((s, v) => s + v, 0)) * 2
  );

  return {
    carbon_risk_score: {
      overall: clampedOverall,
      risk_tier: riskTier(clampedOverall),
      category_breakdown: {
        diet: dietScore,
        travel: travelScore,
        electricity: electricityScore,
        shopping: shoppingScore,
        waste: wasteScore,
      },
      india_comparison: comparison,
    },
    monthly_forecast: {
      month_1_kg: m1,
      month_2_kg: m2,
      month_3_kg: m3,
      trend,
      seasonal_note: seasonalNote,
    },
    reduction_roadmap: roadmap,
    predicted_emissions_timeline: {
      business_as_usual: bau,
      optimized_path: optimized,
      total_annual_savings_kg: totalAnnualSavings,
    },
  };
}

/* ═══════════════════════════════════════════════════════════════════
   ROADMAP BUILDER
   ═══════════════════════════════════════════════════════════════════ */

function buildRoadmap(
  categoryScores: Record<string, number>
): RoadmapAction[] {
  // Sort all categories by score descending to identify high-impact areas
  const sortedCategories = Object.entries(categoryScores)
    .sort(([, a], [, b]) => b - a)
    .map(([cat]) => cat);

  // Filter actions to those relevant (score >= min_score)
  const eligible = ACTION_POOL.filter(
    (action) => categoryScores[action.category] >= action.min_score
  );

  // Sort eligible actions by estimated reduction descending
  const sorted = [...eligible].sort(
    (a, b) => b.estimated_monthly_reduction_kg - a.estimated_monthly_reduction_kg
  );

  const selected: ActionCandidate[] = [];
  const coveredCategories = new Set<string>();

  // First pass: pick highest-impact action per high-scoring category (score > 40)
  for (const cat of sortedCategories) {
    if (categoryScores[cat] > 40 && selected.length < 5) {
      const best = sorted.find(
        (a) => a.category === cat && !selected.includes(a)
      );
      if (best) {
        selected.push(best);
        coveredCategories.add(cat);
      }
    }
  }

  // Second pass: fill remaining slots with highest-impact actions
  for (const action of sorted) {
    if (selected.length >= 5) break;
    if (!selected.includes(action)) {
      selected.push(action);
      coveredCategories.add(action.category);
    }
  }

  // If we still have < 5, add remaining by impact (even if below min_score)
  if (selected.length < 5) {
    const fallback = [...ACTION_POOL]
      .sort((a, b) => b.estimated_monthly_reduction_kg - a.estimated_monthly_reduction_kg)
      .filter((a) => !selected.includes(a));
    for (const action of fallback) {
      if (selected.length >= 5) break;
      selected.push(action);
    }
  }

  // Sort final selection by impact (descending) before assigning ranks
  const finalSorted = selected
    .slice(0, 5)
    .sort((a, b) => b.estimated_monthly_reduction_kg - a.estimated_monthly_reduction_kg);

  return finalSorted.map((action, idx) => ({
    rank: idx + 1,
    action_title: action.action_title,
    estimated_monthly_reduction_kg: action.estimated_monthly_reduction_kg,
    effort_level: action.effort_level,
    india_tip: action.india_tip,
  }));
}
