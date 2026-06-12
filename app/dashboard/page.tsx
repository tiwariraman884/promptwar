"use client";

import type { ReactNode } from "react";
import Link from "next/link";
import { useEffect, useState } from "react";
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
  Utensils,
  Zap,
  ShoppingBag,
  Recycle,
  Wifi
} from "lucide-react";
import { DashboardTrendChart, type DailyPoint } from "@/components/charts/dashboard-trend-chart";
import { MotionPage } from "@/components/motion-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { demoDashboard } from "@/lib/demo-data";
import { CATEGORY_LABELS, type EmissionCategory } from "@/lib/emission-factors";
import { formatKg, getGreeting } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

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
          <p className="text-xs font-bold uppercase tracking-normal text-ink/55 dark:text-white/55">
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
      <div className="mt-3 text-sm leading-5 text-ink/65 dark:text-white/65">
        {helper}
      </div>
    </Card>
  );
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData>(demoDashboard);
  const [loading, setLoading] = useState(true);
  const [sheetOpen, setSheetOpen] = useState(false);
  const { profile } = useSettings();
  const displayName = profile.name?.split(" ")[0] || data.profile.display_name;
  const [greeting, setGreeting] = useState("Welcome");

  useEffect(() => {
    // Compute greeting client-side only to avoid SSR/CSR mismatch
    setGreeting(getGreeting());
  }, []);

  useEffect(() => {
    let mounted = true;

    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((payload) => {
        if (mounted && payload.data) setData(payload.data);
      })
      .catch(() => {
        if (mounted) setData(demoDashboard);
      })
      .finally(() => {
        if (mounted) setLoading(false);
      });

    return () => {
      mounted = false;
    };
  }, []);

  const todayDelta = data.todayKg - data.yesterdayKg;
  const weeklyAverage = data.weeklyTotalKg / 7;
  const weeklyUnderAverage = weeklyAverage <= data.indiaDailyAverageKg;

  return (
    <MotionPage>
      <section className="space-y-5">
        <div className="rounded-card bg-primary-dark p-5 text-white shadow-soft">
          <div className="flex flex-wrap items-center justify-between gap-3">
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

        {loading ? (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
            <Skeleton className="h-32" />
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
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

        <Card>
          <CardHeader>
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div>
                <CardTitle>Last 30 days</CardTitle>
                <p className="mt-1 text-sm text-ink/65 dark:text-white/65">
                  Green area stays under India&apos;s 5.67 kg/day benchmark.
                </p>
              </div>
              <Badge tone={weeklyUnderAverage ? "green" : "amber"}>
                Highest: {CATEGORY_LABELS[data.topCategory]}
              </Badge>
            </div>
          </CardHeader>
          {loading ? (
            <Skeleton className="h-72" />
          ) : (
            <DashboardTrendChart data={data.dailySeries as DailyPoint[]} />
          )}
        </Card>
      </section>

      <Button
        aria-label="Quick add emission entry"
        className="fixed bottom-24 right-4 z-50 h-14 w-14 rounded-full shadow-soft md:bottom-8"
        onClick={() => setSheetOpen(true)}
        size="icon"
        type="button"
      >
        <Plus aria-hidden size={24} />
      </Button>

      {sheetOpen && (
        <div
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-end bg-ink/35 p-3 backdrop-blur-sm"
          role="dialog"
        >
          <div className="mx-auto w-full max-w-md rounded-t-[24px] bg-white p-4 shadow-soft dark:bg-[#10231F]">
            <div className="mx-auto mb-4 h-1.5 w-12 rounded-full bg-line dark:bg-white/20" />
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-heading text-lg font-extrabold">
                Quick add
              </h2>
              <Button
                aria-label="Close quick add"
                onClick={() => setSheetOpen(false)}
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
