/**
 * Analytics Engine — Enterprise-grade computation hub
 *
 * Pure functions that transform raw emission entries + profile data
 * into analytics-ready structures for daily/weekly/forecast/goal/insight views.
 *
 * Zero side effects, zero API calls — fully testable and cacheable.
 */

import { INDIA_DAILY_AVERAGE_KG, type EmissionCategory } from "@/lib/emission-factors";
import type { ForecastPoint } from "@/lib/types/carbon-twin-types";

/* ═══════════════════════════════════════════════════════════════════
   TYPES
   ═══════════════════════════════════════════════════════════════════ */

export interface EmissionEntry {
  id: string;
  entry_date: string;
  category: EmissionCategory;
  sub_type: string;
  kg_co2e: number;
  source?: string;
}

export interface DateRange {
  start: string; // ISO date
  end: string;
}

export interface DailyTrendPoint {
  date: string;
  totalKg: number;
  rollingAvg: number;
  indiaAvg: number;
  deltaPercent: number; // vs previous day
  byCategory: Record<string, number>;
}

export interface WeeklyTrendPoint {
  weekLabel: string;
  weekStart: string;
  totalKg: number;
  avgDailyKg: number;
  prevWeekKg: number;
  changePercent: number;
  byCategory: Record<string, number>;
  performanceScore: number; // 0–100
}

export interface WeeklySummary {
  weeks: WeeklyTrendPoint[];
  totalReduction: number;
  bestWeek: string;
  worstWeek: string;
  avgWeeklyKg: number;
  trend: "improving" | "stable" | "worsening";
}

export interface ForecastTrend {
  period: ForecastPoint["period"] | "7_day" | "30_day" | "annual";
  label: string;
  projectedKg: number;
  confidenceMin: number;
  confidenceMax: number;
  trend: "up" | "down" | "flat";
  vsCurrentPercent: number;
}

export interface GoalAnalytics {
  goalPct: number;
  currentPct: number;
  progressPct: number;
  daysRemaining: number;
  streak: number;
  longestStreak: number;
  milestonesReached: number;
  totalMilestones: number;
  milestones: { label: string; reached: boolean; value: number }[];
  predictedCompletion: string; // ISO date or "Not on track"
  difficultyScore: number; // 1–5
  successProbability: number; // 0–100
  dailyBudgetKg: number;
}

export interface AdvancedInsights {
  carbonReductionScore: number; // 0–100
  sustainabilityScore: number; // 0–100
  topImpactActivities: { activity: string; category: string; kgTotal: number; pct: number }[];
  emissionHotspots: { dayOfWeek: string; category: string; intensity: number }[];
  behavioralSegment: string;
  segmentDescription: string;
  recommendations: { title: string; description: string; potentialSavingKg: number; effort: "Easy" | "Medium" | "Hard" }[];
  weekdayVsWeekend: { weekday: number; weekend: number; diff: number };
}

/* ═══════════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════════ */

function filterByRange(entries: EmissionEntry[], range?: DateRange): EmissionEntry[] {
  if (!range) return entries;
  return entries.filter(e => e.entry_date >= range.start && e.entry_date <= range.end);
}

function groupByDate(entries: EmissionEntry[]): Map<string, EmissionEntry[]> {
  const map = new Map<string, EmissionEntry[]>();
  for (const e of entries) {
    const group = map.get(e.entry_date) ?? [];
    group.push(e);
    map.set(e.entry_date, group);
  }
  return map;
}

function groupByWeek(entries: EmissionEntry[]): Map<string, EmissionEntry[]> {
  const map = new Map<string, EmissionEntry[]>();
  for (const e of entries) {
    const d = new Date(e.entry_date);
    const dayOfWeek = d.getDay();
    const weekStart = new Date(d);
    weekStart.setDate(d.getDate() - dayOfWeek);
    const key = weekStart.toISOString().slice(0, 10);
    const group = map.get(key) ?? [];
    group.push(e);
    map.set(key, group);
  }
  return map;
}

function categorySum(entries: EmissionEntry[]): Record<string, number> {
  const result: Record<string, number> = {};
  for (const e of entries) {
    result[e.category] = (result[e.category] ?? 0) + e.kg_co2e;
  }
  return result;
}

function round(n: number, decimals = 2): number {
  const f = Math.pow(10, decimals);
  return Math.round(n * f) / f;
}

const DAY_NAMES = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

/* ═══════════════════════════════════════════════════════════════════
   1. DAILY TRENDS
   ═══════════════════════════════════════════════════════════════════ */

export function getDailyTrends(entries: EmissionEntry[], range?: DateRange): DailyTrendPoint[] {
  const filtered = filterByRange(entries, range);
  const byDate = groupByDate(filtered);
  const dates = [...byDate.keys()].sort();

  const result: DailyTrendPoint[] = [];
  let prevTotal = 0;

  for (let i = 0; i < dates.length; i++) {
    const date = dates[i];
    const dayEntries = byDate.get(date) ?? [];
    const totalKg = round(dayEntries.reduce((s, e) => s + e.kg_co2e, 0));

    // Rolling 7-day average
    const windowStart = Math.max(0, i - 6);
    let windowSum = 0;
    for (let j = windowStart; j <= i; j++) {
      const dEntries = byDate.get(dates[j]) ?? [];
      windowSum += dEntries.reduce((s, e) => s + e.kg_co2e, 0);
    }
    const rollingAvg = round(windowSum / (i - windowStart + 1));

    const deltaPercent = i === 0 ? 0 : round(((totalKg - prevTotal) / Math.max(prevTotal, 0.01)) * 100, 1);

    result.push({
      date,
      totalKg,
      rollingAvg,
      indiaAvg: INDIA_DAILY_AVERAGE_KG,
      deltaPercent,
      byCategory: categorySum(dayEntries),
    });

    prevTotal = totalKg;
  }

  return result;
}

/* ═══════════════════════════════════════════════════════════════════
   2. WEEKLY TRENDS
   ═══════════════════════════════════════════════════════════════════ */

export function getWeeklyTrends(entries: EmissionEntry[], range?: DateRange): WeeklySummary {
  const filtered = filterByRange(entries, range);
  const byWeek = groupByWeek(filtered);
  const weekStarts = [...byWeek.keys()].sort();

  const weeks: WeeklyTrendPoint[] = [];
  let prevWeekKg = 0;

  for (let i = 0; i < weekStarts.length; i++) {
    const weekStart = weekStarts[i];
    const weekEntries = byWeek.get(weekStart) ?? [];
    const totalKg = round(weekEntries.reduce((s, e) => s + e.kg_co2e, 0));
    const daysInWeek = new Set(weekEntries.map(e => e.entry_date)).size || 1;
    const avgDailyKg = round(totalKg / daysInWeek);

    const changePercent = i === 0 ? 0 : round(((totalKg - prevWeekKg) / Math.max(prevWeekKg, 0.01)) * 100, 1);

    // Performance score: 100 if below India avg, scales down above
    const weeklyIndiaAvg = INDIA_DAILY_AVERAGE_KG * 7;
    const ratio = totalKg / weeklyIndiaAvg;
    const performanceScore = Math.max(0, Math.min(100, Math.round((1 - (ratio - 0.5)) * 100)));

    const ws = new Date(weekStart);
    const weekEnd = new Date(ws);
    weekEnd.setDate(ws.getDate() + 6);
    const weekLabel = `${ws.toLocaleDateString("en-IN", { month: "short", day: "numeric" })} – ${weekEnd.toLocaleDateString("en-IN", { month: "short", day: "numeric" })}`;

    weeks.push({
      weekLabel,
      weekStart,
      totalKg,
      avgDailyKg,
      prevWeekKg: i === 0 ? totalKg : prevWeekKg,
      changePercent,
      byCategory: categorySum(weekEntries),
      performanceScore,
    });

    prevWeekKg = totalKg;
  }

  const totals = weeks.map(w => w.totalKg);
  const avgWeeklyKg = round(totals.reduce((a, b) => a + b, 0) / Math.max(weeks.length, 1));

  let bestWeek = "";
  let worstWeek = "";
  if (weeks.length > 0) {
    bestWeek = weeks.reduce((a, b) => a.totalKg < b.totalKg ? a : b).weekLabel;
    worstWeek = weeks.reduce((a, b) => a.totalKg > b.totalKg ? a : b).weekLabel;
  }

  // Overall trend: compare first half avg vs second half avg
  let trend: "improving" | "stable" | "worsening" = "stable";
  if (weeks.length >= 2) {
    const mid = Math.floor(weeks.length / 2);
    const firstHalf = totals.slice(0, mid).reduce((a, b) => a + b, 0) / mid;
    const secondHalf = totals.slice(mid).reduce((a, b) => a + b, 0) / (totals.length - mid);
    if (secondHalf < firstHalf * 0.95) trend = "improving";
    else if (secondHalf > firstHalf * 1.05) trend = "worsening";
  }

  const totalReduction = weeks.length >= 2 ? round(weeks[0].totalKg - weeks[weeks.length - 1].totalKg) : 0;

  return { weeks, totalReduction, bestWeek, worstWeek, avgWeeklyKg, trend };
}

/* ═══════════════════════════════════════════════════════════════════
   3. FORECAST TRENDS
   ═══════════════════════════════════════════════════════════════════ */

export function getForecastTrends(dailySeries: { date: string; kgCo2e: number }[]): ForecastTrend[] {
  if (dailySeries.length < 7) return [];

  const sorted = [...dailySeries].sort((a, b) => a.date.localeCompare(b.date));
  const n = sorted.length;
  const y = sorted.map(s => s.kgCo2e);

  // Linear regression
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;
  for (let i = 0; i < n; i++) {
    sumX += i; sumY += y[i]; sumXY += i * y[i]; sumX2 += i * i;
  }
  const denom = n * sumX2 - sumX * sumX;
  const slope = denom !== 0 ? (n * sumXY - sumX * sumY) / denom : 0;
  const intercept = (sumY - slope * sumX) / n;

  const predict = (stepsAhead: number): number =>
    Math.max(0, round(intercept + slope * (n - 1 + stepsAhead)));

  // Confidence: ±1.645 × stddev of last 7 values (90% CI)
  const last7 = y.slice(-7);
  const mean7 = last7.reduce((a, b) => a + b, 0) / last7.length;
  const stdDev = Math.sqrt(last7.reduce((a, v) => a + Math.pow(v - mean7, 2), 0) / last7.length);
  const ci = stdDev * 1.645;

  const currentAvg = round(y.slice(-7).reduce((a, b) => a + b, 0) / 7);

  const makeForecast = (
    period: ForecastTrend["period"],
    label: string,
    days: number
  ): ForecastTrend => {
    let projectedKg = 0;
    for (let d = 1; d <= days; d++) {
      projectedKg += predict(d);
    }
    projectedKg = round(projectedKg);
    const currentProjection = round(currentAvg * days);
    const vsCurrentPercent = round(((projectedKg - currentProjection) / Math.max(currentProjection, 0.01)) * 100, 1);

    return {
      period,
      label,
      projectedKg,
      confidenceMin: round(Math.max(0, projectedKg - ci * Math.sqrt(days))),
      confidenceMax: round(projectedKg + ci * Math.sqrt(days)),
      trend: projectedKg > currentProjection * 1.02 ? "up" : projectedKg < currentProjection * 0.98 ? "down" : "flat",
      vsCurrentPercent,
    };
  };

  return [
    makeForecast("7_day", "Next 7 Days", 7),
    makeForecast("30_day", "Next 30 Days", 30),
    makeForecast("next_quarter", "Next Quarter", 90),
    makeForecast("annual", "Annual Projection", 365),
  ];
}

/* ═══════════════════════════════════════════════════════════════════
   4. GOAL ANALYTICS
   ═══════════════════════════════════════════════════════════════════ */

export function getGoalAnalytics(
  profile: { goal_pct: number; goal_months: number; baseline_kg_day: number },
  entries: EmissionEntry[],
  currentStreak: number,
  longestStreak: number
): GoalAnalytics {
  const goalPct = profile.goal_pct;
  const targetDailyKg = profile.baseline_kg_day * (1 - goalPct / 100);
  const totalDays = profile.goal_months * 30;

  const sorted = [...entries].sort((a, b) => a.entry_date.localeCompare(b.entry_date));
  const daysLogged = new Set(sorted.map(e => e.entry_date)).size;
  const totalKg = sorted.reduce((s, e) => s + e.kg_co2e, 0);
  const avgDailyKg = daysLogged > 0 ? totalKg / daysLogged : profile.baseline_kg_day;

  const reductionAchieved = ((profile.baseline_kg_day - avgDailyKg) / profile.baseline_kg_day) * 100;
  const progressPct = Math.min(100, Math.max(0, round((reductionAchieved / goalPct) * 100)));
  const daysRemaining = Math.max(0, totalDays - daysLogged);

  // Milestones
  const milestones = [
    { label: "First Week", value: 7, reached: daysLogged >= 7 },
    { label: "25% Goal", value: 25, reached: progressPct >= 25 },
    { label: "50% Goal", value: 50, reached: progressPct >= 50 },
    { label: "75% Goal", value: 75, reached: progressPct >= 75 },
    { label: "Goal Complete", value: 100, reached: progressPct >= 100 },
    { label: "30-Day Streak", value: 30, reached: longestStreak >= 30 },
  ];

  // Success prediction
  const dailyReductionRate = daysLogged > 7 ? reductionAchieved / daysLogged : 0;
  const projectedDaysToGoal = dailyReductionRate > 0 ? goalPct / dailyReductionRate : Infinity;
  const predictedCompletion = projectedDaysToGoal <= totalDays && projectedDaysToGoal < 365
    ? (() => {
        const d = new Date();
        d.setDate(d.getDate() + Math.ceil(projectedDaysToGoal - daysLogged));
        return d.toISOString().slice(0, 10);
      })()
    : "Not on track";

  // Difficulty: 1 (easy) to 5 (very hard)
  const difficultyScore = Math.min(5, Math.max(1, Math.ceil(goalPct / 10)));

  // Success probability
  const onTrackRatio = progressPct / Math.max(1, (daysLogged / totalDays) * 100);
  const successProbability = Math.min(100, Math.max(0, round(onTrackRatio * 60 + currentStreak * 2)));

  return {
    goalPct,
    currentPct: round(reductionAchieved, 1),
    progressPct,
    daysRemaining,
    streak: currentStreak,
    longestStreak,
    milestonesReached: milestones.filter(m => m.reached).length,
    totalMilestones: milestones.length,
    milestones,
    predictedCompletion,
    difficultyScore,
    successProbability,
    dailyBudgetKg: round(targetDailyKg),
  };
}

/* ═══════════════════════════════════════════════════════════════════
   5. ADVANCED INSIGHTS
   ═══════════════════════════════════════════════════════════════════ */

export function getAdvancedInsights(entries: EmissionEntry[]): AdvancedInsights {
  const totalKg = entries.reduce((s, e) => s + e.kg_co2e, 0);
  const daysLogged = new Set(entries.map(e => e.entry_date)).size || 1;
  const avgDailyKg = totalKg / daysLogged;

  // Carbon Reduction Score: how much below India average
  const reductionRatio = 1 - (avgDailyKg / INDIA_DAILY_AVERAGE_KG);
  const carbonReductionScore = Math.max(0, Math.min(100, round(50 + reductionRatio * 50)));

  // Sustainability Score: composite of reduction + consistency + diversity
  const categories = new Set(entries.map(e => e.category));
  const diversityBonus = Math.min(20, categories.size * 4);
  const consistencyBonus = Math.min(20, (daysLogged / 30) * 20);
  const sustainabilityScore = Math.max(0, Math.min(100, round(carbonReductionScore * 0.6 + diversityBonus + consistencyBonus)));

  // Top impact activities
  const bySub: Record<string, { category: string; kg: number }> = {};
  for (const e of entries) {
    const key = e.sub_type;
    if (!bySub[key]) bySub[key] = { category: e.category, kg: 0 };
    bySub[key].kg += e.kg_co2e;
  }
  const topImpactActivities = Object.entries(bySub)
    .map(([activity, { category, kg }]) => ({
      activity: activity.replace(/_/g, " "),
      category,
      kgTotal: round(kg),
      pct: round((kg / Math.max(totalKg, 0.01)) * 100, 1),
    }))
    .sort((a, b) => b.kgTotal - a.kgTotal)
    .slice(0, 5);

  // Emission hotspots: day-of-week × category intensity
  const hotspotMap: Record<string, Record<string, number>> = {};
  for (const e of entries) {
    const day = DAY_NAMES[new Date(e.entry_date).getDay()];
    if (!hotspotMap[day]) hotspotMap[day] = {};
    hotspotMap[day][e.category] = (hotspotMap[day][e.category] ?? 0) + e.kg_co2e;
  }
  const emissionHotspots: AdvancedInsights["emissionHotspots"] = [];
  const allCats = [...new Set(entries.map(e => e.category))];
  for (const day of DAY_NAMES) {
    for (const cat of allCats) {
      emissionHotspots.push({
        dayOfWeek: day,
        category: cat,
        intensity: round(hotspotMap[day]?.[cat] ?? 0),
      });
    }
  }

  // Weekday vs weekend
  const weekdayEntries = entries.filter(e => {
    const d = new Date(e.entry_date).getDay();
    return d >= 1 && d <= 5;
  });
  const weekendEntries = entries.filter(e => {
    const d = new Date(e.entry_date).getDay();
    return d === 0 || d === 6;
  });
  const weekdayDays = new Set(weekdayEntries.map(e => e.entry_date)).size || 1;
  const weekendDays = new Set(weekendEntries.map(e => e.entry_date)).size || 1;
  const weekdayAvg = round(weekdayEntries.reduce((s, e) => s + e.kg_co2e, 0) / weekdayDays);
  const weekendAvg = round(weekendEntries.reduce((s, e) => s + e.kg_co2e, 0) / weekendDays);

  // Behavioral segmentation
  let behavioralSegment: string;
  let segmentDescription: string;
  if (avgDailyKg < INDIA_DAILY_AVERAGE_KG * 0.6) {
    behavioralSegment = "Eco Champion";
    segmentDescription = "You're significantly below the national average. Your habits are a model for sustainable living.";
  } else if (avgDailyKg < INDIA_DAILY_AVERAGE_KG * 0.85) {
    behavioralSegment = "Green Warrior";
    segmentDescription = "You're well below average with room for targeted improvements in your top emission categories.";
  } else if (avgDailyKg < INDIA_DAILY_AVERAGE_KG * 1.1) {
    behavioralSegment = "Conscious Consumer";
    segmentDescription = "You're near the national average. Small habit changes can push you into the green zone.";
  } else {
    behavioralSegment = "Growth Potential";
    segmentDescription = "You're above the national average, but every journey starts somewhere. Focus on your top category for quick wins.";
  }

  // Recommendations
  const topCat = topImpactActivities[0]?.category ?? "transport";
  const recommendations: AdvancedInsights["recommendations"] = [
    {
      title: `Reduce ${topCat} emissions by 20%`,
      description: `Your top emission source is ${topCat}. Reducing it by 20% would save ${round(topImpactActivities[0]?.kgTotal * 0.2 ?? 5)} kg.`,
      potentialSavingKg: round(topImpactActivities[0]?.kgTotal * 0.2 ?? 5),
      effort: "Medium",
    },
    {
      title: "Log emissions on weekends too",
      description: weekendDays < 4 ? "You have gaps on weekends. Consistent tracking helps identify patterns." : "Great weekend tracking! Keep it up.",
      potentialSavingKg: 2,
      effort: "Easy",
    },
    {
      title: "Try one zero-emission day per week",
      description: "Walk, cycle, and eat local for one day. It builds habits and saves ~5 kg/week.",
      potentialSavingKg: 20,
      effort: "Medium",
    },
    {
      title: "Switch to LED and 5-star appliances",
      description: "Energy-efficient upgrades save 15–30% on electricity emissions with no lifestyle change.",
      potentialSavingKg: 8,
      effort: "Easy",
    },
    {
      title: "Start composting wet waste",
      description: "Composting diverts 25% of household waste from landfills, saving ~3 kg CO₂/month.",
      potentialSavingKg: 3,
      effort: "Medium",
    },
  ];

  return {
    carbonReductionScore,
    sustainabilityScore,
    topImpactActivities,
    emissionHotspots,
    behavioralSegment,
    segmentDescription,
    recommendations,
    weekdayVsWeekend: { weekday: weekdayAvg, weekend: weekendAvg, diff: round(weekendAvg - weekdayAvg) },
  };
}

/* ═══════════════════════════════════════════════════════════════════
   6. CSV EXPORT
   ═══════════════════════════════════════════════════════════════════ */

export function exportToCSV(
  data: Record<string, string | number>[],
  filename: string
): void {
  if (typeof window === "undefined" || data.length === 0) return;

  const headers = Object.keys(data[0]);
  const rows = data.map(row =>
    headers.map(h => {
      const val = row[h];
      if (typeof val === "string" && val.includes(",")) return `"${val}"`;
      return String(val);
    }).join(",")
  );

  const csv = [headers.join(","), ...rows].join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `${filename}.csv`;
  link.click();
  URL.revokeObjectURL(url);
}
