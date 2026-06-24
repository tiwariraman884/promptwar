"use client";

import { TrendingDown, TrendingUp, Minus } from "lucide-react";
import type { ReactNode } from "react";

interface InsightCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: ReactNode;
  trend?: "up" | "down" | "flat";
  trendValue?: string;
  trendPositive?: boolean; // true = up is good (e.g., score), false = down is good (e.g., emissions)
  sparklineData?: number[];
  className?: string;
}

function MiniSparkline({ data }: { data: number[] }) {
  if (data.length < 2) return null;
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const w = 80;
  const h = 28;
  const points = data
    .map((v, i) => `${(i / (data.length - 1)) * w},${h - ((v - min) / range) * h}`)
    .join(" ");

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className="w-20 h-7 opacity-60" preserveAspectRatio="none">
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function InsightCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  trendValue,
  trendPositive = false,
  sparklineData,
  className = "",
}: InsightCardProps) {
  const isGoodTrend = trendPositive ? trend === "up" : trend === "down";
  const isBadTrend = trendPositive ? trend === "down" : trend === "up";

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-[#1A2F2A] p-5 shadow-sm border border-[#52B788]/20 hover:shadow-md hover:border-[#52B788]/40 transition-all duration-300 ${className}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 dark:text-neutral-400 mb-1.5">
            {title}
          </p>
          <p className="text-2xl font-black text-[#1B4332] dark:text-white truncate">
            {value}
          </p>
          {subtitle && (
            <p className="text-xs font-semibold text-neutral-400 dark:text-neutral-500 mt-1">
              {subtitle}
            </p>
          )}
        </div>
        {icon && (
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#52B788]/10 text-[#2D6A4F] dark:text-[#52B788]">
            {icon}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between mt-3 pt-3 border-t border-neutral-100 dark:border-neutral-800">
        {trend && trendValue && (
          <div
            className={`flex items-center gap-1 text-xs font-bold rounded-full px-2.5 py-1 ${
              isGoodTrend
                ? "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400"
                : isBadTrend
                  ? "bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-400"
                  : "bg-neutral-100 text-neutral-600 dark:bg-neutral-800 dark:text-neutral-400"
            }`}
          >
            {trend === "up" && <TrendingUp size={12} />}
            {trend === "down" && <TrendingDown size={12} />}
            {trend === "flat" && <Minus size={12} />}
            {trendValue}
          </div>
        )}
        {sparklineData && sparklineData.length > 1 && (
          <div className="text-[#52B788]">
            <MiniSparkline data={sparklineData} />
          </div>
        )}
      </div>
    </div>
  );
}
