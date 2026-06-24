import { describe, it, expect } from 'vitest';
import { calcFullBreakdown } from '@/lib/carbon-engine-v2';
import { calcHealthScore } from '@/lib/health-score';
import { calcForecast } from '@/lib/forecast-engine';
import type { CarbonTwinProfile } from '@/lib/types/carbon-twin-types';

const profile: CarbonTwinProfile = {
  userId: 'integration-test',
  createdAt: '2024-01-01',
  updatedAt: '2024-06-01',
  diet: {
    vegetarian: false, veganDays: 1, meatServings: 4, meatType: 'chicken',
    dairyLitresPerWeek: 3, riceKgPerWeek: 2, localProduce: false,
  },
  travel: {
    primaryVehicle: 'petrolBike', dailyCommuteKm: 20,
    flightsDomesticPerYear: 4, flightsIntlPerYear: 1,
    longDistanceTrainTripsPerYear: 3, avgFlightDistanceKm: 1200,
  },
  energy: {
    monthlyElectricityKwh: 250, cookingFuel: 'lpg', lpgCylindersPerMonth: 1,
    acUnits: 2, acHoursPerDay: 6, hasSolar: false, solarCapacityKw: 0,
    acTemperatureSetting: 22,
  },
  shopping: {
    monthlyOnlineOrders: 8, clothingItemsPerMonth: 3,
    electronicsPerYear: 2, usesClothBag: false, buysSecondHand: false,
  },
  waste: {
    weeklyWasteKg: 6, composts: false, recyclesPaper: true,
    recyclesPlastic: false, ewasteKgPerYear: 3,
  },
};

describe('Calculator → Health Score → Forecast Pipeline', () => {
  it('calcFullBreakdown feeds into calcHealthScore', () => {
    const breakdown = calcFullBreakdown(profile);
    const score = calcHealthScore(breakdown);

    // Score should be valid
    expect(score.overallScore).toBeGreaterThanOrEqual(0);
    expect(score.overallScore).toBeLessThanOrEqual(100);
    expect(score.grade).toBeTruthy();
    expect(score.categoryScores.length).toBe(5);

    // Each category in health score should correspond to a breakdown category
    const breakdownCats = new Set(breakdown.byCategory.map(c => c.category));
    for (const cs of score.categoryScores) {
      expect(breakdownCats.has(cs.category)).toBe(true);
    }
  });

  it('breakdown total is consistent with individual calculations', () => {
    const breakdown = calcFullBreakdown(profile);
    const sum = breakdown.byCategory.reduce((a, c) => a + c.monthlyCO2Kg, 0);
    expect(breakdown.totalMonthlyCO2Kg).toBeCloseTo(sum, 1);
  });

  it('monthly snapshots feed into forecast engine', () => {
    const breakdown = calcFullBreakdown(profile);
    // Simulate 6 months of data
    const snapshots = Array.from({ length: 6 }, (_, i) => ({
      year_month: `2024-${String(i + 1).padStart(2, '0')}`,
      total_kg: breakdown.totalMonthlyCO2Kg + (i - 3) * 5, // slight trend
    }));

    const forecast = calcForecast(snapshots);
    expect(forecast.modelUsed).toBe('linear_regression');
    expect(forecast.forecasts).toHaveLength(3);
    expect(forecast.dataPointsUsed).toBe(6);
  });

  it('reducing habits improves health score', () => {
    const heavyProfile = { ...profile };
    const lightProfile: CarbonTwinProfile = {
      ...profile,
      diet: { ...profile.diet, vegetarian: true, localProduce: true },
      travel: { ...profile.travel, primaryVehicle: 'metro', flightsDomesticPerYear: 0, flightsIntlPerYear: 0 },
      energy: { ...profile.energy, hasSolar: true, acUnits: 0, acHoursPerDay: 0 },
      shopping: { ...profile.shopping, buysSecondHand: true, monthlyOnlineOrders: 1 },
      waste: { ...profile.waste, composts: true },
    };

    const heavyBreakdown = calcFullBreakdown(heavyProfile);
    const lightBreakdown = calcFullBreakdown(lightProfile);

    expect(lightBreakdown.totalMonthlyCO2Kg).toBeLessThan(heavyBreakdown.totalMonthlyCO2Kg);

    const heavyScore = calcHealthScore(heavyBreakdown);
    const lightScore = calcHealthScore(lightBreakdown);

    expect(lightScore.overallScore).toBeGreaterThan(heavyScore.overallScore);
  });
});
