"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import {
  BarChart3, TrendingUp, Calendar, Target, Brain, Zap,
  ArrowDownRight, ArrowUpRight, Minus, Sparkles, Lightbulb,
  Award, Activity, Shield, Flame,
} from "lucide-react";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { InsightCard } from "@/components/analytics/InsightCard";
import { DateRangePicker } from "@/components/analytics/DateRangePicker";
import { ExportButton } from "@/components/analytics/ExportButton";
import {
  getDailyTrends,
  getWeeklyTrends,
  getForecastTrends,
  getGoalAnalytics,
  getAdvancedInsights,
  exportToCSV,
  type DateRange,
  type EmissionEntry,
} from "@/lib/analytics-engine";
import { demoEntries, demoDailySeries, demoDashboard, demoProfile } from "@/lib/demo-data";
import type { EmissionCategory } from "@/lib/emission-factors";

/* ─── Lazy-load heavy chart components ─── */
const DailyTrendChart = dynamic(
  () => import("@/components/analytics/DailyTrendChart").then(m => m.DailyTrendChart),
  { ssr: false, loading: () => <div className="animate-pulse h-80 rounded-xl bg-neutral-100 dark:bg-neutral-800" /> }
);
const WeeklyBarChart = dynamic(
  () => import("@/components/analytics/WeeklyBarChart").then(m => m.WeeklyBarChart),
  { ssr: false, loading: () => <div className="animate-pulse h-72 rounded-xl bg-neutral-100 dark:bg-neutral-800" /> }
);
const ForecastAreaChart = dynamic(
  () => import("@/components/analytics/ForecastAreaChart").then(m => m.ForecastAreaChart),
  { ssr: false, loading: () => <div className="animate-pulse h-72 rounded-xl bg-neutral-100 dark:bg-neutral-800" /> }
);
const GoalProgressRing = dynamic(
  () => import("@/components/analytics/GoalProgressRing").then(m => m.GoalProgressRing),
  { ssr: false, loading: () => <div className="animate-pulse h-64 rounded-xl bg-neutral-100 dark:bg-neutral-800" /> }
);
const SustainabilityGauge = dynamic(
  () => import("@/components/analytics/SustainabilityGauge").then(m => m.SustainabilityGauge),
  { ssr: false, loading: () => <div className="animate-pulse h-40 rounded-xl bg-neutral-100 dark:bg-neutral-800" /> }
);
const CategoryRadar = dynamic(
  () => import("@/components/analytics/CategoryRadar").then(m => m.CategoryRadar),
  { ssr: false, loading: () => <div className="animate-pulse h-72 rounded-xl bg-neutral-100 dark:bg-neutral-800" /> }
);
const HotspotHeatmap = dynamic(
  () => import("@/components/analytics/HotspotHeatmap").then(m => m.HotspotHeatmap),
  { ssr: false, loading: () => <div className="animate-pulse h-56 rounded-xl bg-neutral-100 dark:bg-neutral-800" /> }
);

/* ─── Trend icon helper ─── */
function TrendIcon({ trend }: { trend: "up" | "down" | "flat" }) {
  if (trend === "down") return <ArrowDownRight size={14} />;
  if (trend === "up") return <ArrowUpRight size={14} />;
  return <Minus size={14} />;
}

/* ─── Category emojis ─── */
const CAT_EMOJI: Record<string, string> = {
  transport: "🚗", energy: "⚡", diet: "🍽️", shopping: "🛍️",
  waste: "♻️", digital: "💻", food_delivery: "🛵", water: "💧",
};

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);

  // Transform demo entries to match EmissionEntry interface
  const entries: EmissionEntry[] = useMemo(() =>
    demoEntries.map(e => ({
      id: e.id,
      entry_date: e.entry_date,
      category: e.category as EmissionCategory,
      sub_type: e.sub_type,
      kg_co2e: e.kg_co2e,
      source: e.source,
    })),
    []
  );

  /* ─── Compute all analytics (memoized) ─── */
  const daily = useMemo(() => getDailyTrends(entries, dateRange), [entries, dateRange]);
  const weekly = useMemo(() => getWeeklyTrends(entries, dateRange), [entries, dateRange]);
  const forecasts = useMemo(() => getForecastTrends(demoDailySeries), []);
  const goals = useMemo(() =>
    getGoalAnalytics(
      { goal_pct: demoProfile.goal_pct, goal_months: demoProfile.goal_months ?? 6, baseline_kg_day: demoProfile.baseline_kg_day },
      entries,
      demoDashboard.streak,
      demoDashboard.longestStreak
    ),
    [entries]
  );
  const insights = useMemo(() => getAdvancedInsights(entries), [entries]);

  // Aggregate category data for radar
  const categoryTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    for (const e of entries) {
      totals[e.category] = (totals[e.category] ?? 0) + e.kg_co2e;
    }
    return totals;
  }, [entries]);

  const currentDailyKg = daily.length > 0 ? daily[daily.length - 1].totalKg : 4.5;

  const handleExportCSV = useCallback(() => {
    const data = daily.map(d => ({
      Date: d.date,
      "Daily Emissions (kg)": d.totalKg,
      "7-Day Avg (kg)": d.rollingAvg,
      "India Avg (kg)": d.indiaAvg,
      "Day-over-Day %": d.deltaPercent,
    }));
    exportToCSV(data, "greenstep-analytics");
  }, [daily]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5] pb-20 md:pb-8">
      {/* ─── Hero Header ─── */}
      <div className="bg-gradient-to-br from-[#2D6A4F] via-[#1B4332] to-[#0B1815] text-white relative overflow-hidden">
        <div className="absolute inset-0 opacity-5">
          <div className="absolute top-10 right-10 w-72 h-72 rounded-full bg-white blur-3xl" />
          <div className="absolute bottom-0 left-20 w-48 h-48 rounded-full bg-[#52B788] blur-3xl" />
        </div>
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-10 relative z-10">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                  <BarChart3 size={24} />
                </div>
                <span className="rounded-full bg-white/10 backdrop-blur-sm px-3 py-1 text-xs font-bold tracking-wide">
                  Enterprise Analytics
                </span>
              </div>
              <h1 className="text-3xl md:text-4xl font-black">Carbon Analytics</h1>
              <p className="mt-2 max-w-2xl text-sm md:text-base leading-relaxed text-white/60">
                Deep insights into your environmental impact — track trends, forecast emissions, achieve goals, and export reports.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <DateRangePicker onRangeChange={setDateRange} />
              <ExportButton onExportCSV={handleExportCSV} />
            </div>
          </div>
        </div>
      </div>

      {/* ─── Tabbed Content ─── */}
      <div className="max-w-7xl mx-auto px-4 md:px-8 -mt-4">
        <Tabs defaultValue="daily">
          <div className="overflow-x-auto hide-scrollbar pb-1">
            <TabsList className="w-full sm:w-auto">
              <TabsTrigger value="daily" className="gap-1.5">
                <TrendingUp size={16} /> Daily
              </TabsTrigger>
              <TabsTrigger value="weekly" className="gap-1.5">
                <Calendar size={16} /> Weekly
              </TabsTrigger>
              <TabsTrigger value="forecast" className="gap-1.5">
                <Sparkles size={16} /> Forecast
              </TabsTrigger>
              <TabsTrigger value="goals" className="gap-1.5">
                <Target size={16} /> Goals
              </TabsTrigger>
              <TabsTrigger value="insights" className="gap-1.5">
                <Brain size={16} /> Insights
              </TabsTrigger>
            </TabsList>
          </div>

          {/* ═══════════ Tab 1: Daily Trends ═══════════ */}
          <TabsContent value="daily">
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <InsightCard
                title="Today"
                value={`${daily.at(-1)?.totalKg.toFixed(1) ?? "–"} kg`}
                icon={<Zap size={20} />}
                trend={daily.at(-1)?.deltaPercent && daily.at(-1)!.deltaPercent < 0 ? "down" : daily.at(-1)?.deltaPercent && daily.at(-1)!.deltaPercent > 0 ? "up" : "flat"}
                trendValue={`${Math.abs(daily.at(-1)?.deltaPercent ?? 0).toFixed(1)}%`}
                sparklineData={daily.slice(-7).map(d => d.totalKg)}
              />
              <InsightCard
                title="7-Day Average"
                value={`${daily.at(-1)?.rollingAvg.toFixed(1) ?? "–"} kg`}
                subtitle="per day"
                icon={<Activity size={20} />}
                sparklineData={daily.slice(-14).map(d => d.rollingAvg)}
              />
              <InsightCard
                title="vs India Average"
                value={`${((1 - currentDailyKg / (daily[0]?.indiaAvg ?? 5.2)) * 100).toFixed(0)}%`}
                subtitle={currentDailyKg < (daily[0]?.indiaAvg ?? 5.2) ? "Below average ✅" : "Above average ⚠️"}
                icon={<Shield size={20} />}
                trend={currentDailyKg < (daily[0]?.indiaAvg ?? 5.2) ? "down" : "up"}
                trendValue="vs avg"
              />
              <InsightCard
                title="Total Period"
                value={`${daily.reduce((s, d) => s + d.totalKg, 0).toFixed(1)} kg`}
                subtitle={`across ${daily.length} days`}
                icon={<BarChart3 size={20} />}
              />
            </div>

            {/* Main chart */}
            <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20 mb-6">
              <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-4">
                Daily Emissions Trend
              </h3>
              <DailyTrendChart data={daily} />
            </div>

            {/* Category breakdown for today */}
            <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
              <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-4">
                Today&apos;s Category Breakdown
              </h3>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
                {Object.entries(daily.at(-1)?.byCategory ?? {}).map(([cat, kg]) => (
                  <div key={cat} className="rounded-xl bg-[#F8FAF5] dark:bg-black/20 p-4 border border-[#52B788]/10 text-center">
                    <span className="text-2xl">{CAT_EMOJI[cat] ?? "📊"}</span>
                    <p className="text-sm font-bold capitalize mt-1">{cat}</p>
                    <p className="text-lg font-black text-[#2D6A4F] dark:text-[#52B788]">{(kg as number).toFixed(1)} kg</p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ═══════════ Tab 2: Weekly Trends ═══════════ */}
          <TabsContent value="weekly">
            {/* Summary cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              <InsightCard
                title="Avg Weekly"
                value={`${weekly.avgWeeklyKg.toFixed(1)} kg`}
                icon={<Calendar size={20} />}
                trend={weekly.trend === "improving" ? "down" : weekly.trend === "worsening" ? "up" : "flat"}
                trendValue={weekly.trend}
              />
              <InsightCard
                title="Total Reduction"
                value={`${weekly.totalReduction.toFixed(1)} kg`}
                subtitle="first → last week"
                icon={<TrendingUp size={20} />}
                trend={weekly.totalReduction > 0 ? "down" : "up"}
                trendValue={`${Math.abs(weekly.totalReduction).toFixed(1)} kg`}
                trendPositive={false}
              />
              <InsightCard
                title="Best Week"
                value={weekly.bestWeek || "–"}
                subtitle="Lowest emissions"
                icon={<Award size={20} />}
              />
              <InsightCard
                title="Performance"
                value={`${weekly.weeks.at(-1)?.performanceScore ?? 0}/100`}
                subtitle="vs India benchmark"
                icon={<Target size={20} />}
                sparklineData={weekly.weeks.map(w => w.performanceScore)}
                trendPositive
              />
            </div>

            {/* Chart grid */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
                <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-4">
                  Week-over-Week Comparison
                </h3>
                <WeeklyBarChart data={weekly.weeks} />
              </div>
              <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
                <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-4">
                  Category Profile vs India
                </h3>
                <CategoryRadar userCategories={categoryTotals} days={daily.length} />
              </div>
            </div>

            {/* Weekly detail cards */}
            <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
              <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-4">
                Weekly Breakdown
              </h3>
              <div className="space-y-3">
                {weekly.weeks.map(w => (
                  <div key={w.weekStart} className="flex items-center gap-4 rounded-xl bg-[#F8FAF5] dark:bg-black/20 p-4 border border-[#52B788]/10">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-bold">{w.weekLabel}</p>
                      <p className="text-xs text-neutral-500">{w.avgDailyKg.toFixed(1)} kg/day avg</p>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-black text-[#2D6A4F] dark:text-[#52B788]">{w.totalKg.toFixed(1)} kg</p>
                      <div className={`inline-flex items-center gap-1 text-xs font-bold rounded-full px-2 py-0.5 ${
                        w.changePercent <= 0
                          ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                          : "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                      }`}>
                        <TrendIcon trend={w.changePercent <= 0 ? "down" : "up"} />
                        {Math.abs(w.changePercent).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>

          {/* ═══════════ Tab 3: Forecast ═══════════ */}
          <TabsContent value="forecast">
            {/* Forecast cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {forecasts.map(f => (
                <InsightCard
                  key={f.period}
                  title={f.label}
                  value={`${f.projectedKg.toFixed(1)} kg`}
                  subtitle={`${f.confidenceMin.toFixed(0)}–${f.confidenceMax.toFixed(0)} kg range`}
                  icon={<Sparkles size={20} />}
                  trend={f.trend}
                  trendValue={`${Math.abs(f.vsCurrentPercent).toFixed(1)}% vs current`}
                />
              ))}
            </div>

            {/* Forecast chart */}
            <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20 mb-6">
              <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-4">
                Emissions Forecast with Confidence Bands
              </h3>
              <ForecastAreaChart data={forecasts} currentDailyKg={currentDailyKg} />
            </div>

            {/* Risk alerts */}
            <div className="grid md:grid-cols-2 gap-6">
              <div className="rounded-3xl bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] p-6 text-white">
                <div className="flex items-center gap-2 mb-3">
                  <Sparkles size={20} className="text-[#52B788]" />
                  <h3 className="text-lg font-bold">Predicted Savings</h3>
                </div>
                <p className="text-3xl font-black mb-2">
                  {forecasts.length > 0 && forecasts[3]
                    ? `${Math.max(0, (currentDailyKg * 365 - forecasts[3].projectedKg)).toFixed(0)} kg`
                    : "–"}
                </p>
                <p className="text-sm text-white/60">potential annual savings if current trend continues</p>
              </div>

              <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
                <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-3">
                  Risk Alerts
                </h3>
                <div className="space-y-3">
                  {forecasts.filter(f => f.trend === "up").length > 0 ? (
                    forecasts.filter(f => f.trend === "up").map(f => (
                      <div key={f.period} className="flex items-center gap-3 rounded-xl bg-amber-50 dark:bg-amber-900/10 p-3 border border-amber-200 dark:border-amber-800/30">
                        <span className="text-amber-500">⚠️</span>
                        <p className="text-sm font-semibold text-amber-800 dark:text-amber-300">
                          {f.label}: Emissions trending up by {Math.abs(f.vsCurrentPercent).toFixed(1)}%
                        </p>
                      </div>
                    ))
                  ) : (
                    <div className="flex items-center gap-3 rounded-xl bg-emerald-50 dark:bg-emerald-900/10 p-3 border border-emerald-200 dark:border-emerald-800/30">
                      <span>✅</span>
                      <p className="text-sm font-semibold text-emerald-800 dark:text-emerald-300">
                        All clear — your emissions are stable or declining.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </TabsContent>

          {/* ═══════════ Tab 4: Goals ═══════════ */}
          <TabsContent value="goals">
            <div className="grid lg:grid-cols-3 gap-6 mb-6">
              <InsightCard
                title="Goal Progress"
                value={`${goals.progressPct.toFixed(0)}%`}
                subtitle={`${goals.currentPct.toFixed(1)}% of ${goals.goalPct}% target achieved`}
                icon={<Target size={20} />}
                trend={goals.progressPct >= 50 ? "up" : "flat"}
                trendValue={goals.progressPct >= 75 ? "On track" : goals.progressPct >= 25 ? "Keep going" : "Needs effort"}
                trendPositive
              />
              <InsightCard
                title="Daily Budget"
                value={`${goals.dailyBudgetKg.toFixed(1)} kg`}
                subtitle="to stay on target"
                icon={<Flame size={20} />}
              />
              <InsightCard
                title="Days Remaining"
                value={goals.daysRemaining}
                subtitle={`${goals.milestonesReached}/${goals.totalMilestones} milestones`}
                icon={<Calendar size={20} />}
              />
            </div>

            <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-8 shadow-sm border border-[#52B788]/20">
              <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-6">
                Goal Achievement Dashboard
              </h3>
              <GoalProgressRing
                progressPct={goals.progressPct}
                goalPct={goals.goalPct}
                currentPct={goals.currentPct}
                streak={goals.streak}
                longestStreak={goals.longestStreak}
                milestones={goals.milestones}
                predictedCompletion={goals.predictedCompletion}
                successProbability={goals.successProbability}
                difficultyScore={goals.difficultyScore}
              />
            </div>
          </TabsContent>

          {/* ═══════════ Tab 5: Insights ═══════════ */}
          <TabsContent value="insights">
            {/* Score gauges */}
            <div className="grid md:grid-cols-2 gap-6 mb-6">
              <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
                <SustainabilityGauge
                  score={insights.carbonReductionScore}
                  label="Carbon Reduction Score"
                  sublabel="Based on daily emissions vs India average"
                />
              </div>
              <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
                <SustainabilityGauge
                  score={insights.sustainabilityScore}
                  label="Sustainability Score"
                  sublabel="Reduction + consistency + category diversity"
                />
              </div>
            </div>

            {/* Behavioral segment */}
            <div className="rounded-3xl bg-gradient-to-br from-[#2D6A4F] to-[#1B4332] p-6 text-white mb-6 relative overflow-hidden">
              <div className="absolute top-0 right-0 p-8 opacity-10 pointer-events-none">
                <Brain size={120} />
              </div>
              <div className="relative z-10">
                <span className="text-xs font-bold uppercase tracking-wider text-white/50">Your Segment</span>
                <h3 className="text-2xl font-black mt-1 mb-2">{insights.behavioralSegment}</h3>
                <p className="text-sm text-white/70 max-w-xl">{insights.segmentDescription}</p>
                <div className="flex items-center gap-4 mt-4">
                  <div className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-bold">
                    Weekday: {insights.weekdayVsWeekend.weekday.toFixed(1)} kg/day
                  </div>
                  <div className="rounded-full bg-white/10 backdrop-blur-sm px-4 py-2 text-sm font-bold">
                    Weekend: {insights.weekdayVsWeekend.weekend.toFixed(1)} kg/day
                  </div>
                  <div className={`rounded-full px-4 py-2 text-sm font-bold ${
                    insights.weekdayVsWeekend.diff <= 0
                      ? "bg-emerald-500/20 text-emerald-200"
                      : "bg-rose-500/20 text-rose-200"
                  }`}>
                    {insights.weekdayVsWeekend.diff > 0 ? "+" : ""}{insights.weekdayVsWeekend.diff.toFixed(1)} kg diff
                  </div>
                </div>
              </div>
            </div>

            {/* Grid: Top activities + Heatmap */}
            <div className="grid lg:grid-cols-2 gap-6 mb-6">
              <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
                <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-4 flex items-center gap-2">
                  <Activity size={18} /> Top Impact Activities
                </h3>
                <div className="space-y-3">
                  {insights.topImpactActivities.map((act, i) => (
                    <div key={act.activity} className="flex items-center gap-3">
                      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#52B788]/10 text-sm font-black text-[#2D6A4F] dark:text-[#52B788]">
                        {i + 1}
                      </span>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold capitalize truncate">{act.activity}</p>
                        <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 mt-1">
                          <div
                            className="h-full rounded-full bg-gradient-to-r from-[#52B788] to-[#2D6A4F]"
                            style={{ width: `${Math.min(act.pct, 100)}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm font-black text-[#2D6A4F] dark:text-[#52B788] shrink-0">
                        {act.kgTotal.toFixed(1)} kg
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
                <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-4 flex items-center gap-2">
                  <BarChart3 size={18} /> Emission Hotspots
                </h3>
                <HotspotHeatmap data={insights.emissionHotspots} />
              </div>
            </div>

            {/* Recommendations */}
            <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
              <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-4 flex items-center gap-2">
                <Lightbulb size={18} /> Action Recommendations
              </h3>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {insights.recommendations.map(rec => (
                  <div
                    key={rec.title}
                    className="rounded-2xl bg-[#F8FAF5] dark:bg-black/20 p-5 border border-[#52B788]/10 hover:border-[#52B788]/30 transition-all"
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h4 className="text-sm font-bold">{rec.title}</h4>
                      <span className={`shrink-0 text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                        rec.effort === "Easy" ? "bg-emerald-100 text-emerald-800" :
                        rec.effort === "Medium" ? "bg-amber-100 text-amber-800" :
                        "bg-rose-100 text-rose-800"
                      }`}>{rec.effort}</span>
                    </div>
                    <p className="text-xs text-neutral-500 dark:text-neutral-400 mb-3">{rec.description}</p>
                    <p className="text-sm font-black text-[#2D6A4F] dark:text-[#52B788]">
                      Save ~{rec.potentialSavingKg} kg CO₂/month
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
