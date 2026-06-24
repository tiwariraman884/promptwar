import { describe, it, expect } from "vitest";
import {
  getDailyTrends,
  getWeeklyTrends,
  getForecastTrends,
  getGoalAnalytics,
  getAdvancedInsights,
  exportToCSV,
  type EmissionEntry,
} from "@/lib/analytics-engine";

/**
 * Tests for analytics-engine.ts — the enterprise analytics computation hub.
 * Tests cover daily trends, weekly trends, forecast, goal analytics, insights, and CSV export.
 */

function makeEntry(overrides: Partial<EmissionEntry> & Pick<EmissionEntry, "entry_date">): EmissionEntry {
  return {
    id: `e-${Math.random().toString(36).slice(2, 8)}`,
    category: "transport",
    sub_type: "car",
    kg_co2e: 3.5,
    ...overrides,
  };
}

// Generate 30 days of entries
function generateEntries(days: number): EmissionEntry[] {
  const entries: EmissionEntry[] = [];
  const categories: EmissionEntry["category"][] = ["transport", "energy", "diet", "shopping", "waste"];
  const today = new Date();
  for (let i = 0; i < days; i++) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateStr = date.toISOString().slice(0, 10);
    // Add 2-3 entries per day
    const numEntries = 2 + (i % 2);
    for (let j = 0; j < numEntries; j++) {
      entries.push(makeEntry({
        entry_date: dateStr,
        category: categories[j % categories.length],
        kg_co2e: 2 + Math.sin(i) * 1.5,
      }));
    }
  }
  return entries;
}

const SAMPLE_ENTRIES = generateEntries(30);

describe("getDailyTrends", () => {
  it("returns an array of daily trend points", () => {
    const trends = getDailyTrends(SAMPLE_ENTRIES);
    expect(Array.isArray(trends)).toBe(true);
    expect(trends.length).toBeGreaterThan(0);
  });

  it("each point has required fields", () => {
    const trends = getDailyTrends(SAMPLE_ENTRIES);
    for (const point of trends) {
      expect(point.date).toBeDefined();
      expect(typeof point.totalKg).toBe("number");
      expect(typeof point.rollingAvg).toBe("number");
      expect(typeof point.indiaAvg).toBe("number");
      expect(point.byCategory).toBeDefined();
    }
  });

  it("respects date range filter", () => {
    const today = new Date();
    const weekAgo = new Date(today);
    weekAgo.setDate(today.getDate() - 7);
    const range = {
      start: weekAgo.toISOString().slice(0, 10),
      end: today.toISOString().slice(0, 10),
    };
    const trends = getDailyTrends(SAMPLE_ENTRIES, range);
    expect(trends.length).toBeLessThanOrEqual(8); // 7 days + possible boundary
  });

  it("returns empty array for empty entries", () => {
    const trends = getDailyTrends([]);
    expect(trends).toEqual([]);
  });
});

describe("getWeeklyTrends", () => {
  it("returns a WeeklySummary object", () => {
    const summary = getWeeklyTrends(SAMPLE_ENTRIES);
    expect(summary.weeks).toBeDefined();
    expect(Array.isArray(summary.weeks)).toBe(true);
    expect(typeof summary.avgWeeklyKg).toBe("number");
    expect(["improving", "stable", "worsening"]).toContain(summary.trend);
  });

  it("includes bestWeek and worstWeek", () => {
    const summary = getWeeklyTrends(SAMPLE_ENTRIES);
    expect(summary.bestWeek).toBeDefined();
    expect(summary.worstWeek).toBeDefined();
  });

  it("each week has performance score between 0 and 100", () => {
    const summary = getWeeklyTrends(SAMPLE_ENTRIES);
    for (const week of summary.weeks) {
      expect(week.performanceScore).toBeGreaterThanOrEqual(0);
      expect(week.performanceScore).toBeLessThanOrEqual(100);
    }
  });
});

describe("getForecastTrends", () => {
  it("returns forecast trend array", () => {
    const series = SAMPLE_ENTRIES.map(e => ({
      date: e.entry_date,
      kgCo2e: e.kg_co2e,
    }));
    const forecasts = getForecastTrends(series);
    expect(Array.isArray(forecasts)).toBe(true);
    expect(forecasts.length).toBeGreaterThan(0);
  });

  it("each forecast has confidence interval", () => {
    const series = SAMPLE_ENTRIES.map(e => ({
      date: e.entry_date,
      kgCo2e: e.kg_co2e,
    }));
    const forecasts = getForecastTrends(series);
    for (const f of forecasts) {
      expect(f.confidenceMin).toBeLessThanOrEqual(f.projectedKg);
      expect(f.confidenceMax).toBeGreaterThanOrEqual(f.projectedKg);
    }
  });

  it("returns empty array for insufficient data", () => {
    const forecasts = getForecastTrends([]);
    expect(forecasts).toEqual([]);
  });
});

describe("getGoalAnalytics", () => {
  it("returns goal analytics with progress", () => {
    const goal = getGoalAnalytics(
      SAMPLE_ENTRIES,
      100, // target 100 kg reduction
      new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10), // deadline: 30 days
      7  // streak
    );
    expect(typeof goal.goalPct).toBe("number");
    expect(typeof goal.progressPct).toBe("number");
    expect(typeof goal.dailyBudgetKg).toBe("number");
    expect(goal.milestones).toBeDefined();
    expect(Array.isArray(goal.milestones)).toBe(true);
  });

  it("successProbability is between 0 and 100", () => {
    const goal = getGoalAnalytics(SAMPLE_ENTRIES, 100, "2025-12-31", 5);
    expect(goal.successProbability).toBeGreaterThanOrEqual(0);
    expect(goal.successProbability).toBeLessThanOrEqual(100);
  });

  it("difficultyScore is between 1 and 5", () => {
    const goal = getGoalAnalytics(SAMPLE_ENTRIES, 100, "2025-12-31", 5);
    expect(goal.difficultyScore).toBeGreaterThanOrEqual(1);
    expect(goal.difficultyScore).toBeLessThanOrEqual(5);
  });
});

describe("getAdvancedInsights", () => {
  it("returns advanced insights object", () => {
    const insights = getAdvancedInsights(SAMPLE_ENTRIES);
    expect(typeof insights.carbonReductionScore).toBe("number");
    expect(typeof insights.sustainabilityScore).toBe("number");
    expect(insights.behavioralSegment).toBeDefined();
    expect(insights.recommendations).toBeDefined();
  });

  it("scores are between 0 and 100", () => {
    const insights = getAdvancedInsights(SAMPLE_ENTRIES);
    expect(insights.carbonReductionScore).toBeGreaterThanOrEqual(0);
    expect(insights.carbonReductionScore).toBeLessThanOrEqual(100);
    expect(insights.sustainabilityScore).toBeGreaterThanOrEqual(0);
    expect(insights.sustainabilityScore).toBeLessThanOrEqual(100);
  });

  it("includes top impact activities", () => {
    const insights = getAdvancedInsights(SAMPLE_ENTRIES);
    expect(insights.topImpactActivities.length).toBeGreaterThan(0);
    for (const activity of insights.topImpactActivities) {
      expect(activity.kgTotal).toBeGreaterThanOrEqual(0);
      expect(activity.pct).toBeGreaterThanOrEqual(0);
    }
  });

  it("provides weekday vs weekend comparison", () => {
    const insights = getAdvancedInsights(SAMPLE_ENTRIES);
    expect(typeof insights.weekdayVsWeekend.weekday).toBe("number");
    expect(typeof insights.weekdayVsWeekend.weekend).toBe("number");
  });

  it("returns valid result for empty entries", () => {
    const insights = getAdvancedInsights([]);
    expect(insights.carbonReductionScore).toBeGreaterThanOrEqual(0);
    expect(insights.behavioralSegment).toBeDefined();
  });
});

describe("exportToCSV", () => {
  it("returns a string with CSV headers", () => {
    const csv = exportToCSV(SAMPLE_ENTRIES);
    expect(typeof csv).toBe("string");
    expect(csv).toContain("Date");
    expect(csv).toContain("Category");
    expect(csv).toContain("CO2e");
  });

  it("includes data rows", () => {
    const csv = exportToCSV(SAMPLE_ENTRIES);
    const lines = csv.trim().split("\n");
    expect(lines.length).toBeGreaterThan(1); // header + data
  });

  it("returns header-only for empty entries", () => {
    const csv = exportToCSV([]);
    const lines = csv.trim().split("\n");
    expect(lines.length).toBe(1); // just header
  });
});
