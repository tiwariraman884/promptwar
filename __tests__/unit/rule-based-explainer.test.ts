import { describe, it, expect } from 'vitest';
import { explainHealthScore, explainCategoryEmission, explainForecast } from '@/lib/rule-based-explainer';
import type {
  CarbonHealthScore,
  EmissionBreakdown,
  CategoryEmission,
  CarbonTwinProfile,
  ForecastPoint,
} from '@/lib/types/carbon-twin-types';

const mockScore: CarbonHealthScore = {
  overallScore: 65,
  grade: 'Good',
  gradeHindi: 'अच्छा',
  vsBaseline: 10,
  trend: 'stable',
  categoryScores: [
    { category: 'diet', score: 70, weight: 0.25, label: 'Diet', labelHindi: 'आहार' },
    { category: 'travel', score: 40, weight: 0.30, label: 'Travel', labelHindi: 'यात्रा' },
    { category: 'energy', score: 80, weight: 0.25, label: 'Energy', labelHindi: 'ऊर्जा' },
    { category: 'shopping', score: 90, weight: 0.10, label: 'Shopping', labelHindi: 'खरीदारी' },
    { category: 'waste', score: 85, weight: 0.10, label: 'Waste', labelHindi: 'कचरा' },
  ],
};

const mockBreakdown: EmissionBreakdown = {
  totalMonthlyCO2Kg: 143,
  calculatedAt: new Date().toISOString(),
  byCategory: [
    { category: 'travel', monthlyCO2Kg: 50, percentOfTotal: 35, label: 'Travel', labelHindi: 'यात्रा' },
    { category: 'energy', monthlyCO2Kg: 40, percentOfTotal: 28, label: 'Energy', labelHindi: 'ऊर्जा' },
    { category: 'diet', monthlyCO2Kg: 30, percentOfTotal: 21, label: 'Diet', labelHindi: 'आहार' },
    { category: 'shopping', monthlyCO2Kg: 15, percentOfTotal: 10, label: 'Shopping', labelHindi: 'खरीदारी' },
    { category: 'waste', monthlyCO2Kg: 8, percentOfTotal: 6, label: 'Waste', labelHindi: 'कचरा' },
  ],
};

const mockProfile: CarbonTwinProfile = {
  userId: 'test', createdAt: '', updatedAt: '',
  diet: { vegetarian: false, veganDays: 0, meatServings: 3, meatType: 'chicken', dairyLitresPerWeek: 2, riceKgPerWeek: 1, localProduce: false },
  travel: { primaryVehicle: 'petrolCar', dailyCommuteKm: 15, flightsDomesticPerYear: 2, flightsIntlPerYear: 0, longDistanceTrainTripsPerYear: 2, avgFlightDistanceKm: 1000 },
  energy: { monthlyElectricityKwh: 200, cookingFuel: 'lpg', lpgCylindersPerMonth: 1, acUnits: 1, acHoursPerDay: 4, hasSolar: false, solarCapacityKw: 0, acTemperatureSetting: 24 },
  shopping: { monthlyOnlineOrders: 5, clothingItemsPerMonth: 2, electronicsPerYear: 1, usesClothBag: false, buysSecondHand: false },
  waste: { weeklyWasteKg: 5, composts: false, recyclesPaper: false, recyclesPlastic: false, ewasteKgPerYear: 2 },
};

describe('explainHealthScore', () => {
  it('returns headline with score and grade', () => {
    const result = explainHealthScore(mockScore, mockBreakdown);
    expect(result.headline).toContain('65');
    expect(result.headline).toContain('Good');
  });

  it('returns Hindi headline', () => {
    const result = explainHealthScore(mockScore, mockBreakdown);
    expect(result.headlineHindi).toBeTruthy();
    expect(result.headlineHindi).toContain('65');
  });

  it('identifies worst and best categories in summary', () => {
    const result = explainHealthScore(mockScore, mockBreakdown);
    expect(result.summary).toContain('Travel'); // worst (40)
    expect(result.summary).toContain('Shopping'); // best (90)
  });

  it('recommendation focuses on worst category', () => {
    const result = explainHealthScore(mockScore, mockBreakdown);
    expect(result.recommendation).toContain('Travel');
  });

  it('has factors array matching category count', () => {
    const result = explainHealthScore(mockScore, mockBreakdown);
    expect(result.factors.length).toBe(5);
  });

  it('has source label', () => {
    const result = explainHealthScore(mockScore, mockBreakdown);
    expect(result.sourceLabel).toContain('CEA India');
  });
});

describe('explainCategoryEmission', () => {
  const categories = ['diet', 'travel', 'energy', 'shopping', 'waste'];

  for (const cat of categories) {
    it(`generates explanation for ${cat}`, () => {
      const emission = mockBreakdown.byCategory.find(c => c.category === cat)!;
      const result = explainCategoryEmission(emission, mockProfile);
      expect(result.headline).toContain(emission.label);
      expect(result.recommendation).toBeTruthy();
      expect(result.recommendationHindi).toBeTruthy();
    });
  }

  it('handles unknown category gracefully', () => {
    const unknown: CategoryEmission = {
      category: 'unknown' as 'diet',
      monthlyCO2Kg: 10,
      percentOfTotal: 5,
      label: 'Unknown',
      labelHindi: 'अज्ञात',
    };
    const result = explainCategoryEmission(unknown, mockProfile);
    expect(result.recommendation).toBeTruthy();
  });
});

describe('explainForecast', () => {
  const snapshots = [
    { year_month: '2024-01', total_kg: 100 },
    { year_month: '2024-02', total_kg: 110 },
    { year_month: '2024-03', total_kg: 120 },
  ];

  it('explains upward trend', () => {
    const point: ForecastPoint = {
      period: 'next_month', label: 'Next Month / अगला महीना',
      projectedKg: 130, confidenceMin: 115, confidenceMax: 145, trend: 'up',
    };
    const result = explainForecast(point, snapshots);
    expect(result.summary).toContain('increasing');
    expect(result.recommendation).toContain('trending up');
  });

  it('explains downward trend', () => {
    const point: ForecastPoint = {
      period: 'next_month', label: 'Next Month / अगला महीना',
      projectedKg: 110, confidenceMin: 95, confidenceMax: 125, trend: 'down',
    };
    const result = explainForecast(point, snapshots);
    expect(result.summary).toContain('decreasing');
    expect(result.recommendation).toContain('Great progress');
  });

  it('explains flat trend', () => {
    const point: ForecastPoint = {
      period: 'next_month', label: 'Next Month / अगला महीना',
      projectedKg: 120, confidenceMin: 105, confidenceMax: 135, trend: 'flat',
    };
    const result = explainForecast(point, snapshots);
    expect(result.summary).toContain('stable');
  });

  it('includes confidence interval in summary', () => {
    const point: ForecastPoint = {
      period: 'next_month', label: 'Next Month',
      projectedKg: 130, confidenceMin: 115, confidenceMax: 145, trend: 'up',
    };
    const result = explainForecast(point, snapshots);
    expect(result.summary).toContain('115');
    expect(result.summary).toContain('145');
  });

  it('has Hindi recommendation', () => {
    const point: ForecastPoint = {
      period: 'next_month', label: 'Next Month',
      projectedKg: 130, confidenceMin: 115, confidenceMax: 145, trend: 'up',
    };
    const result = explainForecast(point, snapshots);
    expect(result.recommendationHindi).toBeTruthy();
  });
});
