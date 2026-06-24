"use client";

import type { ForecastPoint } from "@/lib/types/carbon-twin-types";

interface ForecastCardProps {
  forecast: ForecastPoint;
  explainButton?: React.ReactNode;
}

export function ForecastCard({ forecast, explainButton }: ForecastCardProps): JSX.Element {
  const trendEmoji = forecast.trend === "up" ? "📈" : forecast.trend === "down" ? "📉" : "➡️";
  const trendColor = forecast.trend === "up" ? "text-red-400" : forecast.trend === "down" ? "text-green-400" : "text-gray-400";

  return (
    <div className="rounded-2xl border border-gray-700/50 bg-slate-900/40 p-4 min-w-[200px] flex-shrink-0">
      <div className="flex items-start justify-between mb-3">
        <div>
          <span className="block text-sm font-medium text-gray-300">{forecast.label.split(" / ")[0]}</span>
          <span className="block text-xs text-gray-500">{forecast.label.split(" / ")[1] ?? ""}</span>
        </div>
        {explainButton}
      </div>

      <p className="text-2xl font-black text-white mb-1">
        {forecast.projectedKg.toFixed(0)} <span className="text-sm font-medium text-gray-400">kg</span>
      </p>

      <p className={`text-sm font-medium ${trendColor} mb-2`}>
        {trendEmoji} {forecast.trend === "up" ? "Trending up" : forecast.trend === "down" ? "Trending down" : "Stable"}
      </p>

      <p className="text-xs text-gray-500">
        Range: {forecast.confidenceMin.toFixed(0)}–{forecast.confidenceMax.toFixed(0)} kg
      </p>
    </div>
  );
}
