"use client";

import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Area,
} from "recharts";
import type { CarbonAnalysisResult } from "@/types/carbon";

export function EmissionsTimeline({ data }: { data: CarbonAnalysisResult["predicted_emissions_timeline"] }) {
  const { business_as_usual, optimized_path, total_annual_savings_kg } = data;

  const chartData = Array.from({ length: 6 }, (_, i) => ({
    name: `Month ${i + 1}`,
    bau: Math.round(business_as_usual[i]),
    optimized: Math.round(optimized_path[i]),
  }));

  return (
    <div className="glass-card p-6 space-y-4">
      <h3 className="font-heading text-lg font-bold text-white">6-Month Emissions Timeline</h3>

      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="savingsGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.15} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.05)" />
            <XAxis dataKey="name" tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#9CA3AF", fontSize: 11 }} axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v}`} />
            <Tooltip
              contentStyle={{
                background: "rgba(28, 47, 45, 0.95)", border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: 12, color: "#fff", fontSize: 13,
              }}
              formatter={(value: number, name: string) => [
                `${value} kg CO₂e`,
                name === "bau" ? "Business as Usual" : "Optimized Path",
              ]}
            />
            {/* Shaded savings area between lines */}
            <Area type="monotone" dataKey="bau" stroke="none" fill="url(#savingsGradient)" />
            {/* BAU line — red dashed */}
            <Line
              type="monotone" dataKey="bau" stroke="#ef4444" strokeWidth={2}
              strokeDasharray="6 4" dot={{ fill: "#ef4444", r: 4, strokeWidth: 0 }}
              name="bau"
            />
            {/* Optimized line — green solid */}
            <Line
              type="monotone" dataKey="optimized" stroke="#22c55e" strokeWidth={2.5}
              dot={{ fill: "#22c55e", r: 4, strokeWidth: 0 }}
              name="optimized"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend + annual savings */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-xs text-gray-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5 bg-red-500" style={{ borderTop: "2px dashed #ef4444" }} />
            Business as Usual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5 bg-emerald-500 rounded" />
            Optimized Path
          </span>
        </div>
        <div className="rounded-lg bg-emerald-500/[0.08] border border-emerald-500/15 px-3 py-2">
          <span className="text-xs text-gray-400">Annual savings: </span>
          <span className="text-sm font-heading font-bold text-emerald-400">
            {total_annual_savings_kg.toLocaleString("en-IN")} kg CO₂e
          </span>
        </div>
      </div>
    </div>
  );
}

/* ── Loading skeleton ── */

export function EmissionsTimelineSkeleton() {
  return (
    <div className="glass-card p-6 space-y-4 animate-pulse">
      <div className="h-5 w-52 rounded bg-white/[0.06]" />
      <div className="h-64 rounded-xl bg-white/[0.04]" />
      <div className="flex items-center justify-between">
        <div className="h-4 w-48 rounded bg-white/[0.06]" />
        <div className="h-8 w-36 rounded-lg bg-emerald-500/[0.04]" />
      </div>
    </div>
  );
}
