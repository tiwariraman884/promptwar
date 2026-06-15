"use client";

import { useState } from "react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatDateLabel } from "@/lib/utils";

export type DailyPoint = {
  date: string;
  kgCo2e: number;
  average: number;
};

/* ── Custom animated dot for the latest data point ── */
function PulseDot(props: any) {
  const { cx, cy, index, dataLength } = props;
  if (index !== dataLength - 1 || !cx || !cy) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r="8" fill="#00E676" opacity="0.15">
        <animate attributeName="r" values="6;14;6" dur="2s" repeatCount="indefinite" />
        <animate attributeName="opacity" values="0.3;0.05;0.3" dur="2s" repeatCount="indefinite" />
      </circle>
      <circle cx={cx} cy={cy} r="5" fill="#0B1815" stroke="#00E676" strokeWidth="2.5" />
      <circle cx={cx} cy={cy} r="2" fill="#00E676" />
    </g>
  );
}

/* ── Custom active dot on hover ── */
function ActiveDot(props: any) {
  const { cx, cy } = props;
  if (!cx || !cy) return null;
  return (
    <g>
      <circle cx={cx} cy={cy} r="12" fill="#52B788" opacity="0.12" />
      <circle cx={cx} cy={cy} r="6" fill="#0B1815" stroke="#52B788" strokeWidth="2" />
      <circle cx={cx} cy={cy} r="2.5" fill="#52B788" />
    </g>
  );
}

/* ── Enhanced tooltip ── */
function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  const value = payload[0].value;
  const avg = payload[0].payload.average ?? 5.67;
  const delta = value - avg;
  const isGood = delta <= 0;

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0d2b1e]/95 backdrop-blur-xl px-4 py-3.5 shadow-2xl shadow-black/30 min-w-[180px]">
      <div className="flex items-center justify-between gap-4 mb-2">
        <p className="text-[11px] font-bold uppercase tracking-wider text-white/50">
          {formatDateLabel(label)}
        </p>
        <span className={`inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-bold ${
          isGood
            ? "bg-emerald-500/15 text-emerald-400"
            : "bg-amber-500/15 text-amber-400"
        }`}>
          {isGood ? "↓" : "↑"} {Math.abs(delta).toFixed(1)} kg
        </span>
      </div>
      <p className="text-2xl font-black text-white tabular-nums">
        {value.toFixed(1)} <span className="text-sm font-bold text-white/60">kg CO₂e</span>
      </p>
      {/* Mini bar comparing to average */}
      <div className="mt-2.5 space-y-1">
        <div className="flex items-center justify-between text-[10px] text-white/60">
          <span>vs India avg</span>
          <span className="font-bold text-white/60">{avg} kg/day</span>
        </div>
        <div className="h-1.5 w-full rounded-full bg-white/10 overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isGood ? "bg-gradient-to-r from-emerald-500 to-emerald-400" : "bg-gradient-to-r from-amber-500 to-amber-400"
            }`}
            style={{ width: `${Math.min((value / (avg * 1.5)) * 100, 100)}%` }}
          />
        </div>
      </div>
    </div>
  );
}

export function DashboardTrendChart({ data }: { data: DailyPoint[] }) {
  const average = data[0]?.average ?? 5.67;
  const maxVal = Math.max(...data.map((d) => d.kgCo2e), average);
  const [hovering, setHovering] = useState(false);

  return (
    <div
      className="relative h-80 w-full"
      role="img"
      aria-label="Last 30 days CO2e trend"
      onMouseEnter={() => setHovering(true)}
      onMouseLeave={() => setHovering(false)}
    >
      {/* Subtle glow behind chart */}
      <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-[#52B788]/5 to-transparent rounded-b-2xl pointer-events-none" />

      <ResponsiveContainer height="100%" width="100%">
        <AreaChart data={data} margin={{ left: -8, right: 12, top: 20, bottom: 4 }}>
          <defs>
            {/* Enhanced gradient with a more vivid green-to-transparent fill */}
            <linearGradient id="co2GradientEnhanced" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#52B788" stopOpacity={0.35} />
              <stop offset="40%" stopColor="#52B788" stopOpacity={0.15} />
              <stop offset="70%" stopColor="#2D6A4F" stopOpacity={0.08} />
              <stop offset="100%" stopColor="#1B4332" stopOpacity={0.02} />
            </linearGradient>

            {/* Above-average zone gradient (amber warning) */}
            <linearGradient id="aboveAvgGradient" x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor="#F59E0B" stopOpacity={0.2} />
              <stop offset="50%" stopColor="#F59E0B" stopOpacity={0.06} />
              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.0} />
            </linearGradient>

            {/* Stroke glow filter */}
            <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          <CartesianGrid
            stroke="currentColor"
            strokeDasharray="3 6"
            vertical={false}
            className="text-[#2D6A4F]/15 dark:text-white/[0.06]"
          />

          <XAxis
            dataKey="date"
            minTickGap={32}
            tick={{ fill: "currentColor", fontSize: 11, fontWeight: 600 }}
            tickFormatter={formatDateLabel}
            tickLine={false}
            axisLine={false}
            className="text-[#6B7C6E] dark:text-white/60"
            dy={8}
          />
          <YAxis
            tick={{ fill: "currentColor", fontSize: 11, fontWeight: 600 }}
            tickLine={false}
            axisLine={false}
            unit=" kg"
            width={50}
            className="text-[#6B7C6E] dark:text-white/60"
            domain={[0, Math.ceil(maxVal + 1)]}
          />

          <Tooltip
            content={<ChartTooltip />}
            cursor={{
              stroke: "#52B788",
              strokeWidth: 1,
              strokeDasharray: "4 4",
              opacity: 0.4,
            }}
          />

          {/* Reference line — India average */}
          <ReferenceLine
            ifOverflow="extendDomain"
            label={{
              value: `India avg ${average} kg/day`,
              position: "insideTopRight",
              fill: "#F59E0B",
              fontSize: 11,
              fontWeight: 700,
              offset: 8,
            }}
            stroke="#F59E0B"
            strokeDasharray="6 4"
            strokeWidth={1.5}
            strokeOpacity={0.6}
            y={average}
          />

          {/* Main area */}
          <Area
            dataKey="kgCo2e"
            fill="url(#co2GradientEnhanced)"
            fillOpacity={1}
            isAnimationActive
            animationDuration={1200}
            animationEasing="ease-out"
            name="kgCO₂e"
            stroke="#52B788"
            strokeWidth={hovering ? 3 : 2.5}
            type="monotone"
            filter={hovering ? "url(#glow)" : undefined}
            dot={(props: any) => (
              <PulseDot {...props} dataLength={data.length} />
            )}
            activeDot={<ActiveDot />}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
