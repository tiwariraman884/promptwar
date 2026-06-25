"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
import LazySection from "@/components/LazySection";
import { useSettings } from "@/lib/settings-context";
import {
  ArrowDownRight,
  ArrowUpRight,
  Calculator,
  CarFront,
  Coins,
  Flame,
  Leaf,
  Plus,
  RefreshCw,
  Utensils,
  Zap,
  ShoppingBag,
  Recycle,
  Wifi,
  AlertCircle
} from "lucide-react";
import type { DailyPoint } from "@/components/charts/dashboard-trend-chart";
import { MotionPage } from "@/components/motion-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { demoDashboard } from "@/lib/demo-data";
import { CATEGORY_LABELS, type EmissionCategory } from "@/lib/emission-factors";
import { formatKg, getGreeting } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

// Fix #14 — Dynamic import for chart (heavy recharts dependency)
const DashboardTrendChart = dynamic(
  () => import("@/components/charts/dashboard-trend-chart").then((mod) => mod.DashboardTrendChart),
  { ssr: false, loading: () => <Skeleton className="h-80" /> }
);

type DashboardData = typeof demoDashboard;

const quickCategories: Array<{
  category: EmissionCategory;
  icon: LucideIcon;
}> = [
  { category: "transport", icon: CarFront },
  { category: "energy", icon: Zap },
  { category: "diet", icon: Utensils },
  { category: "shopping", icon: ShoppingBag },
  { category: "waste", icon: Recycle },
  { category: "digital", icon: Wifi }
];

/* ─── Carbon Score (0–100, higher = greener) ─── */
function computeCarbonScore(monthlyKg: number): number {
  return Math.max(0, Math.round(100 - (monthlyKg / 200) * 100));
}

/* ─── Risk Level ─── */
type RiskTier = "LOW" | "MEDIUM" | "HIGH";
function computeRiskLevel(monthlyKg: number): { tier: RiskTier; icon: string; color: string } {
  if (monthlyKg < 100) return { tier: "LOW", icon: "✅", color: "text-green-600 dark:text-green-400" };
  if (monthlyKg <= 250) return { tier: "MEDIUM", icon: "⚠️", color: "text-yellow-600 dark:text-yellow-400" };
  return { tier: "HIGH", icon: "🔴", color: "text-red-600 dark:text-red-400" };
}

/* ─── Simple linear regression for forecast ─── */
function forecastNextMonth(dailySeries: DailyPoint[]): number | null {
  if (dailySeries.length < 21) return null; // ~3 weeks minimum
  const n = dailySeries.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumXX = 0;
  for (let i = 0; i < n; i++) {
    sumX += i;
    sumY += dailySeries[i].kgCo2e;
    sumXY += i * dailySeries[i].kgCo2e;
    sumXX += i * i;
  }
  const slope = (n * sumXY - sumX * sumY) / (n * sumXX - sumX * sumX);
  const intercept = (sumY - slope * sumX) / n;
  // Project next 30 days total
  let total = 0;
  for (let d = n; d < n + 30; d++) {
    total += Math.max(0, intercept + slope * d);
  }
  return Math.round(total * 10) / 10;
}

function StatCard({
  title,
  value,
  helper,
  icon,
  tone = "green"
}: {
  title: string;
  value: string;
  helper: ReactNode;
  icon: ReactNode;
  tone?: "green" | "amber";
}) {
  return (
    <Card className="min-h-32">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-normal text-gray-500 dark:text-text-muted">
            {title}
          </p>
          <p className="mt-2 font-heading text-2xl font-extrabold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
            tone === "amber"
              ? "bg-amber-100 text-amber-600 dark:bg-amber/15 dark:text-amber"
              : "bg-emerald-100 text-emerald-600 dark:bg-accent/15 dark:text-accent"
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3 text-sm leading-5 text-gray-500 dark:text-text-muted">
        {helper}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(demoDashboard);
  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(false);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { profile } = useSettings();
  const displayName = profile.name?.split(" ")[0] || data.profile.display_name;
  const [greeting, setGreeting] = useState("Welcome");

  // Fix #9 — Refs for focus management
  const fabRef = useRef<HTMLButtonElement>(null);
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Compute greeting client-side only to avoid SSR/CSR mismatch
    setGreeting(getGreeting());
  }, []);

  const fetchDashboard = useCallback(() => {
    setLoading(true);
    setFetchError(false);

    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.data) {
          setData(payload.data);
          setFetchError(false);
        } else {
          setData(demoDashboard);
          setFetchError(true);
        }
      })
      .catch(() => {
        setData(demoDashboard);
        setFetchError(true);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  // Fix #9 — Escape key handler for quick-add sheet
  useEffect(() => {
    if (!sheetOpen) return;

    function onKeyDown(e: KeyboardEvent) {
      if (e.key === "Escape") {
        setSheetOpen(false);
        fabRef.current?.focus();
      }
    }

    // Focus the sheet when opened
    sheetRef.current?.focus();

    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [sheetOpen]);

  const todayDelta = data.todayKg - data.yesterdayKg;
  const weeklyAverage = data.weeklyTotalKg / 7;
  const weeklyUnderAverage = weeklyAverage <= data.indiaDailyAverageKg;

  return (
    <MotionPage>
      <section className="space-y-5">
        <div className="relative rounded-card p-5 text-gray-900 dark:text-white shadow-soft overflow-hidden glass-card border-0">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/dashboard-hero-bg.webp')" }}
          />
          <div className="absolute inset-0 cinematic-overlay" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge className="bg-white/10 text-white/80" tone="dark">
                {data.profile.city}, {data.profile.state}
              </Badge>
              <h1 className="mt-4 font-heading text-xl font-extrabold leading-tight sm:text-2xl md:text-3xl">
                {greeting}, <span className="text-accent">{displayName}</span> — Your CO2 today:{" "}
                <span className="tabular-nums">{data.todayKg.toFixed(1)}</span> kg
              </h1>
            </div>
            <Link
              href="/calculator"
              className="btn-primary-gradient inline-flex items-center gap-2.5 rounded-full px-4 py-2 text-xs font-semibold transition-all duration-300 hover:shadow-glow hover:-translate-y-0.5 active:translate-y-0 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              <Calculator aria-hidden size={16} />
              <span className="h-4 w-px bg-current opacity-25" />
              Log Entry
            </Link>
          </div>
        </div>

        {/* Fix #19 — Error state banner */}
        {fetchError && !loading && (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-card border border-amber-200 bg-amber-50 dark:border-amber/20 dark:bg-amber/10 p-3">
            <div className="flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber">
              <AlertCircle aria-hidden size={16} />
              Using offline data — couldn&apos;t reach the server.
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={fetchDashboard}
              className="text-amber-600 hover:text-amber-500 dark:text-amber dark:hover:text-amber/80"
            >
              <RefreshCw aria-hidden size={14} />
              Retry
            </Button>
          </div>
        )}

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4" aria-live="polite">
            <StatCard
              helper={
                <span className="inline-flex items-center gap-1">
                  {todayDelta <= 0 ? (
                    <ArrowDownRight aria-hidden className="text-primary" size={16} />
                  ) : (
                    <ArrowUpRight aria-hidden className="text-amber" size={16} />
                  )}
                  {Math.abs(todayDelta).toFixed(1)} kg vs yesterday
                </span>
              }
              icon={<Leaf aria-hidden size={20} />}
              title="Today"
              value={formatKg(data.todayKg)}
            />
            <StatCard
              helper={
                weeklyUnderAverage
                  ? "Below the India daily average"
                  : "Plan one quick win today"
              }
              icon={<ArrowDownRight aria-hidden size={20} />}
              title="This week"
              tone={weeklyUnderAverage ? "green" : "amber"}
              value={formatKg(data.weeklyTotalKg)}
            />
            <StatCard
              helper="Streak at risk after 8 PM without an entry"
              icon={<Flame aria-hidden size={20} />}
              title="Streak"
              value={`${data.streak} days`}
            />
            <StatCard
              helper="Earned from entries, tips, badges, and challenges"
              icon={<Coins aria-hidden size={20} />}
              title="Eco-coins"
              value={`${data.coins}`}
            />
          </div>
        )}

        {/* ─── New 2×2 stat cards ─── */}
        {!loading && (
          <div className="grid grid-cols-2 gap-3" aria-live="polite">
            {/* Carbon Score */}
            {(() => {
              const monthlyKg = data.weeklyTotalKg * 4.3;
              const score = computeCarbonScore(monthlyKg);
              return (
                <StatCard
                  title="Carbon Score"
                  value={`${score}`}
                  helper={
                    <>
                      <span className="block text-sm">0–100 scale</span>
                      <span className="block text-xs text-gray-400 dark:text-white/40">कार्बन स्कोर</span>
                    </>
                  }
                  icon={<Leaf aria-hidden size={20} />}
                />
              );
            })()}

            {/* Carbon Rank */}
            <StatCard
              title="vs. Other Users"
              value="—"
              helper={
                <>
                  <span className="block text-sm">Rank unavailable</span>
                  <span className="block text-xs text-gray-400 dark:text-white/40">अन्य उपयोगकर्ता</span>
                </>
              }
              icon={<ArrowUpRight aria-hidden size={20} />}
            />

            {/* Risk Level */}
            {(() => {
              const monthlyKg = data.weeklyTotalKg * 4.3;
              const risk = computeRiskLevel(monthlyKg);
              return (
                <StatCard
                  title="Risk Level"
                  value={`${risk.icon} ${risk.tier}`}
                  helper={
                    <>
                      <span className="block text-sm">India NDC: ~158 kg/mo</span>
                      <span className="block text-xs text-gray-400 dark:text-white/40">जोखिम स्तर</span>
                    </>
                  }
                  icon={<AlertCircle aria-hidden size={20} />}
                  tone={risk.tier === "LOW" ? "green" : "amber"}
                />
              );
            })()}

            {/* Forecast */}
            {(() => {
              const forecast = forecastNextMonth(data.dailySeries as DailyPoint[]);
              return (
                <StatCard
                  title="Next Month Forecast"
                  value={forecast !== null ? `${forecast} kg` : "—"}
                  helper={
                    <>
                      <span className="block text-sm">{forecast !== null ? "Linear projection" : "Insufficient data"}</span>
                      <span className="block text-xs text-gray-400 dark:text-white/40">अगले महीने का अनुमान</span>
                    </>
                  }
                  icon={<ArrowDownRight aria-hidden size={20} />}
                />
              );
            })()}
          </div>
        )}

        <LazySection className="mt-5">
          <Card className="overflow-hidden relative">
            {/* Subtle top gradient accent */}
            <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-accent/60 via-accent to-accent-hover" />

            <CardHeader className="pb-1">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <CardTitle className="flex items-center gap-2">
                    <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-100 text-emerald-600 dark:bg-accent/10 dark:text-accent">
                      📊
                    </span>
                    Last 30 days
                  </CardTitle>
                  <p className="mt-1.5 text-sm text-gray-500 dark:text-text-muted">
                    Green area stays under India&apos;s 5.67 kg/day benchmark.
                  </p>
                </div>
                <Badge tone={weeklyUnderAverage ? "green" : "amber"} className="shadow-sm">
                  Highest: {CATEGORY_LABELS[data.topCategory]}
                </Badge>
              </div>
            </CardHeader>

            {loading ? (
              <Skeleton className="h-80" />
            ) : (
              <DashboardTrendChart data={data.dailySeries as DailyPoint[]} />
            )}

            {/* Stats summary row below chart */}
            {!loading && (
              <div className="grid grid-cols-3 gap-px bg-gray-100 dark:bg-white/[0.04] border-t border-gray-200 dark:border-white/[0.06] -mx-4 -mb-4">
                <div className="bg-white dark:bg-white/[0.02] px-4 py-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-text-muted">30d Average</p>
                  <p className="mt-1 text-lg font-extrabold text-gray-900 dark:text-white tabular-nums">
                    {(data.dailySeries.reduce((sum: number, d: DailyPoint) => sum + d.kgCo2e, 0) / data.dailySeries.length).toFixed(1)}
                    <span className="ml-1 text-xs font-bold text-gray-400 dark:text-white/50">kg</span>
                  </p>
                </div>
                <div className="bg-white dark:bg-white/[0.02] px-4 py-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-text-muted">Best Day</p>
                  <p className="mt-1 text-lg font-extrabold text-emerald-600 dark:text-accent tabular-nums">
                    {Math.min(...data.dailySeries.map((d: DailyPoint) => d.kgCo2e)).toFixed(1)}
                    <span className="ml-1 text-xs font-bold text-emerald-400 dark:text-accent/50">kg</span>
                  </p>
                </div>
                <div className="bg-white dark:bg-white/[0.02] px-4 py-3 text-center">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-text-muted">Peak Day</p>
                  <p className="mt-1 text-lg font-extrabold text-amber-600 dark:text-amber tabular-nums">
                    {Math.max(...data.dailySeries.map((d: DailyPoint) => d.kgCo2e)).toFixed(1)}
                    <span className="ml-1 text-xs font-bold text-amber-400 dark:text-amber/50">kg</span>
                  </p>
                </div>
              </div>
            )}
          </Card>
        </LazySection>
      </section>

      {/* Quick-add FAB */}
      <Button
        ref={fabRef}
        aria-label="Quick add emission entry"
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full shadow-soft md:bottom-8"
        onClick={() => setSheetOpen(true)}
        size="icon"
        type="button"
      >
        <Plus aria-hidden size={24} />
      </Button>

      {/* Fix #9 — Accessible quick-add bottom sheet */}
      {sheetOpen && (
        <div
          className="fixed inset-0 z-50 flex items-end bg-black/30 dark:bg-black/60 p-3 backdrop-blur-sm"
          onClick={(e) => {
            if (e.target === e.currentTarget) {
              setSheetOpen(false);
              fabRef.current?.focus();
            }
          }}
        >
          <div
            ref={sheetRef}
            aria-label="Quick add emission entry"
            aria-modal="true"
            className="mx-auto w-full max-w-md rounded-t-[24px] glass-card border-0 p-4 shadow-soft"
            role="dialog"
            tabIndex={-1}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-gray-300 dark:bg-white/20" />
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-extrabold text-gray-900 dark:text-white">
                Quick add
              </h2>
              <Button
                aria-label="Close quick add"
                onClick={() => {
                  setSheetOpen(false);
                  fabRef.current?.focus();
                }}
                type="button"
                variant="ghost"
              >
                Close
              </Button>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-3">
              {quickCategories.map((item) => {
                const Icon = item.icon;
                return (
                  <Link
                    className="flex min-h-20 items-center gap-3 rounded-card border border-gray-200 p-3 font-bold text-gray-900 dark:border-white/10 dark:text-white transition-all duration-300 hover:border-emerald-300 hover:bg-emerald-50 dark:hover:border-accent/30 dark:hover:bg-accent/5"
                    href={`/calculator?category=${item.category}`}
                    key={item.category}
                    onClick={() => setSheetOpen(false)}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-accent/15 dark:text-accent">
                      <Icon aria-hidden size={20} />
                    </span>
                    {CATEGORY_LABELS[item.category]}
                  </Link>
                );
              })}
            </div>
          </div>
        </div>
      )}
    </MotionPage>
  );
}
