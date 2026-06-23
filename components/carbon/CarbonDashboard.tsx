"use client";

import { useState } from "react";
import {
  BarChart, Bar, LineChart, Line, Area,
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";
import * as Collapsible from "@radix-ui/react-collapsible";
import { motion } from "framer-motion";

/* ═══════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════ */

interface CarbonAnalysisResult {
  carbon_risk_score: {
    overall: number;
    risk_tier: "Low" | "Moderate" | "High" | "Critical";
    category_breakdown: {
      diet: number; travel: number; electricity: number; shopping: number; waste: number;
    };
    india_comparison: string;
  };
  monthly_forecast: {
    month_1_kg: number; month_2_kg: number; month_3_kg: number;
    trend: "Improving" | "Stable" | "Worsening";
    seasonal_note: string;
  };
  reduction_roadmap: Array<{
    rank: number; action_title: string;
    estimated_monthly_reduction_kg: number;
    effort_level: "Easy" | "Medium" | "Hard";
    india_tip: string;
  }>;
  predicted_emissions_timeline: {
    business_as_usual: number[];
    optimized_path: number[];
    total_annual_savings_kg: number;
  };
}

/* ═══════════════════════════════════════════════════════════════
   CONSTANTS
   ═══════════════════════════════════════════════════════════════ */

const TIER_COLORS: Record<string, string> = {
  Low: "#22c55e", Moderate: "#eab308", High: "#f97316", Critical: "#ef4444",
};

const TIER_BG: Record<string, string> = {
  Low: "bg-emerald-500/15 text-emerald-400 border-emerald-500/25",
  Moderate: "bg-yellow-500/15 text-yellow-400 border-yellow-500/25",
  High: "bg-orange-500/15 text-orange-400 border-orange-500/25",
  Critical: "bg-red-500/15 text-red-400 border-red-500/25",
};

const TREND_CONFIG: Record<string, { icon: string; cls: string }> = {
  Improving: { icon: "↓", cls: "bg-emerald-500/12 text-emerald-400 border-emerald-500/20" },
  Stable:    { icon: "→", cls: "bg-yellow-500/12 text-yellow-400 border-yellow-500/20" },
  Worsening: { icon: "↑", cls: "bg-red-500/12 text-red-400 border-red-500/20" },
};

const EFFORT: Record<string, string> = {
  Easy:   "bg-emerald-500/12 text-emerald-400 border-emerald-500/20",
  Medium: "bg-amber-500/12 text-amber-400 border-amber-500/20",
  Hard:   "bg-rose-500/12 text-rose-400 border-rose-500/20",
};

const CATEGORY_META: Record<string, { icon: string; label: string }> = {
  diet:        { icon: "🥗", label: "Diet" },
  travel:      { icon: "🚗", label: "Travel" },
  electricity: { icon: "⚡", label: "Electricity" },
  shopping:    { icon: "🛍️", label: "Shopping" },
  waste:       { icon: "♻️", label: "Waste" },
};

const CHART_TOOLTIP_STYLE = {
  background: "rgba(15, 23, 42, 0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 12,
  color: "#e2e8f0",
  fontSize: 13,
  boxShadow: "0 8px 32px rgba(0,0,0,0.4)",
};

function scoreColor(s: number) {
  if (s <= 30) return "#22c55e";
  if (s <= 60) return "#eab308";
  if (s <= 80) return "#f97316";
  return "#ef4444";
}

/* ═══════════════════════════════════════════════════════════════
   CARD SHELL — reusable glass card wrapper
   ═══════════════════════════════════════════════════════════════ */

function DashCard({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`rounded-2xl border border-white/[0.06] bg-slate-900/60 backdrop-blur-xl p-6 ${className}`}>
      {children}
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 font-heading text-base font-bold text-white mb-5">
      <span className="text-lg">{icon}</span> {children}
    </h3>
  );
}

/* ═══════════════════════════════════════════════════════════════
   1. RISK SCORE CARD
   ═══════════════════════════════════════════════════════════════ */

function RiskScoreSection({ data }: { data: CarbonAnalysisResult["carbon_risk_score"] }) {
  const { overall, risk_tier, category_breakdown, india_comparison } = data;
  const color = TIER_COLORS[risk_tier];
  const pct = overall / 100;

  // conic-gradient: filled portion + empty portion
  const gradient = `conic-gradient(${color} ${pct * 360}deg, rgba(255,255,255,0.06) ${pct * 360}deg)`;

  return (
    <DashCard>
      <SectionTitle icon="🎯">Carbon Risk Score</SectionTitle>

      {/* Circular gauge */}
      <div className="flex flex-col items-center gap-4 mb-6">
        <div className="relative w-40 h-40">
          {/* Outer ring with conic-gradient */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              background: gradient,
              mask: "radial-gradient(farthest-side, transparent calc(100% - 10px), #fff calc(100% - 10px))",
              WebkitMask: "radial-gradient(farthest-side, transparent calc(100% - 10px), #fff calc(100% - 10px))",
            }}
          />
          {/* Inner content */}
          <div className="absolute inset-3 rounded-full bg-slate-900/80 flex flex-col items-center justify-center">
            <span className="text-5xl font-heading font-extrabold text-white leading-none">{overall}</span>
            <span
              className={`mt-1.5 inline-flex items-center rounded-full border px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider ${TIER_BG[risk_tier]}`}
            >
              {risk_tier}
            </span>
          </div>
        </div>
      </div>

      {/* Category breakdown bars */}
      <div className="space-y-3 mb-5">
        {(Object.entries(category_breakdown) as [string, number][]).map(([cat, score]) => {
          const meta = CATEGORY_META[cat];
          const c = scoreColor(score);
          return (
            <div key={cat} className="space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs text-slate-400">
                  <span>{meta.icon}</span>
                  <span>{meta.label}</span>
                </span>
                <span className="text-xs font-bold tabular-nums" style={{ color: c }}>{score}</span>
              </div>
              <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-1000 ease-out"
                  style={{ width: `${Math.min(score, 100)}%`, backgroundColor: c }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* India comparison */}
      <div className="rounded-xl bg-emerald-500/[0.05] border border-emerald-500/10 p-3">
        <p className="text-xs text-slate-300 leading-relaxed">
          <span className="font-semibold text-emerald-400">🇮🇳 </span>
          {india_comparison}
        </p>
      </div>
    </DashCard>
  );
}

/* ═══════════════════════════════════════════════════════════════
   2. MONTHLY FORECAST CARD
   ═══════════════════════════════════════════════════════════════ */

function ForecastSection({ data }: { data: CarbonAnalysisResult["monthly_forecast"] }) {
  const { month_1_kg, month_2_kg, month_3_kg, trend, seasonal_note } = data;
  const tc = TREND_CONFIG[trend];

  const barColor = trend === "Improving" ? "#22c55e" : trend === "Stable" ? "#eab308" : "#ef4444";

  const chartData = [
    { name: "Month 1", kg: Math.round(month_1_kg) },
    { name: "Month 2", kg: Math.round(month_2_kg) },
    { name: "Month 3", kg: Math.round(month_3_kg) },
  ];

  return (
    <DashCard className="flex flex-col">
      <div className="flex items-center justify-between mb-5">
        <SectionTitle icon="📊">Monthly Forecast</SectionTitle>
        <span className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-1 text-[11px] font-bold ${tc.cls}`}>
          {tc.icon} {trend}
        </span>
      </div>

      <div className="flex-1 min-h-[200px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData} barCategoryGap="30%">
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis
              dataKey="name"
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false} tickLine={false}
            />
            <YAxis
              tick={{ fill: "#94a3b8", fontSize: 11 }}
              axisLine={false} tickLine={false}
              tickFormatter={(v) => `${v}`}
            />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value: number) => [`${value} kg CO₂e`, "Emissions"]}
              cursor={{ fill: "rgba(255,255,255,0.03)" }}
            />
            <Bar dataKey="kg" radius={[6, 6, 0, 0]} maxBarSize={44}>
              {chartData.map((_, i) => (
                <Cell key={i} fill={barColor} fillOpacity={0.8} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Seasonal note */}
      <div className="mt-4 flex items-start gap-2 rounded-xl bg-sky-500/[0.05] border border-sky-500/10 p-3">
        <span className="text-sky-400 text-xs leading-none mt-0.5">ℹ️</span>
        <p className="text-xs text-slate-300 leading-relaxed">{seasonal_note}</p>
      </div>
    </DashCard>
  );
}

/* ═══════════════════════════════════════════════════════════════
   3. REDUCTION ROADMAP CARD
   ═══════════════════════════════════════════════════════════════ */

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.1 } } };
const fadeUp = {
  hidden: { opacity: 0, y: 20, scale: 0.97 },
  visible: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

function RoadmapSection({ data }: { data: CarbonAnalysisResult["reduction_roadmap"] }) {
  const totalSavings = data.reduce((s, a) => s + a.estimated_monthly_reduction_kg, 0);

  return (
    <DashCard>
      <SectionTitle icon="🗺️">Reduction Roadmap</SectionTitle>

      <motion.div className="space-y-2.5" variants={stagger} initial="hidden" animate="visible">
        {data.map((action) => (
          <RoadmapItem key={action.rank} action={action} />
        ))}
      </motion.div>

      {/* Total savings */}
      <div className="mt-4 flex items-center justify-between rounded-xl bg-emerald-500/[0.06] border border-emerald-500/12 p-3.5">
        <span className="text-xs font-semibold text-emerald-400">Total Monthly Savings</span>
        <span className="text-sm font-heading font-extrabold text-emerald-400">
          −{totalSavings} kg CO₂e
        </span>
      </div>
    </DashCard>
  );
}

function RoadmapItem({ action }: { action: CarbonAnalysisResult["reduction_roadmap"][number] }) {
  const [open, setOpen] = useState(false);

  return (
    <motion.div variants={fadeUp}>
      <Collapsible.Root open={open} onOpenChange={setOpen}>
        <div className="rounded-xl bg-white/[0.02] border border-white/[0.05] overflow-hidden transition-colors hover:border-white/[0.1]">
          <Collapsible.Trigger asChild>
            <button className="w-full p-3.5 text-left flex items-start gap-3 cursor-pointer" id={`roadmap-${action.rank}`}>
              {/* Rank badge */}
              <div className="flex-shrink-0 w-7 h-7 rounded-full bg-green-700/30 flex items-center justify-center">
                <span className="text-[11px] font-bold text-emerald-400">{action.rank}</span>
              </div>

              <div className="flex-1 min-w-0 space-y-1.5">
                <div className="flex items-start justify-between gap-2">
                  <h4 className="text-[13px] font-semibold text-white leading-snug pr-1">{action.action_title}</h4>
                  <span className={`flex-shrink-0 inline-flex items-center rounded-full border px-2 py-0.5 text-[9px] font-bold uppercase tracking-wide ${EFFORT[action.effort_level]}`}>
                    {action.effort_level}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="inline-flex items-center rounded-md bg-emerald-500/10 px-1.5 py-0.5 text-[10px] font-bold text-emerald-400">
                    −{action.estimated_monthly_reduction_kg} kg/mo
                  </span>
                  <span className="text-[10px] text-slate-500">
                    {open ? "▲ Hide tip" : "▼ India tip"}
                  </span>
                </div>
              </div>
            </button>
          </Collapsible.Trigger>

          <Collapsible.Content className="overflow-hidden data-[state=open]:animate-slideDown data-[state=closed]:animate-slideUp">
            <div className="px-3.5 pb-3.5 pt-0 pl-[52px]">
              <div className="rounded-lg bg-amber-500/[0.05] border border-amber-500/10 p-2.5">
                <p className="text-[11px] text-amber-200/80 leading-relaxed">
                  <span className="font-semibold text-amber-400">🇮🇳 India Tip: </span>
                  {action.india_tip}
                </p>
              </div>
            </div>
          </Collapsible.Content>
        </div>
      </Collapsible.Root>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   4. EMISSIONS TIMELINE CARD
   ═══════════════════════════════════════════════════════════════ */

function TimelineSection({ data }: { data: CarbonAnalysisResult["predicted_emissions_timeline"] }) {
  const { business_as_usual, optimized_path, total_annual_savings_kg } = data;

  const chartData = Array.from({ length: Math.max(business_as_usual.length, 6) }, (_, i) => ({
    name: `M${i + 1}`,
    bau: Math.round(business_as_usual[i] ?? 0),
    opt: Math.round(optimized_path[i] ?? 0),
  }));

  return (
    <DashCard className="flex flex-col">
      <SectionTitle icon="📈">Emissions Timeline</SectionTitle>

      <div className="flex-1 min-h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <defs>
              <linearGradient id="cdb-gap-fill" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#22c55e" stopOpacity={0.12} />
                <stop offset="100%" stopColor="#22c55e" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" />
            <XAxis dataKey="name" tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fill: "#94a3b8", fontSize: 11 }} axisLine={false} tickLine={false} />
            <Tooltip
              contentStyle={CHART_TOOLTIP_STYLE}
              formatter={(value: number, name: string) => [
                `${value} kg CO₂e`,
                name === "bau" ? "Business as Usual" : "Optimized Path",
              ]}
            />
            {/* Shaded savings area */}
            <Area type="monotone" dataKey="bau" stroke="none" fill="url(#cdb-gap-fill)" />
            {/* BAU — red dashed */}
            <Line
              type="monotone" dataKey="bau" name="bau"
              stroke="#ef4444" strokeWidth={2} strokeDasharray="6 4"
              dot={{ fill: "#ef4444", r: 3, strokeWidth: 0 }}
            />
            {/* Optimized — green solid */}
            <Line
              type="monotone" dataKey="opt" name="opt"
              stroke="#22c55e" strokeWidth={2.5}
              dot={{ fill: "#22c55e", r: 3, strokeWidth: 0 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Legend + savings */}
      <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-4 text-[11px] text-slate-400">
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 border-t-2 border-dashed border-red-500" />
            Business as Usual
          </span>
          <span className="flex items-center gap-1.5">
            <span className="inline-block w-4 h-0.5 rounded bg-emerald-500" />
            Optimized Path
          </span>
        </div>
        <div className="rounded-lg bg-emerald-500/[0.07] border border-emerald-500/15 px-3 py-2">
          <span className="text-[10px] text-slate-400">Annual savings </span>
          <span className="text-sm font-heading font-bold text-emerald-400">
            {total_annual_savings_kg.toLocaleString("en-IN")} kg
          </span>
        </div>
      </div>
    </DashCard>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MAIN DASHBOARD COMPONENT
   ═══════════════════════════════════════════════════════════════ */

export function CarbonDashboard({ result }: { result: CarbonAnalysisResult }) {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Top row */}
      <RiskScoreSection data={result.carbon_risk_score} />
      <ForecastSection data={result.monthly_forecast} />

      {/* Bottom row */}
      <RoadmapSection data={result.reduction_roadmap} />
      <TimelineSection data={result.predicted_emissions_timeline} />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   SKELETON LOADER
   ═══════════════════════════════════════════════════════════════ */

function SkeletonPulse({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-white/[0.04] ${className}`} />;
}

function SkeletonCard({ children }: { children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-white/[0.06] bg-slate-900/60 backdrop-blur-xl p-6">
      {children}
    </div>
  );
}

export function CarbonDashboardSkeleton() {
  return (
    <div className="grid gap-5 lg:grid-cols-2">
      {/* Risk Score skeleton */}
      <SkeletonCard>
        <SkeletonPulse className="h-4 w-36 mb-6" />
        <div className="flex justify-center mb-6">
          <div className="w-40 h-40 rounded-full bg-white/[0.04] animate-pulse" />
        </div>
        <div className="space-y-3 mb-5">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="space-y-1">
              <div className="flex justify-between">
                <SkeletonPulse className="h-3 w-20" />
                <SkeletonPulse className="h-3 w-6" />
              </div>
              <SkeletonPulse className="h-1.5 w-full" />
            </div>
          ))}
        </div>
        <SkeletonPulse className="h-10 w-full rounded-xl" />
      </SkeletonCard>

      {/* Forecast skeleton */}
      <SkeletonCard>
        <div className="flex justify-between mb-6">
          <SkeletonPulse className="h-4 w-40" />
          <SkeletonPulse className="h-6 w-24 rounded-full" />
        </div>
        <SkeletonPulse className="h-[200px] w-full rounded-xl mb-4" />
        <SkeletonPulse className="h-10 w-full rounded-xl" />
      </SkeletonCard>

      {/* Roadmap skeleton */}
      <SkeletonCard>
        <SkeletonPulse className="h-4 w-44 mb-5" />
        <div className="space-y-2.5">
          {Array.from({ length: 5 }).map((_, i) => (
            <SkeletonPulse key={i} className="h-[68px] w-full rounded-xl" />
          ))}
        </div>
        <SkeletonPulse className="mt-4 h-12 w-full rounded-xl" />
      </SkeletonCard>

      {/* Timeline skeleton */}
      <SkeletonCard>
        <SkeletonPulse className="h-4 w-44 mb-5" />
        <SkeletonPulse className="h-[220px] w-full rounded-xl mb-4" />
        <div className="flex justify-between">
          <SkeletonPulse className="h-4 w-48" />
          <SkeletonPulse className="h-8 w-36 rounded-lg" />
        </div>
      </SkeletonCard>
    </div>
  );
}
