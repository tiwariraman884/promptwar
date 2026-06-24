"use client";

import type { CarbonHealthScore as HealthScoreType } from "@/lib/types/carbon-twin-types";
import { HealthScoreGauge } from "./HealthScoreGauge";
import { CategoryBar } from "./CategoryBar";

interface CarbonHealthScoreWidgetProps {
  score: HealthScoreType;
  explainButton?: React.ReactNode;
}

export function CarbonHealthScoreWidget({ score, explainButton }: CarbonHealthScoreWidgetProps): JSX.Element {
  const comparisonText = score.vsBaseline > 0
    ? `${score.vsBaseline.toFixed(0)}% cleaner than most Indians 🇮🇳`
    : `You emit ${Math.abs(score.vsBaseline).toFixed(0)}% more than the India average.`;

  return (
    <div className="rounded-2xl border border-gray-700/50 bg-slate-900/60 backdrop-blur-xl p-6 space-y-6">
      {/* Gauge */}
      <div className="flex justify-center relative">
        <HealthScoreGauge score={score.overallScore} grade={score.grade} gradeHindi={score.gradeHindi} />
        {explainButton && (
          <div className="absolute top-0 right-0">{explainButton}</div>
        )}
      </div>

      {/* Category Bars */}
      <div className="space-y-3">
        <h3 className="text-sm font-medium text-gray-400 uppercase tracking-wider">
          Category Scores / श्रेणी स्कोर
        </h3>
        {score.categoryScores.map((cs) => (
          <CategoryBar key={cs.category} categoryScore={cs} />
        ))}
      </div>

      {/* Comparison Line */}
      <div className={`rounded-xl p-3 text-center text-sm ${
        score.vsBaseline > 0
          ? "bg-green-900/20 border border-green-700/30 text-green-400"
          : "bg-red-900/20 border border-red-700/30 text-red-400"
      }`}>
        vs. India average: {comparisonText}
      </div>
    </div>
  );
}
