"use client";

import { useState, useMemo, useCallback } from "react";
import type { CarbonTwinProfile, EmissionBreakdown, EmissionCategoryKey } from "@/lib/types/carbon-twin-types";
import type { TransportModeV2 } from "@/lib/emission-factors-v2";
import { TREE_ABSORPTION_ANNUAL } from "@/lib/emission-factors-v2";
import { calcFullBreakdown } from "@/lib/carbon-engine-v2";
import { SimulatorSlider } from "./SimulatorSlider";

const VEHICLE_OPTIONS: { value: TransportModeV2; label: string }[] = [
  { value: "petrolCar", label: "Petrol Car" },
  { value: "dieselCar", label: "Diesel Car" },
  { value: "cngCar", label: "CNG Car" },
  { value: "electricCar", label: "Electric Car" },
  { value: "petrolBike", label: "Petrol Bike" },
  { value: "electricScooter", label: "Electric Scooter" },
  { value: "cngAuto", label: "CNG Auto" },
  { value: "electricAuto", label: "Electric Auto" },
  { value: "bus", label: "Bus" },
  { value: "metro", label: "Metro" },
  { value: "train", label: "Train" },
  { value: "walking", label: "Walking" },
  { value: "cycling", label: "Cycling" },
];

interface CarbonSimulatorProps {
  profile: CarbonTwinProfile;
}

export function CarbonSimulator({ profile }: CarbonSimulatorProps): JSX.Element {
  // Original breakdown — never changes
  const originalBreakdown = useMemo<EmissionBreakdown>(() => calcFullBreakdown(profile), [profile]);

  // Simulated values
  const [vehicle, setVehicle] = useState<TransportModeV2>(profile.travel.primaryVehicle);
  const [commuteKm, setCommuteKm] = useState(profile.travel.dailyCommuteKm);
  const [acHours, setAcHours] = useState(profile.energy.acHoursPerDay);
  const [acTemp, setAcTemp] = useState(profile.energy.acTemperatureSetting);
  const [lpgCylinders, setLpgCylinders] = useState(profile.energy.lpgCylindersPerMonth);
  const [meatServings, setMeatServings] = useState(profile.diet.meatServings);
  const [onlineOrders, setOnlineOrders] = useState(profile.shopping.monthlyOnlineOrders);
  const [wasteKg, setWasteKg] = useState(profile.waste.weeklyWasteKg);

  // Build simulated profile and recalculate
  const simBreakdown = useMemo<EmissionBreakdown>(() => {
    const simProfile: CarbonTwinProfile = {
      ...profile,
      travel: { ...profile.travel, primaryVehicle: vehicle, dailyCommuteKm: commuteKm },
      energy: { ...profile.energy, acHoursPerDay: acHours, acTemperatureSetting: acTemp, lpgCylindersPerMonth: lpgCylinders },
      diet: { ...profile.diet, meatServings: meatServings },
      shopping: { ...profile.shopping, monthlyOnlineOrders: onlineOrders },
      waste: { ...profile.waste, weeklyWasteKg: wasteKg },
    };
    return calcFullBreakdown(simProfile);
  }, [profile, vehicle, commuteKm, acHours, acTemp, lpgCylinders, meatServings, onlineOrders, wasteKg]);

  const reductionKg = originalBreakdown.totalMonthlyCO2Kg - simBreakdown.totalMonthlyCO2Kg;
  const reductionPercent = originalBreakdown.totalMonthlyCO2Kg > 0
    ? (reductionKg / originalBreakdown.totalMonthlyCO2Kg) * 100 : 0;
  const treesEquivalent = TREE_ABSORPTION_ANNUAL > 0 ? (reductionKg * 12) / TREE_ABSORPTION_ANNUAL : 0;

  // Per-slider impact: compare original category to simulated category
  const getImpact = (cat: EmissionCategoryKey): number => {
    const origCat = originalBreakdown.byCategory.find(c => c.category === cat);
    const simCat = simBreakdown.byCategory.find(c => c.category === cat);
    return (simCat?.monthlyCO2Kg ?? 0) - (origCat?.monthlyCO2Kg ?? 0);
  };

  const resetAll = useCallback((): void => {
    setVehicle(profile.travel.primaryVehicle);
    setCommuteKm(profile.travel.dailyCommuteKm);
    setAcHours(profile.energy.acHoursPerDay);
    setAcTemp(profile.energy.acTemperatureSetting);
    setLpgCylinders(profile.energy.lpgCylindersPerMonth);
    setMeatServings(profile.diet.meatServings);
    setOnlineOrders(profile.shopping.monthlyOnlineOrders);
    setWasteKg(profile.waste.weeklyWasteKg);
  }, [profile]);

  return (
    <div className="lg:grid lg:grid-cols-5 lg:gap-6">
      {/* Sliders Panel */}
      <div className="lg:col-span-3 space-y-3">
        {/* Vehicle Select */}
        <div className="p-4 rounded-xl border border-gray-700/50 bg-slate-900/40">
          <div className="mb-2">
            <span className="block text-sm font-medium text-gray-200">Daily Commute Mode</span>
            <span className="block text-xs text-gray-500">दैनिक वाहन</span>
          </div>
          <select
            value={vehicle}
            onChange={(e) => setVehicle(e.target.value as TransportModeV2)}
            className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 focus:border-emerald-500 focus:outline-none"
          >
            {VEHICLE_OPTIONS.map(v => (
              <option key={v.value} value={v.value}>{v.label}</option>
            ))}
          </select>
        </div>

        <SimulatorSlider label="Daily Commute Distance" labelHindi="दैनिक आवागमन दूरी" value={commuteKm} min={0} max={80} step={1} unit="km" originalValue={profile.travel.dailyCommuteKm} impactKg={getImpact("travel")} onChange={setCommuteKm} />
        <SimulatorSlider label="AC Hours Per Day" labelHindi="AC प्रतिदिन (घंटे)" value={acHours} min={0} max={16} step={0.5} unit="hrs" originalValue={profile.energy.acHoursPerDay} impactKg={getImpact("energy")} onChange={setAcHours} />
        <SimulatorSlider label="AC Temperature Setting" labelHindi="AC तापमान" value={acTemp} min={16} max={30} step={1} unit="°C" originalValue={profile.energy.acTemperatureSetting} impactKg={0} onChange={setAcTemp} />
        {profile.energy.cookingFuel === "lpg" && (
          <SimulatorSlider label="LPG Cylinders Per Month" labelHindi="मासिक LPG सिलेंडर" value={lpgCylinders} min={0} max={4} step={0.5} unit="cyl" originalValue={profile.energy.lpgCylindersPerMonth} impactKg={getImpact("energy")} onChange={setLpgCylinders} />
        )}
        <SimulatorSlider label="Meat Servings Per Week" labelHindi="साप्ताहिक मांस" value={meatServings} min={0} max={21} step={1} unit="servings" originalValue={profile.diet.meatServings} impactKg={getImpact("diet")} onChange={setMeatServings} />
        <SimulatorSlider label="Monthly Online Orders" labelHindi="मासिक ऑनलाइन ऑर्डर" value={onlineOrders} min={0} max={30} step={1} unit="orders" originalValue={profile.shopping.monthlyOnlineOrders} impactKg={getImpact("shopping")} onChange={setOnlineOrders} />
        <SimulatorSlider label="Weekly Waste" labelHindi="साप्ताहिक कचरा" value={wasteKg} min={0} max={20} step={0.5} unit="kg" originalValue={profile.waste.weeklyWasteKg} impactKg={getImpact("waste")} onChange={setWasteKg} />
      </div>

      {/* Sticky Result Panel */}
      <div className="lg:col-span-2 mt-6 lg:mt-0">
        <div className="lg:sticky lg:top-20 rounded-2xl border border-gray-700/50 bg-slate-900/60 backdrop-blur-xl p-5 space-y-4">
          {/* Before → After */}
          <div className="flex items-center justify-between">
            <div className="text-center">
              <span className="block text-xs text-gray-500 mb-1">BEFORE</span>
              <span className="text-2xl font-black text-gray-300">{originalBreakdown.totalMonthlyCO2Kg.toFixed(0)}</span>
              <span className="block text-xs text-gray-500">kg/month</span>
            </div>
            <span className="text-xl text-gray-600">→</span>
            <div className="text-center">
              <span className="block text-xs text-gray-500 mb-1">AFTER</span>
              <span className={`text-2xl font-black ${reductionKg > 0 ? "text-green-400" : reductionKg < 0 ? "text-red-400" : "text-gray-300"}`}>
                {simBreakdown.totalMonthlyCO2Kg.toFixed(0)}
              </span>
              <span className="block text-xs text-gray-500">kg/month</span>
            </div>
          </div>

          {/* Reduction Summary */}
          <div className={`rounded-xl p-3 text-center ${reductionKg > 0 ? "bg-green-900/20 border border-green-700/30" : reductionKg < 0 ? "bg-red-900/20 border border-red-700/30" : "bg-gray-800/50 border border-gray-700"}`}>
            <p className={`text-lg font-bold ${reductionKg > 0 ? "text-green-400" : reductionKg < 0 ? "text-red-400" : "text-gray-400"}`}>
              {reductionKg > 0 ? "↓" : reductionKg < 0 ? "↑" : "="} {Math.abs(reductionKg).toFixed(1)} kg ({Math.abs(reductionPercent).toFixed(1)}%)
            </p>
            {reductionKg > 0 && (
              <p className="text-xs text-green-500 mt-1">
                = {treesEquivalent.toFixed(0)} trees saved per year 🌳
              </p>
            )}
          </div>

          {/* Category Diff */}
          <div className="space-y-2">
            <span className="block text-xs font-medium text-gray-400 uppercase tracking-wider">Category Diff</span>
            {(["diet", "travel", "energy", "shopping", "waste"] as const).map((cat) => {
              const diff = getImpact(cat);
              const labels: Record<string, { en: string; hi: string }> = {
                diet: { en: "Diet", hi: "आहार" }, travel: { en: "Travel", hi: "यात्रा" },
                energy: { en: "Energy", hi: "ऊर्जा" }, shopping: { en: "Shopping", hi: "खरीदारी" },
                waste: { en: "Waste", hi: "कचरा" },
              };
              return (
                <div key={cat} className="flex justify-between items-center text-sm">
                  <div>
                    <span className="text-gray-300">{labels[cat].en}</span>
                    <span className="text-gray-600 text-xs ml-1">{labels[cat].hi}</span>
                  </div>
                  <span className={diff < 0 ? "text-green-400 font-medium" : diff > 0 ? "text-red-400 font-medium" : "text-gray-500"}>
                    {diff === 0 ? "same" : `${diff > 0 ? "+" : ""}${diff.toFixed(1)} kg`}
                    {diff < 0 ? " ↓" : diff > 0 ? " ↑" : ""}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Reset Button */}
          <button
            onClick={resetAll}
            className="w-full py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm hover:bg-gray-800 transition-colors"
          >
            🔄 Reset to Original
          </button>
        </div>
      </div>
    </div>
  );
}
