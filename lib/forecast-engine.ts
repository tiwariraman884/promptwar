// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CARBON FORECAST ENGINE — Linear regression (Feature 5)
// Pure TypeScript math, no AI API call.
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import type { ForecastPoint, CarbonForecast } from "./types/carbon-twin-types";

interface Snapshot {
  year_month: string;
  total_kg: number;
}

export function calcForecast(snapshots: Snapshot[]): CarbonForecast {
  const sorted = [...snapshots].sort((a, b) =>
    a.year_month.localeCompare(b.year_month)
  );

  if (sorted.length < 3) {
    return {
      dataPointsUsed: sorted.length,
      forecasts: [],
      modelUsed: "insufficient_data",
      warning: `Need ${3 - sorted.length} more month(s) of data to forecast.`,
    };
  }

  // Linear regression (least squares) on last 12 months max
  const recent = sorted.slice(-12);
  const n = recent.length;
  const x = recent.map((_, i) => i);
  const y = recent.map((s) => s.total_kg);

  const sumX = x.reduce((a, b) => a + b, 0);
  const sumY = y.reduce((a, b) => a + b, 0);
  const sumXY = x.reduce((acc, xi, i) => acc + xi * y[i], 0);
  const sumX2 = x.reduce((acc, xi) => acc + xi * xi, 0);

  const denominator = n * sumX2 - sumX * sumX;
  const slope = denominator !== 0 ? (n * sumXY - sumX * sumY) / denominator : 0;
  const intercept = (sumY - slope * sumX) / n;

  const predict = (stepsAhead: number): number =>
    Math.max(0, parseFloat((intercept + slope * (n - 1 + stepsAhead)).toFixed(1)));

  // Confidence interval: ±1.645 × stddev of last 3 values (90% CI)
  const last3 = y.slice(-3);
  const mean3 = last3.reduce((a, b) => a + b, 0) / 3;
  const stdDev = Math.sqrt(
    last3.reduce((a, v) => a + Math.pow(v - mean3, 2), 0) / 3
  );
  const ci = stdDev * 1.645;

  const make = (
    period: ForecastPoint["period"],
    label: string,
    stepsAhead: number
  ): ForecastPoint => {
    const kg = predict(stepsAhead);
    const prev = predict(0);
    return {
      period,
      label,
      projectedKg: kg,
      confidenceMin: Math.max(0, parseFloat((kg - ci).toFixed(1))),
      confidenceMax: parseFloat((kg + ci).toFixed(1)),
      trend: kg > prev * 1.02 ? "up" : kg < prev * 0.98 ? "down" : "flat",
    };
  };

  return {
    dataPointsUsed: n,
    modelUsed: n >= 6 ? "linear_regression" : "weighted_average",
    forecasts: [
      make("next_month", "Next Month / अगला महीना", 1),
      make("next_quarter", "Next Quarter / अगली तिमाही", 3),
      make("next_year", "Next Year / अगला साल", 12),
    ],
  };
}
