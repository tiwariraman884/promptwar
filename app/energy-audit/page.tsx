"use client";

import { useState, useMemo, useEffect } from "react";
import { MotionPage } from "@/components/motion-page";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { APPLIANCES, STATE_ELECTRICITY_RATES, GRID_EMISSION_FACTOR, type ApplianceAuditEntry } from "@/lib/energy-audit-data";

const CATEGORIES = [
  { id: "cooling", label: "Cooling", emoji: "❄️" },
  { id: "heating", label: "Heating & Water", emoji: "🚿" },
  { id: "lighting", label: "Lighting", emoji: "💡" },
  { id: "kitchen", label: "Kitchen", emoji: "🍳" },
  { id: "laundry", label: "Laundry", emoji: "🧺" },
  { id: "entertainment", label: "Entertainment", emoji: "📺" },
  { id: "other", label: "Other", emoji: "🔧" },
] as const;

export default function EnergyAuditPage() {
  const [step, setStep] = useState(0);
  const [state, setState] = useState("Uttarakhand");
  const [entries, setEntries] = useState<Map<string, ApplianceAuditEntry>>(() => {
    const map = new Map<string, ApplianceAuditEntry>();
    APPLIANCES.forEach(a => {
      map.set(a.id, { applianceId: a.id, count: a.defaultCount, hoursPerDay: a.defaultHoursPerDay, starRating: a.starRatings?.[0]?.stars });
    });
    return map;
  });
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    try {
      const ob = localStorage.getItem("greenstep-onboarding");
      if (ob) {
        const data = JSON.parse(ob);
        if (data.state) setState(data.state || "Uttarakhand");
      }
    } catch {}
  }, []);

  const rate = STATE_ELECTRICITY_RATES[state] ?? 5.5;
  const currentCategory = CATEGORIES[step];
  const categoryAppliances = APPLIANCES.filter(a => a.category === currentCategory?.id);

  const updateEntry = (id: string, field: keyof ApplianceAuditEntry, value: number) => {
    setEntries(prev => {
      const next = new Map(prev);
      const entry = next.get(id);
      if (entry) next.set(id, { ...entry, [field]: value });
      return next;
    });
  };

  /* Results calculation */
  const results = useMemo(() => {
    const items: Array<{ name: string; emoji: string; count: number; kwhMonth: number; costMonth: number; co2Month: number; tips: string[] }> = [];
    let totalKwh = 0, totalCost = 0, totalCo2 = 0;

    entries.forEach((entry, id) => {
      if (entry.count === 0) return;
      const appliance = APPLIANCES.find(a => a.id === id);
      if (!appliance) return;

      let wattage = appliance.wattage;
      if (entry.starRating && appliance.starRatings) {
        const sr = appliance.starRatings.find(s => s.stars === entry.starRating);
        if (sr) wattage = sr.wattage;
      }

      const kwhMonth = (wattage * entry.hoursPerDay * entry.count * 30) / 1000;
      const costMonth = kwhMonth * rate;
      const co2Month = kwhMonth * GRID_EMISSION_FACTOR;

      totalKwh += kwhMonth;
      totalCost += costMonth;
      totalCo2 += co2Month;

      items.push({ name: appliance.name, emoji: appliance.emoji, count: entry.count, kwhMonth, costMonth, co2Month, tips: appliance.tips });
    });

    items.sort((a, b) => b.co2Month - a.co2Month);
    return { items, totalKwh, totalCost, totalCo2 };
  }, [entries, rate]);

  /* Indian average household: ~250 kWh/month */
  const avgMonthlyKwh = 250;
  const vsAvgPct = ((results.totalKwh - avgMonthlyKwh) / avgMonthlyKwh) * 100;

  /* ── Personalized Recommendations (rule engine) ── */
  interface Recommendation {
    tip: string;
    savingKg: number;
    effortLevel: "Easy" | "Medium" | "Hard";
  }

  const recommendations = useMemo(() => {
    const recs: Recommendation[] = [];

    // Rule 1: AC hours > 6
    const acEntry = entries.get("ac_split") || entries.get("ac_window");
    if (acEntry && acEntry.hoursPerDay > 6) {
      const savedKwh = ((acEntry.hoursPerDay - 6) * acEntry.count * (acEntry.starRating === 5 ? 1200 : 1800) * 30) / 1000;
      recs.push({
        tip: "Reduce AC usage to 6 hrs/day. Use a timer or smart thermostat.",
        savingKg: Math.round(savedKwh * GRID_EMISSION_FACTOR * 10) / 10,
        effortLevel: "Easy",
      });
    }

    // Rule 2: Old/high-wattage bulbs (not highest star rating)
    const bulbEntry = entries.get("led_bulb") || entries.get("tube_light");
    if (bulbEntry && bulbEntry.count > 0 && (!bulbEntry.starRating || bulbEntry.starRating < 5)) {
      recs.push({
        tip: "Switch to 5-star LED bulbs to save up to 60% lighting energy.",
        savingKg: Math.round(bulbEntry.count * 2.5 * 10) / 10,
        effortLevel: "Easy",
      });
    }

    // Rule 3: Electric geyser > 1 hr/day
    const geyserEntry = entries.get("geyser");
    if (geyserEntry && geyserEntry.hoursPerDay > 1) {
      const savedKwh = ((geyserEntry.hoursPerDay - 1) * geyserEntry.count * 2000 * 30) / 1000;
      recs.push({
        tip: "Limit geyser to 1 hr/day. Consider a solar water heater.",
        savingKg: Math.round(savedKwh * GRID_EMISSION_FACTOR * 10) / 10,
        effortLevel: "Medium",
      });
    }

    // Rule 4: High total kWh (above average)
    if (results.totalKwh > avgMonthlyKwh * 1.2) {
      recs.push({
        tip: "Your usage is 20%+ above Indian average. Audit standby power consumption.",
        savingKg: Math.round(((results.totalKwh - avgMonthlyKwh) * 0.1 * GRID_EMISSION_FACTOR) * 10) / 10,
        effortLevel: "Medium",
      });
    }

    // Rule 5: Washing machine in hot mode
    const washerEntry = entries.get("washing_machine");
    if (washerEntry && washerEntry.count > 0) {
      recs.push({
        tip: "Wash clothes in cold water to save ~40% washing energy.",
        savingKg: Math.round(washerEntry.count * 1.8 * 10) / 10,
        effortLevel: "Easy",
      });
    }

    // Rule 6: Solar recommendation
    if (results.totalKwh > 200) {
      recs.push({
        tip: "Install a 2kW rooftop solar panel. Govt subsidy available under PM Surya Ghar.",
        savingKg: Math.round(200 * 0.8 * GRID_EMISSION_FACTOR * 10) / 10,
        effortLevel: "Hard",
      });
    }

    // Sort by saving descending, take top 4
    recs.sort((a, b) => b.savingKg - a.savingKg);
    return recs.slice(0, 4);
  }, [entries, results.totalKwh, avgMonthlyKwh]);

  const totalSavingKg = recommendations.reduce((s, r) => s + r.savingKg, 0);
  const savingPercent = results.totalCo2 > 0 ? Math.min(100, Math.round((totalSavingKg / results.totalCo2) * 100)) : 0;
  const treesEquivalent = Math.round((totalSavingKg * 12) / 21 * 10) / 10; // 21 kg/tree/year FAO

  return (
    <MotionPage>
      <section className="space-y-5">

        {/* Hero */}
        <Card className="bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 text-center py-4">
            <span className="text-4xl mb-3 block">🏠</span>
            <h1 className="font-heading text-3xl font-extrabold mb-2">Home Energy Audit</h1>
            <p className="text-white/70 text-sm max-w-md mx-auto">
              Discover exactly where your electricity goes. Get personalized upgrade recommendations that save money AND CO₂.
            </p>
          </div>
        </Card>

        {!showResults ? (
          <>
            {/* State selector */}
            <Card>
              <CardHeader>
                <CardTitle>Your State</CardTitle>
                <CardDescription>Electricity rates vary by state</CardDescription>
              </CardHeader>
              <select value={state} onChange={e => setState(e.target.value)}
                className="w-full rounded-xl border border-line dark:border-white/10 bg-white dark:bg-white/5 px-3 py-3 text-sm font-bold">
                {Object.keys(STATE_ELECTRICITY_RATES).sort().map(s => (
                  <option key={s} value={s}>{s} (₹{STATE_ELECTRICITY_RATES[s]}/kWh)</option>
                ))}
              </select>
            </Card>

            {/* Step progress */}
            <div className="flex gap-1.5">
              {CATEGORIES.map((cat, i) => (
                <button key={cat.id} onClick={() => setStep(i)}
                  className={`flex-1 h-2 rounded-full transition ${i <= step ? "bg-primary" : "bg-line dark:bg-white/10"}`}
                  title={cat.label}
                />
              ))}
            </div>

            {/* Current category */}
            <Card>
              <CardHeader>
                <CardTitle>{currentCategory?.emoji} {currentCategory?.label}</CardTitle>
                <CardDescription>Step {step + 1} of {CATEGORIES.length} — set count, hours, and star rating</CardDescription>
              </CardHeader>

              <div className="space-y-4">
                {categoryAppliances.map(appliance => {
                  const entry = entries.get(appliance.id);
                  if (!entry) return null;
                  return (
                    <div key={appliance.id} className="rounded-xl border border-line dark:border-white/10 p-4">
                      <div className="flex items-center gap-2 mb-3">
                        <span className="text-xl">{appliance.emoji}</span>
                        <p className="font-bold text-sm flex-1">{appliance.name}</p>
                        <span className="text-xs text-ink/40 dark:text-white/60">{appliance.wattage}W</span>
                      </div>

                      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                        {/* Count */}
                        <div>
                          <label className="block text-[10px] font-bold text-ink/50 dark:text-white/50 mb-1">Count</label>
                          <div className="flex items-center gap-2">
                            <button onClick={() => updateEntry(appliance.id, "count", Math.max(0, entry.count - 1))}
                              className="h-8 w-8 rounded-lg border border-line dark:border-white/10 font-bold">−</button>
                            <span className="font-bold tabular-nums w-6 text-center">{entry.count}</span>
                            <button onClick={() => updateEntry(appliance.id, "count", entry.count + 1)}
                              className="h-8 w-8 rounded-lg border border-line dark:border-white/10 font-bold">+</button>
                          </div>
                        </div>

                        {/* Hours */}
                        <div>
                          <label className="block text-[10px] font-bold text-ink/50 dark:text-white/50 mb-1">Hours/day</label>
                          <input type="number" min={0} max={24} step={0.5} value={entry.hoursPerDay}
                            onChange={e => updateEntry(appliance.id, "hoursPerDay", Number(e.target.value))}
                            className="h-8 w-full rounded-lg border border-line dark:border-white/10 bg-white dark:bg-white/5 px-2 text-sm font-bold tabular-nums" />
                        </div>

                        {/* Star rating */}
                        {appliance.starRatings && (
                          <div>
                            <label className="block text-[10px] font-bold text-ink/50 dark:text-white/50 mb-1">Star Rating</label>
                            <select value={entry.starRating ?? 3}
                              onChange={e => updateEntry(appliance.id, "starRating", Number(e.target.value))}
                              className="h-8 w-full rounded-lg border border-line dark:border-white/10 bg-white dark:bg-white/5 px-2 text-sm font-bold">
                              {appliance.starRatings.map(sr => (
                                <option key={sr.stars} value={sr.stars}>{"⭐".repeat(sr.stars)} ({sr.wattage}W)</option>
                              ))}
                            </select>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="flex gap-3 mt-4">
                <Button variant="secondary" disabled={step === 0} onClick={() => setStep(s => s - 1)}>← Back</Button>
                {step < CATEGORIES.length - 1 ? (
                  <Button className="flex-1" onClick={() => setStep(s => s + 1)}>Next →</Button>
                ) : (
                  <Button className="flex-1" onClick={() => setShowResults(true)}>📊 See Results</Button>
                )}
              </div>
            </Card>
          </>
        ) : (
          <>
            {/* ── Results ── */}
            {/* Summary cards */}
            <div className="grid grid-cols-3 gap-3">
              <Card className="text-center p-4">
                <p className="text-[10px] font-bold text-ink/50 dark:text-white/50 uppercase">Monthly kWh</p>
                <p className="text-2xl font-black tabular-nums mt-1">{results.totalKwh.toFixed(0)}</p>
              </Card>
              <Card className="text-center p-4">
                <p className="text-[10px] font-bold text-ink/50 dark:text-white/50 uppercase">Monthly Bill</p>
                <p className="text-2xl font-black tabular-nums mt-1">₹{results.totalCost.toFixed(0)}</p>
              </Card>
              <Card className="text-center p-4">
                <p className="text-[10px] font-bold text-ink/50 dark:text-white/50 uppercase">Monthly CO₂</p>
                <p className="text-2xl font-black tabular-nums mt-1">{results.totalCo2.toFixed(0)} kg</p>
              </Card>
            </div>

            {/* vs average */}
            <Card className={`text-center py-4 ${vsAvgPct <= 0 ? "bg-green-50 dark:bg-green-900/10 border-green-200 dark:border-green-900/30" : "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-900/30"}`}>
              <Badge tone={vsAvgPct <= 0 ? "green" : "amber"}>
                {vsAvgPct <= 0 ? "✅ Below" : "⚠️ Above"} Indian average ({avgMonthlyKwh} kWh/month)
              </Badge>
              <p className="font-bold text-sm mt-2">Your home uses {Math.abs(vsAvgPct).toFixed(0)}% {vsAvgPct <= 0 ? "less" : "more"} than average</p>
            </Card>

            {/* Breakdown by appliance */}
            <Card>
              <CardHeader>
                <CardTitle>Energy Breakdown</CardTitle>
                <CardDescription>Sorted by highest CO₂ impact</CardDescription>
              </CardHeader>
              <div className="space-y-3">
                {results.items.slice(0, 10).map((item, i) => (
                  <div key={i} className="rounded-xl border border-line dark:border-white/10 p-3">
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-2">
                        <span className="text-lg">{item.emoji}</span>
                        <div>
                          <p className="font-bold text-sm">{item.name} ×{item.count}</p>
                          <p className="text-[10px] text-ink/40 dark:text-white/60">{item.kwhMonth.toFixed(1)} kWh/month</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-sm tabular-nums">₹{item.costMonth.toFixed(0)}</p>
                        <p className="text-[10px] text-ink/40 dark:text-white/60">{item.co2Month.toFixed(1)} kg CO₂</p>
                      </div>
                    </div>
                    {/* Progress bar showing share of total */}
                    <div className="h-1.5 rounded-full bg-line dark:bg-white/10 overflow-hidden">
                      <div className="h-full bg-primary rounded-full" style={{ width: `${(item.co2Month / results.totalCo2) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </Card>

            {/* Top 3 upgrade recommendations */}
            <Card>
              <CardHeader>
                <CardTitle>💡 Upgrade Recommendations</CardTitle>
                <CardDescription>Top ways to save money and CO₂</CardDescription>
              </CardHeader>
              <div className="space-y-3">
                {results.items.slice(0, 3).map((item, i) => (
                  <div key={i} className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                    <p className="font-bold text-sm text-primary-dark dark:text-primary mb-2">
                      #{i + 1} — {item.name}
                    </p>
                    <ul className="space-y-1">
                      {item.tips.map((tip, j) => (
                        <li key={j} className="flex items-start gap-2 text-sm text-ink/70 dark:text-white/70">
                          <span className="text-primary">✓</span> {tip}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            </Card>

            <div className="grid grid-cols-2 gap-3">
              <Button variant="secondary" onClick={() => { setShowResults(false); setStep(0); }}>← Edit Audit</Button>
              <Button onClick={() => {
                localStorage.setItem("greenstep-energy-audit", JSON.stringify({
                  date: new Date().toISOString().slice(0, 10), state, totalKwh: results.totalKwh,
                  totalCost: results.totalCost, totalCo2: results.totalCo2,
                }));
                alert("✅ Audit saved!");
              }}>💾 Save Audit</Button>
            </div>

            {/* ── Personalized Recommendations ── */}
            {recommendations.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>
                    🎯 Personalized Recommendations
                    <span className="block text-xs font-normal text-gray-400 dark:text-white/40 mt-0.5">व्यक्तिगत सुझाव</span>
                  </CardTitle>
                  <CardDescription>Based on your audit data, sorted by impact</CardDescription>
                </CardHeader>
                <div className="space-y-3">
                  {recommendations.map((rec, i) => (
                    <div key={i} className="rounded-xl bg-primary/5 border border-primary/20 p-4">
                      <div className="flex items-start justify-between gap-3">
                        <p className="font-bold text-sm text-primary-dark dark:text-primary flex-1">
                          #{i + 1} — {rec.tip}
                        </p>
                        <span className={`shrink-0 rounded-full px-2 py-0.5 text-[10px] font-bold ${
                          rec.effortLevel === "Easy" ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400"
                          : rec.effortLevel === "Medium" ? "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/20 dark:text-yellow-400"
                          : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"
                        }`}>
                          {rec.effortLevel}
                        </span>
                      </div>
                      <p className="text-xs text-ink/60 dark:text-white/50 mt-1">
                        Est. saving: <span className="font-bold text-primary">{rec.savingKg} kg CO₂/month</span>
                      </p>
                    </div>
                  ))}
                </div>
              </Card>
            )}

            {/* ── Estimated Total Savings ── */}
            {totalSavingKg > 0 && (
              <Card className="text-center py-5">
                <p className="text-xs font-bold uppercase tracking-wider text-ink/50 dark:text-white/50">
                  Potential Monthly Savings / संभावित बचत
                </p>
                <p className="text-3xl font-black tabular-nums mt-2">
                  {totalSavingKg.toFixed(1)} <span className="text-base font-bold text-ink/40 dark:text-white/40">kg CO₂/mo</span>
                </p>
                <p className="text-xs text-ink/50 dark:text-white/50 mt-1">
                  ≈ {treesEquivalent} trees planted/year 🌳
                </p>
                {/* Savings bar */}
                <div className="mt-4 mx-auto max-w-xs">
                  <div className="flex items-center justify-between text-[10px] font-bold text-ink/40 dark:text-white/40 mb-1">
                    <span>0%</span>
                    <span>{savingPercent}% of current emissions</span>
                    <span>100%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-line dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-primary to-[#52B788] rounded-full"
                      style={{ width: `${savingPercent}%`, transition: "width 0.4s ease" }}
                    />
                  </div>
                </div>
              </Card>
            )}
          </>
        )}
      </section>
    </MotionPage>
  );
}
