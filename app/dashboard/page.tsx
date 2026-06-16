"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useCallback, useEffect, useRef, useState } from "react";
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
          <p className="text-xs font-bold uppercase tracking-normal text-ink/70 dark:text-white/70">
            {title}
          </p>
          <p className="mt-2 font-heading text-2xl font-extrabold text-ink dark:text-white">
            {value}
          </p>
        </div>
        <div
          className={`grid h-11 w-11 shrink-0 place-items-center rounded-full ${
            tone === "amber"
              ? "bg-amber-light text-amber"
              : "bg-primary-light text-primary-dark"
          }`}
        >
          {icon}
        </div>
      </div>
      <div className="mt-3 text-sm leading-5 text-ink/70 dark:text-white/70">
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
        <div className="relative rounded-card bg-primary-dark p-5 text-white shadow-soft overflow-hidden">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/dashboard-hero-bg.png')" }}
          />
          <div className="absolute inset-0 bg-black/40" />

          <div className="relative z-10 flex flex-wrap items-center justify-between gap-3">
            <div>
              <Badge className="bg-white/15 text-white" tone="dark">
                {data.profile.city}, {data.profile.state}
              </Badge>
              <h1 className="mt-4 font-heading text-xl font-extrabold leading-tight sm:text-2xl md:text-3xl">
                {greeting}, <span className="bg-gradient-to-r from-[#B7E4C7] to-white bg-clip-text text-transparent">{displayName}</span> — Your CO2 today:{" "}
                <span className="tabular-nums">{data.todayKg.toFixed(1)}</span> kg
              </h1>
            </div>
            <Link
              href="/calculator"
              className="inline-flex items-center gap-2.5 rounded-full border border-white/20 bg-white/10 px-4 py-2 text-xs font-semibold text-white backdrop-blur-sm transition-all duration-200 hover:bg-white hover:text-[#1B4332] hover:shadow-lg hover:-translate-y-0.5 active:translate-y-0 sm:px-5 sm:py-2.5 sm:text-sm"
            >
              <Calculator aria-hidden size={16} />
              <span className="h-4 w-px bg-current opacity-25" />
              Log Entry
            </Link>
          </div>
        </div>

        {/* Fix #19 — Error state banner */}
        {fetchError && !loading && (
          <div role="alert" className="flex items-center justify-between gap-3 rounded-card border border-amber/30 bg-amber-light/50 p-3 dark:border-amber/20 dark:bg-amber/10">
            <div className="flex items-center gap-2 text-sm font-bold text-amber dark:text-amber-300">
              <AlertCircle aria-hidden size={16} />
              Using offline data — couldn&apos;t reach the server.
            </div>
            <Button
              type="button"
              variant="ghost"
              onClick={fetchDashboard}
              className="text-amber hover:text-amber-600 dark:text-amber-300"
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

        <Card className="overflow-hidden relative">
          {/* Subtle top gradient accent */}
          <div className="absolute inset-x-0 top-0 h-1 bg-gradient-to-r from-[#2D6A4F] via-[#52B788] to-[#00E676]" />

          <CardHeader className="pb-1">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-[#2D6A4F]/10 dark:bg-[#52B788]/10 text-[#2D6A4F] dark:text-[#52B788]">
                    📊
                  </span>
                  Last 30 days
                </CardTitle>
                <p className="mt-1.5 text-sm text-ink/65 dark:text-white/65">
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
            <div className="grid grid-cols-3 gap-px bg-line/30 dark:bg-white/[0.04] border-t border-line dark:border-white/[0.06] -mx-4 -mb-4">
              <div className="bg-white dark:bg-white/[0.02] px-4 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink/60 dark:text-white/60">30d Average</p>
                <p className="mt-1 text-lg font-extrabold text-ink dark:text-white tabular-nums">
                  {(data.dailySeries.reduce((sum: number, d: DailyPoint) => sum + d.kgCo2e, 0) / data.dailySeries.length).toFixed(1)}
                  <span className="ml-1 text-xs font-bold text-ink/50 dark:text-white/50">kg</span>
                </p>
              </div>
              <div className="bg-white dark:bg-white/[0.02] px-4 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink/60 dark:text-white/60">Best Day</p>
                <p className="mt-1 text-lg font-extrabold text-emerald-600 dark:text-emerald-400 tabular-nums">
                  {Math.min(...data.dailySeries.map((d: DailyPoint) => d.kgCo2e)).toFixed(1)}
                  <span className="ml-1 text-xs font-bold text-emerald-600/50 dark:text-emerald-400/50">kg</span>
                </p>
              </div>
              <div className="bg-white dark:bg-white/[0.02] px-4 py-3 text-center">
                <p className="text-[10px] font-bold uppercase tracking-wider text-ink/60 dark:text-white/60">Peak Day</p>
                <p className="mt-1 text-lg font-extrabold text-amber-600 dark:text-amber-400 tabular-nums">
                  {Math.max(...data.dailySeries.map((d: DailyPoint) => d.kgCo2e)).toFixed(1)}
                  <span className="ml-1 text-xs font-bold text-amber-600/50 dark:text-amber-400/50">kg</span>
                </p>
              </div>
            </div>
          )}
        </Card>
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
          className="fixed inset-0 z-50 flex items-end bg-ink/35 p-3 backdrop-blur-sm"
          onClick={(e) => {
            // Close on backdrop click (not on the sheet itself)
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
            className="mx-auto w-full max-w-md rounded-t-[24px] bg-white p-4 shadow-soft dark:bg-[#10231F]"
            role="dialog"
            tabIndex={-1}
          >
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line dark:bg-white/20" />
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-extrabold">
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
                    className="flex min-h-20 items-center gap-3 rounded-card border border-line p-3 font-bold text-ink transition hover:border-primary hover:bg-primary-light dark:border-white/10 dark:text-white dark:hover:bg-white/10"
                    href={`/calculator?category=${item.category}`}
                    key={item.category}
                    onClick={() => setSheetOpen(false)}
                  >
                    <span className="grid h-11 w-11 place-items-center rounded-full bg-primary-light text-primary-dark">
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
