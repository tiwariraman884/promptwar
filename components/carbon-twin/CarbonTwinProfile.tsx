"use client";

import { INDIA_MONTHLY_BASELINE, SCORE_MAX_MONTHLY_CO2 } from "@/lib/emission-factors-v2";
import type { EmissionBreakdown } from "@/lib/types/carbon-twin-types";

const CATEGORY_COLORS: Record<string, string> = {
  diet: "bg-green-500",
  travel: "bg-blue-500",
  energy: "bg-orange-500",
  shopping: "bg-purple-500",
  waste: "bg-gray-400",
};

interface TwinRiskScoreProps {
  totalMonthlyCO2: number;
}

export function TwinRiskScore({ totalMonthlyCO2 }: TwinRiskScoreProps): JSX.Element {
  const raw = (1 - totalMonthlyCO2 / SCORE_MAX_MONTHLY_CO2) * 100;
  const score = Math.max(0, Math.min(100, Math.round(raw)));
  const tier = score >= 61 ? "LOW RISK" : score >= 31 ? "MEDIUM RISK" : "HIGH RISK";
  const tierHindi = score >= 61 ? "कम जोखिम" : score >= 31 ? "मध्यम जोखिम" : "उच्च जोखिम";
  const emoji = score >= 61 ? "🟢" : score >= 31 ? "🟡" : "🔴";
  const ringColor = score >= 61 ? "text-green-500" : score >= 31 ? "text-yellow-500" : "text-red-500";

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="relative w-20 h-20">
        <svg className="w-full h-full -rotate-90" viewBox="0 0 36 36">
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor"
            className="text-gray-700" strokeWidth="3" />
          <circle cx="18" cy="18" r="15.9" fill="none" stroke="currentColor"
            className={ringColor} strokeWidth="3"
            strokeDasharray={`${score} ${100 - score}`} strokeLinecap="round" />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-lg font-black text-white">{score}</span>
        </div>
      </div>
      <div className="text-center">
        <span className="block text-sm font-bold text-gray-200">{emoji} {tier}</span>
        <span className="block text-xs text-gray-500">{tierHindi}</span>
      </div>
    </div>
  );
}

interface CarbonTwinProfileProps {
  breakdown: EmissionBreakdown;
  hasForecast: boolean;
  forecastWidget?: React.ReactNode;
  explainButton?: React.ReactNode;
}

export function CarbonTwinProfile({ breakdown, hasForecast, forecastWidget, explainButton }: CarbonTwinProfileProps): JSX.Element {
  const total = breakdown.totalMonthlyCO2Kg;
  const footprintColor = total < 100 ? "text-green-400" : total <= 200 ? "text-yellow-400" : "text-red-400";
  const vsAvg = total - INDIA_MONTHLY_BASELINE;
  const vsText = vsAvg > 0
    ? `${vsAvg.toFixed(0)} kg above India avg`
    : `${Math.abs(vsAvg).toFixed(0)} kg below India avg`;

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      {/* CARD 1 — Current Footprint */}
      <div className="rounded-2xl border border-gray-700/50 bg-slate-900/60 backdrop-blur-xl p-5">
        <div className="flex items-center justify-between mb-3">
          <div>
            <span className="block text-sm font-medium text-gray-300">Current Footprint</span>
            <span className="block text-xs text-gray-500">वर्तमान कार्बन पदचिह्न</span>
          </div>
          {explainButton}
        </div>
        <p className={`text-3xl font-black ${footprintColor}`}>
          {total.toFixed(0)} <span className="text-base font-medium">kg CO₂/month</span>
        </p>
        <p className="text-xs text-gray-500 mt-1">vs. India avg {INDIA_MONTHLY_BASELINE} kg — {vsText}</p>
      </div>

      {/* CARD 2 — Future Footprint / Forecast */}
      <div className="rounded-2xl border border-gray-700/50 bg-slate-900/60 backdrop-blur-xl p-5">
        <span className="block text-sm font-medium text-gray-300">6-Month Projection</span>
        <span className="block text-xs text-gray-500 mb-3">6 महीने का अनुमान</span>
        {hasForecast && forecastWidget ? (
          forecastWidget
        ) : (
          <div className="flex items-center gap-2 p-3 rounded-xl bg-gray-800/50 border border-gray-700">
            <span className="text-lg">📊</span>
            <p className="text-xs text-gray-400">Continue tracking for 3 months to unlock forecast.</p>
          </div>
        )}
      </div>

      {/* CARD 3 — Risk Score */}
      <div className="rounded-2xl border border-gray-700/50 bg-slate-900/60 backdrop-blur-xl p-5">
        <span className="block text-sm font-medium text-gray-300 mb-1">Risk Score</span>
        <span className="block text-xs text-gray-500 mb-3">जोखिम स्कोर</span>
        <TwinRiskScore totalMonthlyCO2={total} />
      </div>

      {/* CARD 4 — Category Breakdown (CSS stacked bar) */}
      <div className="rounded-2xl border border-gray-700/50 bg-slate-900/60 backdrop-blur-xl p-5">
        <span className="block text-sm font-medium text-gray-300 mb-1">Category Breakdown</span>
        <span className="block text-xs text-gray-500 mb-3">श्रेणी विवरण</span>

        {/* Stacked bar */}
        <div className="w-full h-5 rounded-full overflow-hidden flex bg-gray-800 mb-3">
          {breakdown.byCategory.map((cat) => (
            <div
              key={cat.category}
              className={`${CATEGORY_COLORS[cat.category] ?? "bg-gray-500"} h-full transition-all`}
              style={{ width: `${cat.percentOfTotal}%` }}
              title={`${cat.label}: ${cat.percentOfTotal}%`}
            />
          ))}
        </div>

        {/* Legend */}
        <div className="grid grid-cols-2 gap-1">
          {breakdown.byCategory.map((cat) => (
            <div key={cat.category} className="flex items-center gap-1.5 text-xs">
              <div className={`w-2.5 h-2.5 rounded-sm ${CATEGORY_COLORS[cat.category] ?? "bg-gray-500"}`} />
              <span className="text-gray-300">{cat.label}</span>
              <span className="text-gray-500 ml-auto">{cat.monthlyCO2Kg.toFixed(0)} kg</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
