"use client";

import {
  ResponsiveContainer, BarChart, Bar, XAxis, YAxis,
  CartesianGrid, Tooltip, Legend, Cell,
} from "recharts";
import type { WeeklyTrendPoint } from "@/lib/analytics-engine";

const COLORS = {
  current: "#2D6A4F",
  previous: "#B7E4C7",
};

interface WeeklyBarChartProps {
  data: WeeklyTrendPoint[];
}

export function WeeklyBarChart({ data }: WeeklyBarChartProps) {
  const chartData = data.map(w => ({
    week: w.weekLabel.split(" – ")[0],
    current: w.totalKg,
    previous: w.prevWeekKg,
    change: w.changePercent,
  }));

  return (
    <ResponsiveContainer width="100%" height={300}>
      <BarChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }} barGap={4}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52B78815" />
        <XAxis
          dataKey="week"
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
            name === "current" ? "This Week" : "Previous Week",
          ]}
        />
        <Legend
          iconType="square"
          iconSize={10}
          wrapperStyle={{ fontSize: "12px", fontWeight: 600 }}
        />
        <Bar dataKey="previous" name="Previous Week" radius={[6, 6, 0, 0]} maxBarSize={28}>
          {chartData.map((_, i) => (
            <Cell key={i} fill={COLORS.previous} />
          ))}
        </Bar>
        <Bar dataKey="current" name="This Week" radius={[6, 6, 0, 0]} maxBarSize={28}>
          {chartData.map((entry, i) => (
            <Cell key={i} fill={entry.change <= 0 ? COLORS.current : "#EF4444"} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}
