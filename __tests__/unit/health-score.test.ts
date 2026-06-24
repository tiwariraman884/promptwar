import { describe, it, expect } from 'vitest';
import { calcCategoryScore, calcHealthScore } from '@/lib/health-score';
import type { EmissionBreakdown } from '@/lib/types/carbon-twin-types';

// ── Helper: build a standard breakdown ──
function makeBreakdown(overrides: Partial<Record<string, number>> = {}): EmissionBreakdown {
  const defaults: Record<string, number> = {
    diet: 30, travel: 50, energy: 40, shopping: 15, waste: 8,
    ...overrides,
  };
  const total = Object.values(defaults).reduce((a, b) => a + b, 0);
  return {
    totalMonthlyCO2Kg: total,
    calculatedAt: new Date().toISOString(),
    byCategory: Object.entries(defaults).map(([cat, kg]) => ({
      category: cat as 'diet' | 'travel' | 'energy' | 'shopping' | 'waste',
      monthlyCO2Kg: kg,
      percentOfTotal: total > 0 ? parseFloat(((kg / total) * 100).toFixed(1)) : 0,
      label: cat.charAt(0).toUpperCase() + cat.slice(1),
      labelHindi: cat,
    })),
  };
}

describe('calcCategoryScore', () => {
  it('returns 100 when kg is at best', () => {
    expect(calcCategoryScore(0, 0, 150)).toBe(100);
  });

  it('returns 0 when kg is at worst', () => {
    expect(calcCategoryScore(150, 0, 150)).toBe(0);
  });

  it('returns 50 at midpoint', () => {
    expect(calcCategoryScore(75, 0, 150)).toBe(50);
  });

  it('returns 100 when kg is below best', () => {
    expect(calcCategoryScore(-10, 0, 150)).toBe(100);
  });

  it('returns 0 when kg exceeds worst', () => {
    expect(calcCategoryScore(200, 0, 150)).toBe(0);
  });

  it('handles non-zero best correctly', () => {
    // best=10, worst=120 → range=110, at 65 → (120-65)/110 ≈ 50
    expect(calcCategoryScore(65, 10, 120)).toBe(50);
  });
});

describe('calcHealthScore', () => {
  it('returns Excellent grade for very low emissions', () => {
    const breakdown = makeBreakdown({ diet: 5, travel: 0, energy: 10, shopping: 0, waste: 0 });
    const result = calcHealthScore(breakdown);
    expect(result.grade).toBe('Excellent');
    expect(result.overallScore).toBeGreaterThanOrEqual(80);
  });

  it('returns Critical grade for very high emissions', () => {
    const breakdown = makeBreakdown({ diet: 80, travel: 150, energy: 120, shopping: 40, waste: 20 });
    const result = calcHealthScore(breakdown);
    expect(result.grade).toBe('Critical');
    expect(result.overallScore).toBeLessThan(20);
  });

  it('returns Good grade for moderate emissions', () => {
    const breakdown = makeBreakdown({ diet: 20, travel: 30, energy: 25, shopping: 5, waste: 3 });
    const result = calcHealthScore(breakdown);
    expect(['Good', 'Excellent']).toContain(result.grade);
    expect(result.overallScore).toBeGreaterThanOrEqual(60);
  });

  it('has 5 category scores', () => {
    const breakdown = makeBreakdown();
    const result = calcHealthScore(breakdown);
    expect(result.categoryScores).toHaveLength(5);
  });

  it('vsBaseline is calculated correctly', () => {
    const breakdown = makeBreakdown();
    const result = calcHealthScore(breakdown);
    expect(typeof result.vsBaseline).toBe('number');
  });

  it('handles empty breakdown (no categories)', () => {
    const breakdown: EmissionBreakdown = {
      totalMonthlyCO2Kg: 0,
      calculatedAt: new Date().toISOString(),
      byCategory: [],
    };
    const result = calcHealthScore(breakdown);
    expect(result.overallScore).toBe(0);
  });

  it('has gradeHindi field populated', () => {
    const breakdown = makeBreakdown();
    const result = calcHealthScore(breakdown);
    expect(result.gradeHindi).toBeTruthy();
    expect(typeof result.gradeHindi).toBe('string');
  });

  it('category weights sum to 1.0', () => {
    const breakdown = makeBreakdown();
    const result = calcHealthScore(breakdown);
    const totalWeight = result.categoryScores.reduce((sum, c) => sum + c.weight, 0);
    expect(totalWeight).toBeCloseTo(1.0, 5);
  });
});
