"use client";

import { useState, useEffect, useMemo } from "react";
import { MotionPage } from "@/components/motion-page";
import { Card, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { STATE_ELECTRICITY_RATES, GRID_EMISSION_FACTOR } from "@/lib/energy-audit-data";

export default function BillPredictPage() {
  const [state, setState] = useState("Uttarakhand");
  const [currentBill, setCurrentBill] = useState(2200);
  const [acHours, setAcHours] = useState(6);
  const [acReduce, setAcReduce] = useState(0);
  const [starUpgrade, setStarUpgrade] = useState(false);
  const [solarInstall, setSolarInstall] = useState(false);
  const [ledSwitch, setLedSwitch] = useState(0);

  useEffect(() => {
    try {
      const ob = localStorage.getItem("greenstep-onboarding");
      if (ob) {
        const data = JSON.parse(ob);
        if (data.state) setState(data.state || "Uttarakhand");
      }
      const audit = localStorage.getItem("greenstep-energy-audit");
      if (audit) {
        const data = JSON.parse(audit);
        if (data.totalCost) setCurrentBill(Math.round(data.totalCost));
      }
    } catch {}
  }, []);

  const rate = STATE_ELECTRICITY_RATES[state] ?? 5.5;
  const currentKwh = currentBill / rate;
  const currentCo2 = currentKwh * GRID_EMISSION_FACTOR;

  /* What-if calculations */
  const savings = useMemo(() => {
    let kwhSaved = 0;

    // AC reduction: 1.5T AC ≈ 1.5 kWh/hour
    kwhSaved += acReduce * 1.5 * 30;

    // Star upgrade: 3→5 star saves ~25% AC energy
    if (starUpgrade) {
      const acMonthlyKwh = acHours * 1.5 * 30;
      kwhSaved += acMonthlyKwh * 0.25;
    }

    // Solar: typical rooftop saves ~150 kWh/month for a small system
    if (solarInstall) kwhSaved += 150;

    // LED switch: each CFL→LED saves ~10W × hours × 30 days
    kwhSaved += ledSwitch * 10 * 6 * 30 / 1000;

    const costSaved = kwhSaved * rate;
    const co2Saved = kwhSaved * GRID_EMISSION_FACTOR;
    const newBill = Math.max(0, currentBill - costSaved);
    const newCo2 = Math.max(0, currentCo2 - co2Saved);

    return { kwhSaved, costSaved, co2Saved, newBill, newCo2 };
  }, [acReduce, starUpgrade, solarInstall, ledSwitch, rate, currentBill, currentCo2, acHours]);

  const savingPct = currentBill > 0 ? (savings.costSaved / currentBill) * 100 : 0;

  return (
    <MotionPage>
      <section className="space-y-5">

        {/* Hero */}
        <Card className="bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] text-white overflow-hidden relative">
          <div className="absolute inset-0 opacity-[0.05]" style={{ backgroundImage: "radial-gradient(#fff 1px, transparent 1px)", backgroundSize: "20px 20px" }} />
          <div className="relative z-10 text-center py-4">
            <span className="text-4xl mb-3 block">⚡</span>
            <h1 className="font-heading text-3xl font-extrabold mb-2">Bill Predictor</h1>
            <p className="text-white/70 text-sm max-w-md mx-auto">
              See how small changes reduce your electricity bill AND carbon footprint. Slide the controls to explore scenarios.
            </p>
          </div>
        </Card>

        {/* Current bill input */}
        <Card>
          <CardHeader>
            <CardTitle>Your Current Monthly Bill</CardTitle>
          </CardHeader>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-[10px] font-bold text-ink/50 dark:text-white/50 mb-1">State</label>
              <select value={state} onChange={e => setState(e.target.value)}
                className="w-full rounded-xl border border-line dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm font-bold">
                {Object.keys(STATE_ELECTRICITY_RATES).sort().map(s => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-[10px] font-bold text-ink/50 dark:text-white/50 mb-1">Monthly Bill (₹)</label>
              <input type="number" value={currentBill} onChange={e => setCurrentBill(Number(e.target.value))}
                className="w-full rounded-xl border border-line dark:border-white/10 bg-white dark:bg-white/5 px-3 py-2 text-sm font-bold tabular-nums" />
            </div>
          </div>
          <div className="grid grid-cols-3 gap-3 mt-3">
            <div className="text-center rounded-xl bg-white dark:bg-white/5 border border-line dark:border-white/10 p-3">
              <p className="text-[10px] font-bold text-ink/50 dark:text-white/50">kWh/month</p>
              <p className="font-black tabular-nums">{currentKwh.toFixed(0)}</p>
            </div>
            <div className="text-center rounded-xl bg-white dark:bg-white/5 border border-line dark:border-white/10 p-3">
              <p className="text-[10px] font-bold text-ink/50 dark:text-white/50">CO₂/month</p>
              <p className="font-black tabular-nums">{currentCo2.toFixed(0)} kg</p>
            </div>
            <div className="text-center rounded-xl bg-white dark:bg-white/5 border border-line dark:border-white/10 p-3">
              <p className="text-[10px] font-bold text-ink/50 dark:text-white/50">Rate</p>
              <p className="font-black tabular-nums">₹{rate}/kWh</p>
            </div>
          </div>
        </Card>

        {/* What-if sliders */}
        <Card>
          <CardHeader>
            <CardTitle>🔮 What If...</CardTitle>
            <CardDescription>Adjust these scenarios to see projected savings</CardDescription>
          </CardHeader>

          <div className="space-y-5">
            {/* AC hours */}
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>Current AC hours/day</span>
                <span className="text-primary tabular-nums">{acHours}h</span>
              </div>
              <input type="range" min={0} max={16} value={acHours} onChange={e => setAcHours(Number(e.target.value))}
                className="w-full h-2 rounded-full accent-primary" />
            </div>

            {/* AC reduction */}
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>❄️ Reduce AC by X hours/day</span>
                <span className="text-primary tabular-nums">{acReduce}h less</span>
              </div>
              <input type="range" min={0} max={Math.min(acHours, 8)} value={acReduce} onChange={e => setAcReduce(Number(e.target.value))}
                className="w-full h-2 rounded-full accent-primary" />
              {acReduce > 0 && (
                <p className="text-xs text-green-600 dark:text-green-400 font-bold mt-1">
                  → Save ₹{(acReduce * 1.5 * 30 * rate).toFixed(0)}/month and {(acReduce * 1.5 * 30 * GRID_EMISSION_FACTOR).toFixed(1)} kg CO₂
                </p>
              )}
            </div>

            {/* Star upgrade */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-line dark:border-white/10 cursor-pointer hover:border-primary transition">
              <input type="checkbox" checked={starUpgrade} onChange={e => setStarUpgrade(e.target.checked)}
                className="h-5 w-5 accent-primary rounded" />
              <div>
                <p className="font-bold text-sm">⭐ Upgrade AC to 5-star rating</p>
                <p className="text-xs text-ink/50 dark:text-white/50">Saves ~25% AC energy</p>
              </div>
            </label>

            {/* Solar */}
            <label className="flex items-center gap-3 p-3 rounded-xl border border-line dark:border-white/10 cursor-pointer hover:border-primary transition">
              <input type="checkbox" checked={solarInstall} onChange={e => setSolarInstall(e.target.checked)}
                className="h-5 w-5 accent-primary rounded" />
              <div>
                <p className="font-bold text-sm">☀️ Install rooftop solar (PM-Surya Ghar)</p>
                <p className="text-xs text-ink/50 dark:text-white/50">Saves ~150 kWh/month for a small 2kW system</p>
              </div>
            </label>

            {/* LED switch */}
            <div>
              <div className="flex justify-between text-sm font-bold mb-1">
                <span>💡 Replace CFL/incandescent with LED</span>
                <span className="text-primary tabular-nums">{ledSwitch} bulbs</span>
              </div>
              <input type="range" min={0} max={20} value={ledSwitch} onChange={e => setLedSwitch(Number(e.target.value))}
                className="w-full h-2 rounded-full accent-primary" />
            </div>
          </div>
        </Card>

        {/* Projected results */}
        {savings.costSaved > 0 && (
          <>
            <Card className="bg-gradient-to-r from-green-50 to-transparent dark:from-green-900/10 dark:to-transparent border-green-200 dark:border-green-900/30">
              <div className="text-center">
                <p className="text-xs font-bold text-green-600 dark:text-green-400 uppercase tracking-wide mb-2">💰 Projected Monthly Savings</p>
                <p className="text-5xl font-black text-green-600 dark:text-green-400 tabular-nums">₹{savings.costSaved.toFixed(0)}</p>
                <p className="text-sm text-ink/60 dark:text-white/60 mt-1">per month ({savingPct.toFixed(0)}% reduction)</p>
                <p className="text-sm font-bold text-green-600 dark:text-green-400 mt-2">
                  = ₹{(savings.costSaved * 12).toFixed(0)}/year saved
                </p>
              </div>
            </Card>

            <div className="grid grid-cols-3 gap-3">
              <Card className="text-center p-4">
                <p className="text-[10px] font-bold text-ink/50 dark:text-white/50">New Bill</p>
                <p className="text-xl font-black tabular-nums">₹{savings.newBill.toFixed(0)}</p>
              </Card>
              <Card className="text-center p-4">
                <p className="text-[10px] font-bold text-ink/50 dark:text-white/50">CO₂ Saved</p>
                <p className="text-xl font-black tabular-nums text-green-600 dark:text-green-400">{savings.co2Saved.toFixed(0)} kg</p>
              </Card>
              <Card className="text-center p-4">
                <p className="text-[10px] font-bold text-ink/50 dark:text-white/50">kWh Saved</p>
                <p className="text-xl font-black tabular-nums">{savings.kwhSaved.toFixed(0)}</p>
              </Card>
            </div>
          </>
        )}
      </section>
    </MotionPage>
  );
}
