"use client";

import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis,
  CartesianGrid, Tooltip,
} from "recharts";
import type { ForecastTrend } from "@/lib/analytics-engine";

interface ForecastAreaChartProps {
  data: ForecastTrend[];
  currentDailyKg: number;
}

export function ForecastAreaChart({ data, currentDailyKg }: ForecastAreaChartProps) {
  const chartData = data.map(f => ({
    period: f.label.split(" ")[1] ?? f.label,
    projected: f.projectedKg,
    min: f.confidenceMin,
    max: f.confidenceMax,
    current: (() => {
      switch (f.period) {
        case "7_day": return Math.round(currentDailyKg * 7 * 100) / 100;
        case "30_day": return Math.round(currentDailyKg * 30 * 100) / 100;
        case "next_quarter": return Math.round(currentDailyKg * 90 * 100) / 100;
        case "annual": return Math.round(currentDailyKg * 365 * 100) / 100;
        default: return Math.round(currentDailyKg * 30 * 100) / 100;
      }
    })(),
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="forecastGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#52B788" stopOpacity={0.2} />
            <stop offset="95%" stopColor="#52B788" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="confidenceGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.08} />
            <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52B78815" />
        <XAxis
          dataKey="period"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#999" }}
        />
        <YAxis
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#999" }}
          unit=" kg"
        />
        <Tooltip
          contentStyle={{
            borderRadius: "12px",
            border: "1px solid #52B78830",
            boxShadow: "0 8px 32px rgba(0,0,0,0.1)",
            fontSize: "12px",
            fontWeight: 600,
          }}
          formatter={(val: number, name: string) => [
            `${val.toFixed(1)} kg`,
            name === "projected" ? "Forecast" : name === "current" ? "If Unchanged" : name,
          ]}
        />
        <Area type="monotone" dataKey="max" stackId="confidence" fill="url(#confidenceGrad)" stroke="none" name="Upper Bound" />
        <Area type="monotone" dataKey="min" stackId="confidence" fill="transparent" stroke="#2D6A4F" strokeWidth={1} strokeDasharray="4 4" name="Lower Bound" />
        <Area type="monotone" dataKey="projected" fill="url(#forecastGrad)" stroke="#52B788" strokeWidth={2.5} name="Forecast" />
        <Area type="monotone" dataKey="current" fill="none" stroke="#94A3B8" strokeWidth={1.5} strokeDasharray="6 3" name="If Unchanged" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
