"use client";

import { useState } from "react";
import { MotionPage } from "@/components/motion-page";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

const MODES = [
  { id: "car_petrol", emoji: "🚗", name: "Petrol Car", kgPerKm: 0.15, speedKmh: 25, costPerKm: 8.5, color: "#ef4444" },
  { id: "two_wheeler", emoji: "🛵", name: "Two-Wheeler (Petrol)", kgPerKm: 0.05, speedKmh: 30, costPerKm: 2.5, color: "#f97316" },
  { id: "ev_two_wheeler", emoji: "⚡", name: "EV Two-Wheeler", kgPerKm: 0.008, speedKmh: 28, costPerKm: 0.4, color: "#22c55e" },
  { id: "metro", emoji: "🚇", name: "Metro Rail", kgPerKm: 0.012, speedKmh: 35, costPerKm: 1.5, color: "#3b82f6" },
  { id: "bus", emoji: "🚌", name: "City Bus", kgPerKm: 0.03, speedKmh: 18, costPerKm: 1.0, color: "#8b5cf6" },
  { id: "auto", emoji: "🛺", name: "Auto-Rickshaw", kgPerKm: 0.07, speedKmh: 20, costPerKm: 6.0, color: "#eab308" },
  { id: "bicycle", emoji: "🚲", name: "Bicycle", kgPerKm: 0, speedKmh: 12, costPerKm: 0, color: "#10b981" },
  { id: "walking", emoji: "🚶", name: "Walking", kgPerKm: 0, speedKmh: 5, costPerKm: 0, color: "#06b6d4" },
  { id: "wfh", emoji: "🏠", name: "Work From Home", kgPerKm: 0, speedKmh: 0, costPerKm: 0, color: "#a855f7" },
];

export default function CommutePage() {
  const [distance, setDistance] = useState(10);
  const [currentMode, setCurrentMode] = useState("two_wheeler");
  const [switchDays, setSwitchDays] = useState(2);
  const [newMode, setNewMode] = useState("metro");

  const currentModeData = MODES.find(m => m.id === currentMode)!;
  const newModeData = MODES.find(m => m.id === newMode)!;

  // Daily calculations
  const dailyCO2Current = distance * 2 * currentModeData.kgPerKm; // round trip
  const dailyCO2New = distance * 2 * newModeData.kgPerKm;
  const dailyCostCurrent = distance * 2 * currentModeData.costPerKm;
  const dailyCostNew = distance * 2 * newModeData.costPerKm;

  // Monthly savings for switching X days/week
  const weeklySavingCO2 = (dailyCO2Current - dailyCO2New) * switchDays;
  const monthlySavingCO2 = weeklySavingCO2 * 4.3;
  const monthlySavingCost = (dailyCostCurrent - dailyCostNew) * switchDays * 4.3;
  const yearSavingCost = monthlySavingCost * 12;
  const yearSavingCO2 = monthlySavingCO2 * 12;

  return (
    <MotionPage>
      <section className="space-y-5">

        {/* Hero */}
        <Card className="bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 text-center py-4">
            <span className="text-4xl mb-3 block">🚗</span>
            <h1 className="font-heading text-3xl font-extrabold mb-2">Commute Comparison</h1>
            <p className="text-white/70 text-sm max-w-md mx-auto">
              Compare the carbon and cost of different commute modes. See what switching even 2 days/week can save.
            </p>
          </div>
        </Card>

        {/* Distance input */}
        <Card>
          <CardHeader>
            <CardTitle>Your Commute Distance</CardTitle>
            <CardDescription>One-way distance from home to work/school</CardDescription>
          </CardHeader>
          <div className="flex justify-between text-sm font-bold mb-2">
            <span>Distance</span>
            <span className="text-primary tabular-nums">{distance} km (one-way)</span>
          </div>
          <input type="range" min={1} max={50} value={distance} onChange={e => setDistance(Number(e.target.value))}
            className="w-full h-2 rounded-full accent-primary" />
        </Card>

        {/* Mode comparison cards */}
        <Card>
          <CardHeader>
            <CardTitle>Mode Comparison</CardTitle>
            <CardDescription>Daily round-trip ({distance * 2} km) emissions and cost</CardDescription>
          </CardHeader>
          <div className="space-y-2">
            {MODES.filter(m => m.id !== "wfh").map(mode => {
              const dailyCO2 = distance * 2 * mode.kgPerKm;
              const dailyCost = distance * 2 * mode.costPerKm;
              const time = mode.speedKmh > 0 ? Math.round((distance * 2 / mode.speedKmh) * 60) : 0;
              const maxCO2 = distance * 2 * 0.15; // car as max
              const barWidth = maxCO2 > 0 ? Math.max(2, (dailyCO2 / maxCO2) * 100) : 2;
              const isCurrentMode = mode.id === currentMode;

              return (
                <button key={mode.id}
                  onClick={() => setCurrentMode(mode.id)}
                  className={`w-full rounded-xl border p-3 text-left transition ${
                    isCurrentMode ? "border-primary ring-1 ring-primary/20 bg-primary/5" : "border-line dark:border-white/10 hover:border-primary"
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl shrink-0">{mode.emoji}</span>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-bold text-sm">{mode.name}</p>
                        {isCurrentMode && <Badge tone="green" className="text-[9px]">Your mode</Badge>}
                      </div>
                      <div className="h-1.5 rounded-full bg-line dark:bg-white/10 mt-1.5 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${barWidth}%`, backgroundColor: mode.color }} />
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="font-bold text-sm tabular-nums" style={{ color: mode.color }}>{dailyCO2.toFixed(2)} kg</p>
                      <p className="text-[10px] text-ink/40 dark:text-white/60">{time > 0 ? `${time} min` : "—"} • ₹{dailyCost.toFixed(0)}</p>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>
        </Card>

        {/* Switch scenario */}
        <Card className="bg-primary/5 border-primary/20">
          <CardHeader>
            <CardTitle>🔄 Switch Scenario</CardTitle>
            <CardDescription>What if you switch from {currentModeData.emoji} to a greener mode some days?</CardDescription>
          </CardHeader>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-bold mb-2">Switch to:</p>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {MODES.filter(m => m.id !== currentMode && m.kgPerKm < currentModeData.kgPerKm).map(mode => (
                  <button key={mode.id} onClick={() => setNewMode(mode.id)}
                    className={`rounded-xl border p-2 text-center transition text-sm font-bold ${
                      newMode === mode.id ? "border-primary bg-primary text-white" : "border-line dark:border-white/10"
                    }`}
                  >
                    <span className="text-lg block">{mode.emoji}</span>
                    {mode.name.split(" ")[0]}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>Days per week to switch</span>
                <span className="text-primary tabular-nums">{switchDays} days</span>
              </div>
              <input type="range" min={1} max={5} value={switchDays} onChange={e => setSwitchDays(Number(e.target.value))}
                className="w-full h-2 rounded-full accent-primary" />
            </div>
          </div>
        </Card>

        {/* Savings result */}
        {monthlySavingCO2 > 0 && (
          <>
            <div className="grid grid-cols-2 gap-3">
              <Card className="text-center p-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
                <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">Monthly CO₂ Saved</p>
                <p className="text-2xl font-black text-green-600 dark:text-green-400 tabular-nums mt-1">{monthlySavingCO2.toFixed(1)} kg</p>
              </Card>
              <Card className="text-center p-4 bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30">
                <p className="text-[10px] font-bold text-green-600 dark:text-green-400 uppercase">Monthly ₹ Saved</p>
                <p className="text-2xl font-black text-green-600 dark:text-green-400 tabular-nums mt-1">₹{monthlySavingCost.toFixed(0)}</p>
              </Card>
            </div>

            <Card className="text-center">
              <p className="text-sm text-ink/60 dark:text-white/60">
                By switching from {currentModeData.emoji} <strong>{currentModeData.name}</strong> to {newModeData.emoji} <strong>{newModeData.name}</strong> for just <strong>{switchDays} days/week</strong>:
              </p>
              <div className="grid grid-cols-2 gap-3 mt-3">
                <div className="rounded-xl bg-primary/10 p-3">
                  <p className="text-2xl font-black text-primary tabular-nums">₹{yearSavingCost.toFixed(0)}</p>
                  <p className="text-[10px] font-bold text-ink/50 dark:text-white/50">saved per year</p>
                </div>
                <div className="rounded-xl bg-primary/10 p-3">
                  <p className="text-2xl font-black text-primary tabular-nums">{yearSavingCO2.toFixed(0)} kg</p>
                  <p className="text-[10px] font-bold text-ink/50 dark:text-white/50">CO₂ avoided per year</p>
                </div>
              </div>
              <p className="text-xs text-ink/40 dark:text-white/60 mt-3">
                🌳 That&apos;s like planting {Math.round(yearSavingCO2 / 21.77)} trees!
              </p>
            </Card>
          </>
        )}
      </section>
    </MotionPage>
  );
}
