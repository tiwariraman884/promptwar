"use client";

import type { CarbonAnalysisResult } from "@/types/carbon";

const RISK_COLORS: Record<string, string> = {
  Low: "#22c55e",
  Moderate: "#eab308",
  High: "#f97316",
  Critical: "#ef4444",
};

const CATEGORY_ICONS: Record<string, string> = {
  diet: "🥗",
  travel: "🚗",
  electricity: "⚡",
  shopping: "🛍️",
  waste: "♻️",
};

function scoreColor(score: number): string {
  if (score <= 30) return "#22c55e";
  if (score <= 60) return "#eab308";
  if (score <= 80) return "#f97316";
  return "#ef4444";
}

export function RiskScoreCard({ data }: { data: CarbonAnalysisResult["carbon_risk_score"] }) {
  const { overall, risk_tier, category_breakdown, india_comparison } = data;
  const color = RISK_COLORS[risk_tier] ?? "#22c55e";
  const circumference = 2 * Math.PI * 54;
  const offset = circumference - (overall / 100) * circumference;

  return (
    <div className="glass-card p-6 space-y-6">
      <h3 className="font-heading text-lg font-bold text-white">Carbon Risk Score</h3>

      {/* Circular gauge */}
      <div className="flex flex-col items-center gap-3">
        <div className="relative w-36 h-36">
          <svg viewBox="0 0 120 120" className="w-full h-full -rotate-90">
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8"
              className="stroke-white/[0.06]" />
            <circle cx="60" cy="60" r="54" fill="none" strokeWidth="8"
              stroke={color} strokeLinecap="round"
              strokeDasharray={circumference} strokeDashoffset={offset}
              style={{ transition: "stroke-dashoffset 1.2s cubic-bezier(0.16, 1, 0.3, 1)" }} />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-4xl font-heading font-extrabold text-white">{overall}</span>
            <span className="text-xs font-semibold" style={{ color }}>{risk_tier}</span>
          </div>
        </div>
      </div>

      {/* Category breakdown bars */}
      <div className="space-y-3">
        {(Object.entries(category_breakdown) as [string, number][]).map(([cat, score]) => (
          <div key={cat} className="space-y-1">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-400 flex items-center gap-1.5">
                <span>{CATEGORY_ICONS[cat]}</span>
                <span className="capitalize">{cat}</span>
              </span>
              <span className="text-xs font-bold" style={{ color: scoreColor(score) }}>{score}</span>
            </div>
            <div className="h-2 rounded-full bg-white/[0.06] overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${score}%`, backgroundColor: scoreColor(score) }}
              />
            </div>
          </div>
        ))}
      </div>

      {/* India comparison */}
      <div className="rounded-xl bg-white/[0.04] border border-white/[0.06] p-3">
        <p className="text-sm text-gray-300 leading-relaxed">
          <span className="text-emerald-400 font-semibold">🇮🇳 India Context: </span>
          {india_comparison}
        </p>
      </div>
    </div>
  );
}

/* ── Loading skeleton ── */

export function RiskScoreCardSkeleton() {
  return (
    <div className="glass-card p-6 space-y-6 animate-pulse">
      <div className="h-5 w-40 rounded bg-white/[0.06]" />
      <div className="flex justify-center">
        <div className="w-36 h-36 rounded-full bg-white/[0.06]" />
      </div>
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-1">
            <div className="h-3 w-24 rounded bg-white/[0.06]" />
            <div className="h-2 rounded-full bg-white/[0.06]" />
          </div>
        ))}
      </div>
      <div className="h-12 rounded-xl bg-white/[0.04]" />
    </div>
  );
}
