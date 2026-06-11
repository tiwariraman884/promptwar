"use client";

import type { ReactNode } from "react";
import { Bell, Coins, Flame, Globe2, Leaf, MapPin, Settings, ShieldCheck, UserRound } from "lucide-react";
import { useEffect, useState } from "react";
import { MotionPage } from "@/components/motion-page";
import { BadgeShelf } from "@/components/gamification/badge-shelf";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { demoBadges, demoDashboard, demoMonthlyHistory } from "@/lib/demo-data";

type DashboardData = typeof demoDashboard;
type BadgeData = (typeof demoBadges)[number];

function Stat({
  icon,
  label,
  value
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-card border border-line bg-white p-4 dark:border-white/10 dark:bg-white/5">
      <div className="grid h-10 w-10 place-items-center rounded-full bg-primary-light text-primary-dark">
        {icon}
      </div>
      <p className="mt-3 text-xs font-bold uppercase text-ink/55 dark:text-white/55">
        {label}
      </p>
      <p className="mt-1 font-heading text-2xl font-extrabold text-ink dark:text-white">
        {value}
      </p>
    </div>
  );
}

export default function ProfilePage() {
  const [dashboard, setDashboard] = useState<DashboardData>(demoDashboard);
  const [badges, setBadges] = useState<BadgeData[]>(demoBadges);
  const [city, setCity] = useState(demoDashboard.profile.city);
  const [diet, setDiet] = useState(demoDashboard.profile.diet_type);
  const [language, setLanguage] = useState("EN");
  const [notifications, setNotifications] = useState(true);

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.data) {
          setDashboard(payload.data);
          setCity(payload.data.profile.city);
          setDiet(payload.data.profile.diet_type);
        }
      })
      .catch(() => setDashboard(demoDashboard));

    fetch("/api/profile/badges")
      .then((response) => response.json())
      .then((payload) => payload.data && setBadges(payload.data))
      .catch(() => setBadges(demoBadges));
  }, []);

  return (
    <MotionPage>
      <section className="space-y-5">
        <Card className="bg-primary-dark text-white">
          <div className="flex flex-wrap items-center gap-4">
            <div className="grid h-20 w-20 place-items-center rounded-full bg-white/15">
              <UserRound aria-hidden size={36} />
            </div>
            <div className="min-w-0 flex-1">
              <h1 className="font-heading text-3xl font-extrabold">
                {dashboard.profile.display_name}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge className="bg-white/15 text-white" tone="dark">
                  <MapPin aria-hidden className="mr-1" size={14} />
                  {dashboard.profile.city}
                </Badge>
                <Badge className="bg-white/15 text-white" tone="dark">
                  {dashboard.profile.state}
                </Badge>
              </div>
            </div>
          </div>
        </Card>

        <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
          <Stat
            icon={<Leaf aria-hidden size={20} />}
            label="Total logged"
            value={`${dashboard.totalLoggedKg.toFixed(1)} kg`}
          />
          <Stat
            icon={<ShieldCheck aria-hidden size={20} />}
            label="Total saved"
            value={`${dashboard.totalSavedKg.toFixed(1)} kg`}
          />
          <Stat
            icon={<Flame aria-hidden size={20} />}
            label="Streak"
            value={`${dashboard.streak} days`}
          />
          <Stat
            icon={<Coins aria-hidden size={20} />}
            label="Coins"
            value={`${dashboard.coins}`}
          />
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Badges</CardTitle>
            <CardDescription>Earned badges are bright; upcoming badges stay muted.</CardDescription>
          </CardHeader>
          <BadgeShelf badges={badges} />
        </Card>

        <div className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardHeader>
              <CardTitle>Monthly history</CardTitle>
              <CardDescription>Past months with total logged and saved.</CardDescription>
            </CardHeader>
            <div className="space-y-2">
              {demoMonthlyHistory.map((month) => (
                <details
                  className="rounded-card border border-line bg-white p-3 dark:border-white/10 dark:bg-white/5"
                  key={month.month}
                >
                  <summary className="min-h-11 cursor-pointer list-none font-bold text-ink dark:text-white">
                    {month.month}
                  </summary>
                  <div className="grid grid-cols-2 gap-3 pt-3 text-sm font-bold text-ink/65 dark:text-white/65">
                    <span>Total: {month.totalKg.toFixed(1)} kgCO2e</span>
                    <span>Saved: {month.savedKg.toFixed(1)} kgCO2e</span>
                  </div>
                </details>
              ))}
            </div>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Settings</CardTitle>
              <CardDescription>City, diet, notifications, language, and account.</CardDescription>
            </CardHeader>
            <div className="space-y-4">
              <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
                City
                <Input
                  className="mt-2"
                  onChange={(event) => setCity(event.target.value)}
                  value={city}
                />
              </label>
              <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
                Diet type
                <select
                  className="mt-2 min-h-11 w-full rounded-card border border-line bg-white px-3 text-sm text-ink dark:border-white/10 dark:bg-white/5 dark:text-white"
                  onChange={(event) => setDiet(event.target.value)}
                  value={diet}
                >
                  <option value="vegan">Vegan</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="non_veg">Non-veg</option>
                </select>
              </label>
              <button
                aria-pressed={notifications}
                className="flex min-h-14 w-full items-center justify-between rounded-card border border-line px-4 font-bold dark:border-white/10"
                onClick={() => setNotifications((value) => !value)}
                type="button"
              >
                <span className="inline-flex items-center gap-2">
                  <Bell aria-hidden size={18} />
                  Notifications
                </span>
                <Badge tone={notifications ? "green" : "muted"}>
                  {notifications ? "On" : "Off"}
                </Badge>
              </button>
              <div>
                <p className="mb-2 text-sm font-bold text-ink/70 dark:text-white/70">
                  Language
                </p>
                <div className="grid grid-cols-2 gap-2">
                  {["EN", "HI"].map((item) => (
                    <button
                      className={`min-h-11 rounded-pill border font-bold ${
                        language === item
                          ? "border-primary bg-primary text-white"
                          : "border-line bg-white text-ink dark:border-white/10 dark:bg-white/5 dark:text-white"
                      }`}
                      key={item}
                      onClick={() => setLanguage(item)}
                      type="button"
                    >
                      <Globe2 aria-hidden className="mr-2 inline" size={16} />
                      {item}
                    </button>
                  ))}
                </div>
              </div>
              <Button className="w-full" type="button" variant="secondary">
                <Settings aria-hidden size={18} />
                Account
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </MotionPage>
  );
}
