// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// SHARED CALCULATION ENGINE — Pure TypeScript, no side effects
// All 6 features call these functions.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { EMISSION_FACTORS_V2 } from "./emission-factors-v2";
import type {
  DietProfile,
  TravelProfile,
  EnergyProfile,
  ShoppingProfile,
  WasteProfile,
  CarbonTwinProfile,
  EmissionBreakdown,
  CategoryEmission,
} from "./types/carbon-twin-types";

const WEEKS_PER_MONTH = 4.33;

// ── DIET calculation ─────────────────────────────────────────
export function calcDietMonthlyKg(diet: DietProfile): number {
  const meatFactors: Record<DietProfile["meatType"], number> = {
    chicken: EMISSION_FACTORS_V2.diet.chicken,
    mutton:  EMISSION_FACTORS_V2.diet.mutton,
    beef:    EMISSION_FACTORS_V2.diet.beef,
    fish:    EMISSION_FACTORS_V2.diet.fish,
    mixed:   (EMISSION_FACTORS_V2.diet.chicken + EMISSION_FACTORS_V2.diet.mutton) / 2,
  };
  const avgPortionKg = 0.15; // 150g per serving (India average)
  const meatKg = diet.meatServings * avgPortionKg * WEEKS_PER_MONTH;
  const meatCO2 = diet.vegetarian ? 0 : meatKg * meatFactors[diet.meatType];
  const dairyCO2 = diet.dairyLitresPerWeek * WEEKS_PER_MONTH * EMISSION_FACTORS_V2.diet.milk_litre;
  const riceCO2 = diet.riceKgPerWeek * WEEKS_PER_MONTH * EMISSION_FACTORS_V2.diet.rice_kg;
  const localMultiplier = diet.localProduce ? 0.85 : 1.0;
  return parseFloat(((meatCO2 + dairyCO2 + riceCO2) * localMultiplier).toFixed(2));
}

// ── TRAVEL calculation ───────────────────────────────────────
export function calcTravelMonthlyKg(travel: TravelProfile): number {
  const vehicleFactor = EMISSION_FACTORS_V2.transport[travel.primaryVehicle] ?? 0;
  const dailyCO2 = travel.dailyCommuteKm * vehicleFactor;
  const monthlyCO2 = dailyCO2 * 30;
  const domesticFlightCO2 =
    (travel.flightsDomesticPerYear / 12) *
    travel.avgFlightDistanceKm *
    EMISSION_FACTORS_V2.transport.flight_domestic;
  const intlFlightCO2 =
    (travel.flightsIntlPerYear / 12) *
    travel.avgFlightDistanceKm *
    EMISSION_FACTORS_V2.transport.flight_intl;
  const trainCO2 =
    (travel.longDistanceTrainTripsPerYear / 12) *
    500 * // avg 500 km per trip
    EMISSION_FACTORS_V2.transport.train;
  return parseFloat((monthlyCO2 + domesticFlightCO2 + intlFlightCO2 + trainCO2).toFixed(2));
}

// ── ENERGY calculation ───────────────────────────────────────
export function calcEnergyMonthlyKg(energy: EnergyProfile): number {
  const electricityCO2 =
    energy.monthlyElectricityKwh *
    (energy.hasSolar
      ? EMISSION_FACTORS_V2.energy.solar_kwh
      : EMISSION_FACTORS_V2.energy.electricity_kwh);
  const lpgCO2 =
    energy.lpgCylindersPerMonth *
    14.2 * // standard LPG cylinder weight in kg
    EMISSION_FACTORS_V2.energy.lpg_per_kg;
  const acBonus =
    energy.acUnits *
    energy.acHoursPerDay *
    30 *
    1.5 * // avg AC power kW
    EMISSION_FACTORS_V2.energy.electricity_kwh;
  return parseFloat((electricityCO2 + lpgCO2 + acBonus).toFixed(2));
}

// ── SHOPPING calculation ─────────────────────────────────────
export function calcShoppingMonthlyKg(shopping: ShoppingProfile): number {
  const onlineCO2 = shopping.monthlyOnlineOrders * EMISSION_FACTORS_V2.shopping.online_delivery;
  const clothingCO2 = shopping.clothingItemsPerMonth * EMISSION_FACTORS_V2.shopping.clothing_item;
  const electronicsCO2 = (shopping.electronicsPerYear / 12) * EMISSION_FACTORS_V2.shopping.phone;
  const secondHandMultiplier = shopping.buysSecondHand ? 0.6 : 1.0;
  return parseFloat(((onlineCO2 + clothingCO2 + electronicsCO2) * secondHandMultiplier).toFixed(2));
}

// ── WASTE calculation ────────────────────────────────────────
export function calcWasteMonthlyKg(waste: WasteProfile): number {
  const wasteMonthly = waste.weeklyWasteKg * WEEKS_PER_MONTH;
  const disposalFactor = waste.composts
    ? EMISSION_FACTORS_V2.waste.composted_kg
    : waste.recyclesPaper && waste.recyclesPlastic
      ? EMISSION_FACTORS_V2.waste.recycled_kg
      : EMISSION_FACTORS_V2.waste.landfill_kg;
  const ewasteCO2 = (waste.ewasteKgPerYear / 12) * EMISSION_FACTORS_V2.waste.ewaste_kg;
  return parseFloat((wasteMonthly * disposalFactor + ewasteCO2).toFixed(2));
}

// ── FULL BREAKDOWN ───────────────────────────────────────────
export function calcFullBreakdown(profile: CarbonTwinProfile): EmissionBreakdown {
  const dietKg = calcDietMonthlyKg(profile.diet);
  const travelKg = calcTravelMonthlyKg(profile.travel);
  const energyKg = calcEnergyMonthlyKg(profile.energy);
  const shoppingKg = calcShoppingMonthlyKg(profile.shopping);
  const wasteKg = calcWasteMonthlyKg(profile.waste);
  const total = dietKg + travelKg + energyKg + shoppingKg + wasteKg;

  const make = (
    category: CategoryEmission["category"],
    kg: number,
    label: string,
    labelHindi: string
  ): CategoryEmission => ({
    category,
    monthlyCO2Kg: kg,
    percentOfTotal: total > 0 ? parseFloat(((kg / total) * 100).toFixed(1)) : 0,
    label,
    labelHindi,
  });

  return {
    totalMonthlyCO2Kg: parseFloat(total.toFixed(2)),
    byCategory: [
      make("diet", dietKg, "Diet", "आहार"),
      make("travel", travelKg, "Travel", "यात्रा"),
      make("energy", energyKg, "Energy", "ऊर्जा"),
      make("shopping", shoppingKg, "Shopping", "खरीदारी"),
      make("waste", wasteKg, "Waste", "कचरा"),
    ].sort((a, b) => b.monthlyCO2Kg - a.monthlyCO2Kg),
    calculatedAt: new Date().toISOString(),
  };
}
