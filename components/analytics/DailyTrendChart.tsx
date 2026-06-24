"use client";

import {
  ResponsiveContainer, ComposedChart, Line, Area, XAxis, YAxis,
  CartesianGrid, Tooltip, ReferenceLine, Legend,
} from "recharts";
import type { DailyTrendPoint } from "@/lib/analytics-engine";

interface DailyTrendChartProps {
  data: DailyTrendPoint[];
}

export function DailyTrendChart({ data }: DailyTrendChartProps) {
  const chartData = data.map(d => ({
    date: d.date.slice(5), // MM-DD
    emissions: d.totalKg,
    rolling: d.rollingAvg,
    indiaAvg: d.indiaAvg,
  }));

  return (
    <ResponsiveContainer width="100%" height={320}>
      <ComposedChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
        <defs>
          <linearGradient id="emissionGrad" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#2D6A4F" stopOpacity={0.15} />
            <stop offset="95%" stopColor="#2D6A4F" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52B78815" />
        <XAxis
          dataKey="date"
          axisLine={false}
          tickLine={false}
          tick={{ fontSize: 11, fill: "#999" }}
          interval="preserveStartEnd"
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
            name === "emissions" ? "Daily" : name === "rolling" ? "7-day Avg" : "India Avg",
          ]}
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", fontWeight: 600 }}
        />
        <Area
          type="monotone"
          dataKey="emissions"
          fill="url(#emissionGrad)"
          stroke="#2D6A4F"
          strokeWidth={2.5}
          dot={false}
          name="Daily Emissions"
        />
        <Line
          type="monotone"
          dataKey="rolling"
          stroke="#52B788"
          strokeWidth={2}
          strokeDasharray="6 3"
          dot={false}
          name="7-Day Average"
        />
        <ReferenceLine
          y={data[0]?.indiaAvg ?? 5.2}
          stroke="#EF4444"
          strokeDasharray="4 4"
          strokeWidth={1.5}
          label={{
            value: "India Avg",
            position: "insideTopRight",
            fill: "#EF4444",
            fontSize: 10,
            fontWeight: 700,
          }}
        />
      </ComposedChart>
    </ResponsiveContainer>
  );
}
