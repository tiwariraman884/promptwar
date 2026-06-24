import { describe, it, expect } from 'vitest';
import { calcFullBreakdown } from '@/lib/carbon-engine-v2';
import { calcHealthScore } from '@/lib/health-score';
import { explainHealthScore, explainCategoryEmission } from '@/lib/rule-based-explainer';
import type { CarbonTwinProfile } from '@/lib/types/carbon-twin-types';

const profile: CarbonTwinProfile = {
  userId: 'explainer-test',
  createdAt: '', updatedAt: '',
  diet: {
    vegetarian: false, veganDays: 0, meatServings: 5, meatType: 'mutton',
    dairyLitresPerWeek: 4, riceKgPerWeek: 3, localProduce: false,
  },
  travel: {
    primaryVehicle: 'petrolCar', dailyCommuteKm: 25,
    flightsDomesticPerYear: 6, flightsIntlPerYear: 2,
    longDistanceTrainTripsPerYear: 1, avgFlightDistanceKm: 1500,
  },
  energy: {
    monthlyElectricityKwh: 350, cookingFuel: 'lpg', lpgCylindersPerMonth: 2,
    acUnits: 3, acHoursPerDay: 8, hasSolar: false, solarCapacityKw: 0,
    acTemperatureSetting: 20,
  },
  shopping: {
    monthlyOnlineOrders: 12, clothingItemsPerMonth: 5,
    electronicsPerYear: 3, usesClothBag: false, buysSecondHand: false,
  },
  waste: {
    weeklyWasteKg: 10, composts: false, recyclesPaper: false,
    recyclesPlastic: false, ewasteKgPerYear: 5,
  },
};

describe('Breakdown → Health Score → Explainer Pipeline', () => {
  const breakdown = calcFullBreakdown(profile);
  const score = calcHealthScore(breakdown);

  it('explainHealthScore uses data from health score', () => {
    const explanation = explainHealthScore(score, breakdown);
    expect(explanation.headline).toContain(String(score.overallScore));
    expect(explanation.headline).toContain(score.grade);
    expect(explanation.factors.length).toBe(score.categoryScores.length);
  });

  it('explanation identifies the correct worst category', () => {
    const sorted = [...score.categoryScores].sort((a, b) => a.score - b.score);
    const worstCategory = sorted[0].label;
    const explanation = explainHealthScore(score, breakdown);
    expect(explanation.recommendation).toContain(worstCategory);
  });

  it('each category can be individually explained', () => {
    for (const cat of breakdown.byCategory) {
      const explanation = explainCategoryEmission(cat, profile);
      expect(explanation.headline).toContain(cat.label);
      expect(explanation.summary).toContain(String(cat.percentOfTotal));
      expect(explanation.recommendation).toBeTruthy();
      expect(explanation.recommendationHindi).toBeTruthy();
    }
  });

  it('all explanations have source labels', () => {
    const scoreExpl = explainHealthScore(score, breakdown);
    expect(scoreExpl.sourceLabel).toContain('CEA India');

    for (const cat of breakdown.byCategory) {
      const catExpl = explainCategoryEmission(cat, profile);
      expect(catExpl.sourceLabel).toBeTruthy();
    }
  });
});
