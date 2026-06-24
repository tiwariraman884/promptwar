// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
// CARBON HEALTH SCORE — Weighted composite scoring (Feature 4)
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

import { INDIA_MONTHLY_BASELINE } from "./emission-factors-v2";
import type {
  EmissionBreakdown,
  CarbonHealthScore,
  CategoryScore,
  ScoreGrade,
} from "./types/carbon-twin-types";

/** Category weights — must sum to 1.0 */
const WEIGHTS: Record<string, number> = {
  travel: 0.30,
  energy: 0.25,
  diet: 0.25,
  shopping: 0.10,
  waste: 0.10,
};

/** Benchmarks: [best, worst] in kg CO₂/month */
const BENCHMARKS: Record<string, { best: number; worst: number }> = {
  travel: { best: 0, worst: 150 },
  energy: { best: 10, worst: 120 },
  diet: { best: 5, worst: 80 },
  shopping: { best: 0, worst: 40 },
  waste: { best: 0, worst: 20 },
};

const GRADE_MAP: Record<string, { grade: ScoreGrade; gradeHindi: string }> = {
  excellent: { grade: "Excellent", gradeHindi: "उत्कृष्ट" },
  good: { grade: "Good", gradeHindi: "अच्छा" },
  average: { grade: "Average", gradeHindi: "औसत" },
  poor: { grade: "Poor", gradeHindi: "खराब" },
  critical: { grade: "Critical", gradeHindi: "गंभीर" },
};

const CATEGORY_LABELS: Record<string, { label: string; labelHindi: string }> = {
  diet: { label: "Diet", labelHindi: "आहार" },
  travel: { label: "Travel", labelHindi: "यात्रा" },
  energy: { label: "Energy", labelHindi: "ऊर्जा" },
  shopping: { label: "Shopping", labelHindi: "खरीदारी" },
  waste: { label: "Waste", labelHindi: "कचरा" },
};

export function calcCategoryScore(
  kg: number,
  best: number,
  worst: number
): number {
  if (kg <= best) return 100;
  if (kg >= worst) return 0;
  return Math.round(((worst - kg) / (worst - best)) * 100);
}

export function calcHealthScore(breakdown: EmissionBreakdown): CarbonHealthScore {
  const categoryScores: CategoryScore[] = [];
  let weightedSum = 0;

  for (const cat of breakdown.byCategory) {
    const bench = BENCHMARKS[cat.category];
    if (!bench) continue;
    const score = calcCategoryScore(cat.monthlyCO2Kg, bench.best, bench.worst);
    const weight = WEIGHTS[cat.category] ?? 0;
    const labels = CATEGORY_LABELS[cat.category] ?? { label: cat.category, labelHindi: cat.category };

    weightedSum += score * weight;
    categoryScores.push({
      category: cat.category,
      score,
      weight,
      label: labels.label,
      labelHindi: labels.labelHindi,
    });
  }

  const overall = Math.round(weightedSum);
  const key =
    overall >= 80
      ? "excellent"
      : overall >= 60
        ? "good"
        : overall >= 40
          ? "average"
          : overall >= 20
            ? "poor"
            : "critical";

  const totalKg = breakdown.totalMonthlyCO2Kg;
  const indiaDelta = ((INDIA_MONTHLY_BASELINE - totalKg) / INDIA_MONTHLY_BASELINE) * 100;

  return {
    overallScore: overall,
    ...GRADE_MAP[key],
    categoryScores,
    vsBaseline: parseFloat(indiaDelta.toFixed(1)),
    trend: "stable",
  };
}
