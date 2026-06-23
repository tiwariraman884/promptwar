"use client";

import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import type { CarbonAnalysisResult, TrendLabel } from "@/types/carbon";

const TREND_CONFIG: Record<TrendLabel, { color: string; icon: string; bg: string }> = {
  Improving: { color: "#22c55e", icon: "↓", bg: "bg-emerald-500/10 text-emerald-400 border-emerald-500/20" },
  Stable:    { color: "#eab308", icon: "→", bg: "bg-yellow-500/10 text-yellow-400 border-yellow-500/20" },
  Worsening: { color: "#ef4444", icon: "↑", bg: "bg-red-500/10 text-red-400 border-red-500/20" },
};

export function ForecastChart({ data }: { data: CarbonAnalysisResult["monthly_forecast"] }) {
  const { month_1_kg, month_2_kg, month_3_kg, trend, seasonal_note } = data;
  const config = TREND_CONFIG[trend];

  const chartData = [
    { name: "Month 1", kg: Math.round(month_1_kg) },
    { name: "Month 2", kg: Math.round(month_2_kg) },
    { name: "Month 3", kg: Math.round(month_3_kg) },
  ];

  return (
    <div className="glass-card p-6 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-heading text-lg font-bold text-white">Monthly Forecast</h3>
        <span className={`inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-bold ${config.bg}`}>
          {config.icon} {trend}
        </span>
      </div>

      <div className="h-56">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="25%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9CA3AF", fontSize: 12 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v}`} />
            <Tooltip
              contentStyle={{
                background: "rgba(28, 47, 45, 0.95)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, color: "#fff", fontSize: 13,
              }}
              formatter={(value: number) => [`${value} kg CO₂e`, "Emissions"]}
            />
            <Bar dataKey="kg" radius={[8, 8, 0, 0]} maxBarSize={48}>
              {chartData.map((_, idx) => (
                <Cell key={idx} fill={config.color} fillOpacity={0.85} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Seasonal note */}
      <div className="flex items-start gap-2 rounded-xl bg-blue-500/[0.06] border border-blue-500/10 p-3">
        <span className="text-blue-400 text-sm mt-0.5">ℹ️</span>
        <p className="text-sm text-gray-300 leading-relaxed">{seasonal_note}</p>
      </div>
    </div>
  );
}

/* ── Loading skeleton ── */

export function ForecastChartSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4 animate-pulse">
      <div className="flex items-center justify-between">
        <div className="h-5 w-40 rounded bg-white/[0.06]" />
        <div className="h-6 w-24 rounded-full bg-white/[0.06]" />
      </div>
      <div className="h-56 rounded-xl bg-white/[0.04]" />
      <div className="h-10 rounded-xl bg-blue-500/[0.04]" />
    </div>
  );
}
