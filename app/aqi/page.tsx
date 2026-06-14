"use client";

import { useState, useEffect, useMemo } from "react";
import { MotionPage } from "@/components/motion-page";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { DEMO_CITY_AQI, getAQILevel, getCityAQI, type CityAQIData } from "@/lib/aqi-data";

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function AQIPage() {
  const [userCity, setUserCity] = useState("Haridwar");
  const [selectedCity, setSelectedCity] = useState<CityAQIData | null>(null);

  useEffect(() => {
    try {
      const ob = localStorage.getItem("greenstep-onboarding");
      if (ob) {
        const data = JSON.parse(ob);
        if (data.city) setUserCity(data.city);
      }
    } catch {}
  }, []);

  const cityData = useMemo(() => getCityAQI(userCity) ?? DEMO_CITY_AQI[0], [userCity]);
  const level = useMemo(() => getAQILevel(cityData.aqi), [cityData.aqi]);
  const maxTrend = Math.max(...cityData.weekTrend, 100);

  const today = new Date();
  const trendDays = cityData.weekTrend.map((_, i) => {
    const d = new Date(today);
    d.setDate(d.getDate() - (6 - i));
    return DAYS[d.getDay()];
  });

  return (
    <MotionPage>
      <section className="space-y-5">

        {/* Hero AQI Card */}
        <Card className="overflow-hidden relative" style={{ background: `linear-gradient(135deg, ${level.color}15, ${level.color}05)`, borderColor: `${level.color}30` }}>
          <div className="text-center py-6">
            <span className="text-5xl block mb-3">{level.emoji}</span>
            <p className="text-xs font-bold uppercase tracking-wider mb-1" style={{ color: level.color }}>
              Air Quality in {cityData.city}
            </p>
            <div className="flex items-center justify-center gap-3 mb-2">
              <span className="text-6xl font-black tabular-nums" style={{ color: level.color }}>
                {cityData.aqi}
              </span>
              <Badge tone={cityData.aqi <= 100 ? "green" : cityData.aqi <= 200 ? "amber" : "muted"}>
                {level.label}
              </Badge>
            </div>

            {/* AQI gauge bar */}
            <div className="max-w-xs mx-auto mt-4">
              <div className="h-3 rounded-full bg-gradient-to-r from-green-400 via-yellow-400 via-orange-400 to-red-600 relative overflow-hidden">
                <div
                  className="absolute top-0 h-full w-1 bg-white border border-gray-700 rounded-full shadow-lg transition-all"
                  style={{ left: `${Math.min((cityData.aqi / 500) * 100, 100)}%` }}
                />
              </div>
              <div className="flex justify-between text-[8px] font-bold text-ink/40 dark:text-white/40 mt-1">
                <span>0</span><span>100</span><span>200</span><span>300</span><span>400</span><span>500</span>
              </div>
            </div>

            <p className="text-xs text-ink/50 dark:text-white/50 mt-3">
              Updated: {new Date(cityData.updatedAt).toLocaleTimeString()} • Primary: {cityData.primaryPollutant}
            </p>
          </div>
        </Card>

        {/* Health & Exercise Advisory */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Card className="p-4">
            <p className="text-xs font-bold text-ink/50 dark:text-white/50 uppercase tracking-wide mb-2">🏥 Health Advisory</p>
            <p className="text-sm font-bold leading-relaxed">{level.healthMsg}</p>
          </Card>
          <Card className="p-4">
            <p className="text-xs font-bold text-ink/50 dark:text-white/50 uppercase tracking-wide mb-2">🏃 Exercise Guide</p>
            <p className="text-sm font-bold leading-relaxed">{level.exerciseAdvice}</p>
          </Card>
        </div>

        {/* Pollutant breakdown */}
        <Card>
          <CardHeader>
            <CardTitle>Pollutant Levels</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-xl border border-line dark:border-white/10 p-4 text-center">
              <p className="text-xs font-bold text-ink/50 dark:text-white/50">PM2.5</p>
              <p className="text-2xl font-black tabular-nums mt-1">{cityData.pm25}</p>
              <p className="text-[10px] text-ink/40 dark:text-white/40">µg/m³ {cityData.pm25 > 60 ? "⚠️ High" : "✅ OK"}</p>
            </div>
            <div className="rounded-xl border border-line dark:border-white/10 p-4 text-center">
              <p className="text-xs font-bold text-ink/50 dark:text-white/50">PM10</p>
              <p className="text-2xl font-black tabular-nums mt-1">{cityData.pm10}</p>
              <p className="text-[10px] text-ink/40 dark:text-white/40">µg/m³ {cityData.pm10 > 100 ? "⚠️ High" : "✅ OK"}</p>
            </div>
          </div>
        </Card>

        {/* 7-day trend chart */}
        <Card>
          <CardHeader>
            <CardTitle>7-Day AQI Trend</CardTitle>
            <CardDescription>{cityData.city} air quality over the past week</CardDescription>
          </CardHeader>
          <div className="flex items-end gap-2 h-40 mt-2">
            {cityData.weekTrend.map((val, i) => {
              const barLevel = getAQILevel(val);
              const height = Math.max(8, (val / maxTrend) * 100);
              return (
                <div key={i} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-[9px] font-bold tabular-nums">{val}</span>
                  <div
                    className="w-full rounded-t-lg transition-all"
                    style={{ height: `${height}%`, backgroundColor: barLevel.color, opacity: 0.75 }}
                  />
                  <span className="text-[9px] font-bold text-ink/40 dark:text-white/40">{trendDays[i]}</span>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Your impact connection */}
        <Card className="bg-primary/5 border-primary/20">
          <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">🌿 Your Actions Matter</p>
          <p className="text-sm text-ink/70 dark:text-white/70 leading-relaxed">
            Transport contributes ~28% of local PM2.5 in {cityData.city}. Every time you choose metro or cycling over a petrol two-wheeler, you directly reduce particulate matter in your neighborhood.
          </p>
          <p className="text-sm text-ink/70 dark:text-white/70 mt-2">
            <strong>Today&apos;s AQI is {cityData.aqi}</strong> — {cityData.aqi <= 100
              ? "a good day for walking or cycling your commute! 🚶"
              : cityData.aqi <= 200
                ? "consider wearing a mask if cycling, or take metro instead."
                : "strongly consider working from home if possible to avoid exposure."}
          </p>
        </Card>

        {/* City comparison */}
        <Card>
          <CardHeader>
            <CardTitle>City Comparison</CardTitle>
            <CardDescription>How does {cityData.city} compare?</CardDescription>
          </CardHeader>
          <div className="space-y-2">
            {DEMO_CITY_AQI
              .sort((a, b) => a.aqi - b.aqi)
              .map(city => {
                const cl = getAQILevel(city.aqi);
                const isUser = city.city.toLowerCase() === userCity.toLowerCase();
                return (
                  <button key={city.city}
                    onClick={() => setSelectedCity(selectedCity?.city === city.city ? null : city)}
                    className={`w-full flex items-center gap-3 rounded-xl border p-3 transition text-left ${
                      isUser ? "border-primary bg-primary/5 ring-1 ring-primary/20" : "border-line dark:border-white/10 hover:border-primary"
                    }`}
                  >
                    <span className="text-lg shrink-0">{cl.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <p className="font-bold text-sm">{city.city} {isUser && "📍"}</p>
                      <p className="text-[10px] text-ink/40 dark:text-white/40">{city.state}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold tabular-nums" style={{ color: cl.color }}>{city.aqi}</p>
                      <p className="text-[10px] font-bold" style={{ color: cl.color }}>{cl.label}</p>
                    </div>
                  </button>
                );
              })}
          </div>
        </Card>

        {/* Data source */}
        <p className="text-center text-[10px] text-ink/30 dark:text-white/30 px-4">
          Data simulated based on CPCB (Central Pollution Control Board) patterns. In production, this would connect to the CPCB real-time AQI API.
        </p>
      </section>
    </MotionPage>
  );
}
