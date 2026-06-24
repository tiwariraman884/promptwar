import { describe, it, expect } from 'vitest';
import {
  calcDietMonthlyKg,
  calcTravelMonthlyKg,
  calcEnergyMonthlyKg,
  calcShoppingMonthlyKg,
  calcWasteMonthlyKg,
  calcFullBreakdown,
} from '@/lib/carbon-engine-v2';
import type {
  DietProfile,
  TravelProfile,
  EnergyProfile,
  ShoppingProfile,
  WasteProfile,
  CarbonTwinProfile,
} from '@/lib/types/carbon-twin-types';

// ── Fixture factories ──

const baseDiet: DietProfile = {
  vegetarian: false, veganDays: 0, meatServings: 3, meatType: 'chicken',
  dairyLitresPerWeek: 2, riceKgPerWeek: 1, localProduce: false,
};

const baseTravel: TravelProfile = {
  primaryVehicle: 'petrolCar', dailyCommuteKm: 15,
  flightsDomesticPerYear: 2, flightsIntlPerYear: 0,
  longDistanceTrainTripsPerYear: 2, avgFlightDistanceKm: 1000,
};

const baseEnergy: EnergyProfile = {
  monthlyElectricityKwh: 200, cookingFuel: 'lpg', lpgCylindersPerMonth: 1,
  acUnits: 1, acHoursPerDay: 4, hasSolar: false, solarCapacityKw: 0,
  acTemperatureSetting: 24,
};

const baseShopping: ShoppingProfile = {
  monthlyOnlineOrders: 5, clothingItemsPerMonth: 2,
  electronicsPerYear: 1, usesClothBag: false, buysSecondHand: false,
};

const baseWaste: WasteProfile = {
  weeklyWasteKg: 5, composts: false, recyclesPaper: false,
  recyclesPlastic: false, ewasteKgPerYear: 2,
};

const baseProfile: CarbonTwinProfile = {
  userId: 'test-user', createdAt: '', updatedAt: '',
  diet: baseDiet, travel: baseTravel, energy: baseEnergy,
  shopping: baseShopping, waste: baseWaste,
};

// ── Diet ──

describe('calcDietMonthlyKg', () => {
  it('returns > 0 for non-vegetarian diet', () => {
    expect(calcDietMonthlyKg(baseDiet)).toBeGreaterThan(0);
  });

  it('vegetarian diet has no meat emissions', () => {
    const vegDiet = { ...baseDiet, vegetarian: true };
    const nonVeg = calcDietMonthlyKg(baseDiet);
    const veg = calcDietMonthlyKg(vegDiet);
    expect(veg).toBeLessThan(nonVeg);
  });

  it('local produce reduces emissions by 15%', () => {
    const localDiet = { ...baseDiet, localProduce: true };
    const standard = calcDietMonthlyKg(baseDiet);
    const local = calcDietMonthlyKg(localDiet);
    expect(local).toBeCloseTo(standard * 0.85, 1);
  });

  it('returns 0 for zero-everything diet', () => {
    const zeroDiet: DietProfile = {
      vegetarian: true, veganDays: 7, meatServings: 0, meatType: 'chicken',
      dairyLitresPerWeek: 0, riceKgPerWeek: 0, localProduce: false,
    };
    expect(calcDietMonthlyKg(zeroDiet)).toBe(0);
  });
});

// ── Travel ──

describe('calcTravelMonthlyKg', () => {
  it('returns > 0 for petrol car commute', () => {
    expect(calcTravelMonthlyKg(baseTravel)).toBeGreaterThan(0);
  });

  it('walking produces 0 commute emissions', () => {
    const walkTravel: TravelProfile = {
      ...baseTravel, primaryVehicle: 'walking', dailyCommuteKm: 5,
      flightsDomesticPerYear: 0, flightsIntlPerYear: 0,
      longDistanceTrainTripsPerYear: 0,
    };
    expect(calcTravelMonthlyKg(walkTravel)).toBe(0);
  });

  it('metro < petrol car for same distance', () => {
    const metroTravel = { ...baseTravel, primaryVehicle: 'metro' as const };
    expect(calcTravelMonthlyKg(metroTravel)).toBeLessThan(calcTravelMonthlyKg(baseTravel));
  });
});

// ── Energy ──

describe('calcEnergyMonthlyKg', () => {
  it('returns > 0 for standard energy profile', () => {
    expect(calcEnergyMonthlyKg(baseEnergy)).toBeGreaterThan(0);
  });

  it('solar reduces emissions significantly', () => {
    const solarEnergy = { ...baseEnergy, hasSolar: true };
    expect(calcEnergyMonthlyKg(solarEnergy)).toBeLessThan(calcEnergyMonthlyKg(baseEnergy));
  });

  it('more AC hours = more emissions', () => {
    const moreAc = { ...baseEnergy, acHoursPerDay: 10 };
    expect(calcEnergyMonthlyKg(moreAc)).toBeGreaterThan(calcEnergyMonthlyKg(baseEnergy));
  });
});

// ── Shopping ──

describe('calcShoppingMonthlyKg', () => {
  it('returns > 0 for standard shopping', () => {
    expect(calcShoppingMonthlyKg(baseShopping)).toBeGreaterThan(0);
  });

  it('second-hand reduces by 40%', () => {
    const secondHand = { ...baseShopping, buysSecondHand: true };
    const standard = calcShoppingMonthlyKg(baseShopping);
    const saved = calcShoppingMonthlyKg(secondHand);
    expect(saved).toBeCloseTo(standard * 0.6, 1);
  });
});

// ── Waste ──

describe('calcWasteMonthlyKg', () => {
  it('returns > 0 for standard waste', () => {
    expect(calcWasteMonthlyKg(baseWaste)).toBeGreaterThan(0);
  });

  it('composting reduces emissions significantly', () => {
    const compost = { ...baseWaste, composts: true };
    expect(calcWasteMonthlyKg(compost)).toBeLessThan(calcWasteMonthlyKg(baseWaste));
  });

  it('recycling reduces emissions vs landfill', () => {
    const recycle = { ...baseWaste, recyclesPaper: true, recyclesPlastic: true };
    expect(calcWasteMonthlyKg(recycle)).toBeLessThan(calcWasteMonthlyKg(baseWaste));
  });
});

// ── Full Breakdown ──

describe('calcFullBreakdown', () => {
  it('returns 5 categories sorted by emissions', () => {
    const result = calcFullBreakdown(baseProfile);
    expect(result.byCategory).toHaveLength(5);
    // Sorted descending
    for (let i = 1; i < result.byCategory.length; i++) {
      expect(result.byCategory[i - 1].monthlyCO2Kg).toBeGreaterThanOrEqual(
        result.byCategory[i].monthlyCO2Kg
      );
    }
  });

  it('total equals sum of categories', () => {
    const result = calcFullBreakdown(baseProfile);
    const sum = result.byCategory.reduce((a, c) => a + c.monthlyCO2Kg, 0);
    expect(result.totalMonthlyCO2Kg).toBeCloseTo(sum, 1);
  });

  it('percentages sum to ~100', () => {
    const result = calcFullBreakdown(baseProfile);
    const pctSum = result.byCategory.reduce((a, c) => a + c.percentOfTotal, 0);
    expect(pctSum).toBeCloseTo(100, 0);
  });

  it('has calculatedAt timestamp', () => {
    const result = calcFullBreakdown(baseProfile);
    expect(result.calculatedAt).toBeTruthy();
    expect(new Date(result.calculatedAt).getTime()).not.toBeNaN();
  });

  it('each category has Hindi label', () => {
    const result = calcFullBreakdown(baseProfile);
    for (const cat of result.byCategory) {
      expect(cat.labelHindi).toBeTruthy();
    }
  });
});
