import { describe, it, expect } from 'vitest';
import { calcForecast } from '@/lib/forecast-engine';

function makeSnapshots(kgs: number[]): Array<{ year_month: string; total_kg: number }> {
  return kgs.map((kg, i) => ({
    year_month: `2024-${String(i + 1).padStart(2, '0')}`,
    total_kg: kg,
  }));
}

describe('calcForecast', () => {
  it('returns insufficient_data for 0 snapshots', () => {
    const result = calcForecast([]);
    expect(result.modelUsed).toBe('insufficient_data');
    expect(result.forecasts).toHaveLength(0);
    expect(result.warning).toContain('3');
  });

  it('returns insufficient_data for 1 snapshot', () => {
    const result = calcForecast(makeSnapshots([100]));
    expect(result.modelUsed).toBe('insufficient_data');
    expect(result.warning).toContain('2');
  });

  it('returns insufficient_data for 2 snapshots', () => {
    const result = calcForecast(makeSnapshots([100, 110]));
    expect(result.modelUsed).toBe('insufficient_data');
    expect(result.warning).toContain('1');
  });

  it('returns 3 forecast points with 3+ snapshots', () => {
    const result = calcForecast(makeSnapshots([100, 110, 120]));
    expect(result.forecasts).toHaveLength(3);
    expect(result.forecasts.map(f => f.period)).toEqual([
      'next_month', 'next_quarter', 'next_year',
    ]);
  });

  it('uses weighted_average for 3-5 snapshots', () => {
    const result = calcForecast(makeSnapshots([100, 110, 120]));
    expect(result.modelUsed).toBe('weighted_average');
    expect(result.dataPointsUsed).toBe(3);
  });

  it('uses linear_regression for 6+ snapshots', () => {
    const result = calcForecast(makeSnapshots([100, 105, 110, 115, 120, 125]));
    expect(result.modelUsed).toBe('linear_regression');
    expect(result.dataPointsUsed).toBe(6);
  });

  it('detects upward trend', () => {
    const result = calcForecast(makeSnapshots([50, 60, 70, 80, 90, 100]));
    // The forecast for next month should be > current, so trend = "up"
    const nextMonth = result.forecasts.find(f => f.period === 'next_month');
    expect(nextMonth?.trend).toBe('up');
  });

  it('detects downward trend', () => {
    const result = calcForecast(makeSnapshots([100, 90, 80, 70, 60, 50]));
    const nextMonth = result.forecasts.find(f => f.period === 'next_month');
    expect(nextMonth?.trend).toBe('down');
  });

  it('has confidence interval (min < projected < max)', () => {
    const result = calcForecast(makeSnapshots([80, 90, 100, 110, 120, 130]));
    const f = result.forecasts[0];
    expect(f.confidenceMin).toBeLessThanOrEqual(f.projectedKg);
    expect(f.confidenceMax).toBeGreaterThanOrEqual(f.projectedKg);
  });

  it('projected values are never negative', () => {
    const result = calcForecast(makeSnapshots([10, 5, 1]));
    for (const f of result.forecasts) {
      expect(f.projectedKg).toBeGreaterThanOrEqual(0);
      expect(f.confidenceMin).toBeGreaterThanOrEqual(0);
    }
  });

  it('handles unsorted snapshots correctly', () => {
    const unsorted = [
      { year_month: '2024-03', total_kg: 120 },
      { year_month: '2024-01', total_kg: 100 },
      { year_month: '2024-02', total_kg: 110 },
    ];
    const result = calcForecast(unsorted);
    expect(result.forecasts).toHaveLength(3);
  });

  it('limits to last 12 months', () => {
    const result = calcForecast(makeSnapshots(Array(15).fill(100)));
    expect(result.dataPointsUsed).toBe(12);
  });

  it('each forecast has a bilingual label', () => {
    const result = calcForecast(makeSnapshots([100, 110, 120]));
    for (const f of result.forecasts) {
      expect(f.label).toBeTruthy();
      expect(f.label).toContain('/');
    }
  });
});
