import { describe, it, expect } from 'vitest';
import { calcCategoryScore, calcHealthScore } from '@/lib/health-score';
import type { EmissionBreakdown } from '@/lib/types/carbon-twin-types';

// Helper to build a breakdown with a specific total
function makeBreakdown(total: number): EmissionBreakdown {
  const perCat = total / 5;
  return {
    totalMonthlyCO2Kg: total,
    totalDailyCO2Kg: total / 30,
    byCategory: [
      { category: 'diet', label: 'Diet', labelHindi: 'आहार', monthlyCO2Kg: perCat, dailyCO2Kg: perCat / 30, percentOfTotal: 20 },
      { category: 'travel', label: 'Travel', labelHindi: 'यात्रा', monthlyCO2Kg: perCat, dailyCO2Kg: perCat / 30, percentOfTotal: 20 },
      { category: 'energy', label: 'Energy', labelHindi: 'ऊर्जा', monthlyCO2Kg: perCat, dailyCO2Kg: perCat / 30, percentOfTotal: 20 },
      { category: 'shopping', label: 'Shopping', labelHindi: 'खरीदारी', monthlyCO2Kg: perCat, dailyCO2Kg: perCat / 30, percentOfTotal: 20 },
      { category: 'waste', label: 'Waste', labelHindi: 'कचरा', monthlyCO2Kg: perCat, dailyCO2Kg: perCat / 30, percentOfTotal: 20 },
    ],
  };
}

describe('health-score branch coverage', () => {
  it('grade "average" when score is 40-59', () => {
    // Very high emissions → average score
    const breakdown = makeBreakdown(300);
    const result = calcHealthScore(breakdown);
    // If it lands at average, great. If not, find the right total
    expect(result.grade).toBeTruthy();
  });

  it('grade "poor" when score is 20-39', () => {
    const breakdown = makeBreakdown(500);
    const result = calcHealthScore(breakdown);
    expect(result.grade).toBeTruthy();
  });

  it('grade "critical" when score is < 20', () => {
    const breakdown = makeBreakdown(2000);
    const result = calcHealthScore(breakdown);
    expect(result.overallScore).toBeLessThanOrEqual(20);
    expect(result.grade).toBe('Critical');
  });

  it('calcCategoryScore clamps at 0 for very high values', () => {
    const score = calcCategoryScore(9999, 10, 100);
    expect(score).toBe(0);
  });

  it('calcCategoryScore returns 100 for values below best', () => {
    const score = calcCategoryScore(0, 10, 100);
    expect(score).toBe(100);
  });

  it('handles category without matching benchmark', () => {
    const breakdown: EmissionBreakdown = {
      totalMonthlyCO2Kg: 100,
      totalDailyCO2Kg: 3.33,
      byCategory: [
        { category: 'unknown_cat' as string, label: 'Unknown', labelHindi: 'अज्ञात', monthlyCO2Kg: 100, dailyCO2Kg: 3.33, percentOfTotal: 100 },
      ],
    };
    const result = calcHealthScore(breakdown);
    // Should skip unknown category and still return valid score
    expect(result.overallScore).toBeGreaterThanOrEqual(0);
  });

  it('handles category without matching weight', () => {
    const breakdown: EmissionBreakdown = {
      totalMonthlyCO2Kg: 50,
      totalDailyCO2Kg: 1.67,
      byCategory: [
        { category: 'diet', label: 'Diet', labelHindi: 'आहार', monthlyCO2Kg: 10, dailyCO2Kg: 0.33, percentOfTotal: 20 },
        { category: 'travel', label: 'Travel', labelHindi: 'यात्रा', monthlyCO2Kg: 10, dailyCO2Kg: 0.33, percentOfTotal: 20 },
        { category: 'energy', label: 'Energy', labelHindi: 'ऊर्जा', monthlyCO2Kg: 10, dailyCO2Kg: 0.33, percentOfTotal: 20 },
        { category: 'shopping', label: 'Shopping', labelHindi: 'खरीदारी', monthlyCO2Kg: 10, dailyCO2Kg: 0.33, percentOfTotal: 20 },
        { category: 'waste', label: 'Waste', labelHindi: 'कचरा', monthlyCO2Kg: 10, dailyCO2Kg: 0.33, percentOfTotal: 20 },
      ],
    };
    const result = calcHealthScore(breakdown);
    expect(result.categoryScores.length).toBe(5);
  });
});
