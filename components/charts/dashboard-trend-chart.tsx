"use client";

import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis
} from "recharts";
import { formatDateLabel } from "@/lib/utils";

export type DailyPoint = {
  date: string;
  kgCo2e: number;
  average: number;
};

export function DashboardTrendChart({ data }: { data: DailyPoint[] }) {
  const average = data[0]?.average ?? 5.67;

  return (
    <div className="h-72 w-full" role="img" aria-label="Last 30 days CO2e trend">
      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={data} margin={{ left: -12, right: 8, top: 16, bottom: 0 }}>
          <defs>
            <linearGradient id="co2Gradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#BA7517" stopOpacity={0.35} />
              <stop offset="48%" stopColor="#BA7517" stopOpacity={0.12} />
              <stop offset="52%" stopColor="#1D9E75" stopOpacity={0.16} />
              <stop offset="100%" stopColor="#1D9E75" stopOpacity={0.04} />
            </linearGradient>
          </defs>
          <CartesianGrid stroke="#D9E8E2" strokeDasharray="3 3" vertical={false} />
          <XAxis
            dataKey="date"
            minTickGap={24}
            tick={{ fill: "#54746C", fontSize: 12 }}
            tickFormatter={formatDateLabel}
            tickLine={false}
          />
          <YAxis
            tick={{ fill: "#54746C", fontSize: 12 }}
            tickLine={false}
            unit=" kg"
            width={48}
          />
          <Tooltip
            content={({ active, payload, label }: any) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="rounded-card border border-line bg-white p-3 text-sm shadow-soft dark:border-white/10 dark:bg-[#10231F]">
                  <p className="font-bold text-ink dark:text-white">
                    {formatDateLabel(label)}
                  </p>
                  <p className="text-primary-dark dark:text-primary-light">
                    {payload[0].value} kgCO2e
                  </p>
                </div>
              );
            }}
          />
          <ReferenceLine
            ifOverflow="extendDomain"
            label={{
              value: "India avg 5.67 kg/day",
              position: "insideTopRight",
              fill: "#BA7517",
              fontSize: 12
            }}
            stroke="#BA7517"
            strokeDasharray="5 5"
            y={average}
          />
          <Area
            dataKey="kgCo2e"
            fill="url(#co2Gradient)"
            fillOpacity={1}
            isAnimationActive
            name="kgCO2e"
            stroke="#1D9E75"
            strokeWidth={3}
            type="monotone"
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
