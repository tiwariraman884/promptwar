"use client";

import { useState, useEffect, useMemo } from "react";
import { MotionPage } from "@/components/motion-page";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { calculateLifetimeCO2, calculateSavings, getComparisonToAverage, getLifetimeMilestones } from "@/lib/legacy-calc";

export default function LegacyPage() {
  const [age, setAge] = useState(25);
  const [lifespan, setLifespan] = useState(75);
  const [dailyKg, setDailyKg] = useState(5.2);
  const [goalPct, setGoalPct] = useState(20);
  const [showResult, setShowResult] = useState(false);

  /* Pull real data from localStorage if available */
  useEffect(() => {
    try {
      const ob = localStorage.getItem("greenstep-onboarding");
      if (ob) {
        const data = JSON.parse(ob);
        if (data.six_month_goal_percent) setGoalPct(data.six_month_goal_percent);
      }
    } catch {}
  }, []);

  const current = useMemo(() => calculateLifetimeCO2(age, lifespan, dailyKg), [age, lifespan, dailyKg]);
  const goalDailyKg = dailyKg * (1 - goalPct / 100);
  const goal = useMemo(() => calculateLifetimeCO2(age, lifespan, goalDailyKg), [age, lifespan, goalDailyKg]);
  const savings = useMemo(() => calculateSavings(current, goal), [current, goal]);
  const comparison = useMemo(() => getComparisonToAverage(dailyKg), [dailyKg]);
  const milestones = useMemo(() => getLifetimeMilestones(age, lifespan, dailyKg), [age, lifespan, dailyKg]);

  /* Tree health: 0-100 based on how far below average you are */
  const treeHealth = Math.max(0, Math.min(100, 100 - (dailyKg / 10) * 100 + 50));
  const goalTreeHealth = Math.max(0, Math.min(100, 100 - (goalDailyKg / 10) * 100 + 50));

  return (
    <MotionPage>
      <section className="space-y-5">

        {/* Hero */}
        <Card className="bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 text-center py-4">
            <span className="text-4xl mb-3 block">🌳</span>
            <h1 className="font-heading text-3xl font-extrabold mb-2">Carbon Inheritance</h1>
            <p className="text-white/70 text-sm max-w-md mx-auto">
              What world will your choices leave behind? See your lifetime carbon impact and how small changes today shape tomorrow.
            </p>
          </div>
        </Card>

        {/* Input Controls */}
        <Card>
          <CardHeader>
            <CardTitle>Your Profile</CardTitle>
            <CardDescription>Adjust the sliders to see your lifetime impact</CardDescription>
          </CardHeader>

          <div className="space-y-5">
            {/* Age */}
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>Your Age</span>
                <span className="text-primary tabular-nums">{age} years</span>
              </div>
              <input type="range" min={10} max={80} value={age} onChange={e => setAge(Number(e.target.value))}
                className="w-full h-2 rounded-full accent-primary" />
            </div>

            {/* Life expectancy */}
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>Expected Lifespan</span>
                <span className="text-primary tabular-nums">{lifespan} years</span>
              </div>
              <input type="range" min={50} max={100} value={lifespan} onChange={e => setLifespan(Number(e.target.value))}
                className="w-full h-2 rounded-full accent-primary" />
            </div>

            {/* Daily footprint */}
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>Daily CO₂ Footprint</span>
                <span className="text-primary tabular-nums">{dailyKg.toFixed(1)} kg/day</span>
              </div>
              <input type="range" min={1} max={20} step={0.1} value={dailyKg} onChange={e => setDailyKg(Number(e.target.value))}
                className="w-full h-2 rounded-full accent-primary" />
              <Badge tone={comparison.tone === "red" ? "amber" : comparison.tone} className="mt-1 text-[10px]">{comparison.label} ({comparison.vsAverage > 0 ? "+" : ""}{comparison.vsAverage.toFixed(0)}%)</Badge>
            </div>

            {/* Reduction goal */}
            <div>
              <div className="flex justify-between text-sm font-bold mb-2">
                <span>Reduction Goal</span>
                <span className="text-primary tabular-nums">{goalPct}%</span>
              </div>
              <input type="range" min={5} max={80} step={5} value={goalPct} onChange={e => setGoalPct(Number(e.target.value))}
                className="w-full h-2 rounded-full accent-primary" />
            </div>
          </div>

          <Button className="w-full mt-4" onClick={() => setShowResult(true)}>
            🌍 Calculate My Legacy
          </Button>
        </Card>

        {showResult && (
          <>
            {/* ── Tree Visualization ── */}
            <div className="grid grid-cols-2 gap-4">
              <Card className="text-center">
                <p className="text-xs font-bold text-ink/50 dark:text-white/50 uppercase tracking-wide mb-3">Current Path</p>
                <div className="text-6xl mb-3" style={{ filter: `hue-rotate(${Math.max(0, treeHealth - 50) * 2}deg) saturate(${treeHealth / 100 + 0.3})`, opacity: 0.4 + treeHealth / 150 }}>
                  {treeHealth > 60 ? "🌳" : treeHealth > 30 ? "🌿" : "🥀"}
                </div>
                <p className="text-2xl font-black tabular-nums">{current.lifetimeTonnes.toFixed(0)}</p>
                <p className="text-xs font-bold text-ink/50 dark:text-white/50">tonnes CO₂ lifetime</p>
              </Card>

              <Card className="text-center border-primary/30 bg-primary/5">
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-3">With {goalPct}% Reduction</p>
                <div className="text-6xl mb-3" style={{ filter: `hue-rotate(${Math.max(0, goalTreeHealth - 50) * 2}deg) saturate(${goalTreeHealth / 100 + 0.3})` }}>
                  {goalTreeHealth > 60 ? "🌳" : goalTreeHealth > 30 ? "🌿" : "🥀"}
                </div>
                <p className="text-2xl font-black tabular-nums text-primary">{goal.lifetimeTonnes.toFixed(0)}</p>
                <p className="text-xs font-bold text-ink/50 dark:text-white/50">tonnes CO₂ lifetime</p>
              </Card>
            </div>

            {/* ── Savings Card ── */}
            <Card className="bg-gradient-to-r from-primary/10 to-transparent border-primary/20">
              <div className="text-center">
                <p className="text-xs font-bold text-primary uppercase tracking-wide mb-2">🎯 Your Potential Savings</p>
                <p className="text-4xl font-black text-primary tabular-nums">{savings.tonnesSaved.toFixed(0)} tonnes</p>
                <p className="text-sm text-ink/60 dark:text-white/60 mt-1">of CO₂ you could prevent over your lifetime</p>
              </div>
            </Card>

            {/* ── Relatable Equivalents ── */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              <Card className="text-center p-4">
                <span className="text-3xl block mb-2">🌡️</span>
                <p className="text-lg font-black tabular-nums">{savings.tempSavedMicroC.toFixed(1)}</p>
                <p className="text-[10px] font-bold text-ink/50 dark:text-white/50">micro-°C cooling</p>
              </Card>
              <Card className="text-center p-4">
                <span className="text-3xl block mb-2">✈️</span>
                <p className="text-lg font-black tabular-nums">{savings.flightsSaved.toFixed(1)}</p>
                <p className="text-[10px] font-bold text-ink/50 dark:text-white/50">round-world flights avoided</p>
              </Card>
              <Card className="text-center p-4">
                <span className="text-3xl block mb-2">🌳</span>
                <p className="text-lg font-black tabular-nums">{Math.round(savings.treesFreed).toLocaleString()}</p>
                <p className="text-[10px] font-bold text-ink/50 dark:text-white/50">fewer trees needed to offset</p>
              </Card>
              <Card className="text-center p-4">
                <span className="text-3xl block mb-2">📉</span>
                <p className="text-lg font-black tabular-nums">{savings.percentReduction.toFixed(0)}%</p>
                <p className="text-[10px] font-bold text-ink/50 dark:text-white/50">lifetime reduction</p>
              </Card>
            </div>

            {/* ── Timeline ── */}
            <Card>
              <CardHeader>
                <CardTitle>Lifetime Timeline</CardTitle>
                <CardDescription>Cumulative CO₂ at your current rate</CardDescription>
              </CardHeader>
              <div className="relative">
                <div className="absolute left-4 top-0 bottom-0 w-0.5 bg-line dark:bg-white/10" />
                <div className="space-y-4 pl-10">
                  {milestones.map((m, i) => (
                    <div key={m.age} className="relative">
                      <div className={`absolute -left-[26px] top-1 h-4 w-4 rounded-full border-2 ${
                        i === 0 ? "bg-primary border-primary" : "bg-white dark:bg-[#1A2F2A] border-line dark:border-white/20"
                      }`} />
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="font-bold text-sm">{m.label}</p>
                          <p className="text-xs text-ink/50 dark:text-white/50">{m.age} years old</p>
                        </div>
                        <div className="text-right">
                          <p className="font-bold tabular-nums">{(m.cumulativeKg / 1000).toFixed(1)} tonnes</p>
                          <p className="text-[10px] text-ink/40 dark:text-white/40">cumulative CO₂</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </Card>

            {/* ── CTA ── */}
            <Card className="bg-gradient-to-br from-[#1B4332] to-[#2D6A4F] text-white text-center py-6">
              <span className="text-4xl block mb-3">💚</span>
              <h2 className="font-heading text-xl font-extrabold mb-2">
                For your children&apos;s world — start today
              </h2>
              <p className="text-white/70 text-sm max-w-md mx-auto mb-4">
                Every {goalPct}% reduction means {savings.tonnesSaved.toFixed(0)} fewer tonnes of CO₂ in the atmosphere.
                Small daily choices compound into a lasting legacy.
              </p>
              <Button className="bg-white text-primary-dark hover:bg-white/90 font-extrabold">
                📊 Go to Dashboard
              </Button>
              <p className="text-[10px] text-white/30 mt-4">
                * Based on IPCC TCRE model. Temperature contribution is your individual share of cumulative warming. Actual impacts depend on global collective action.
              </p>
            </Card>
          </>
        )}
      </section>
    </MotionPage>
  );
}
