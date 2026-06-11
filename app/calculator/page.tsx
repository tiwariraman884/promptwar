"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  Bike,
  CarFront,
  Check,
  Cloud,
  Leaf,
  Recycle,
  ShoppingBag,
  TrainFront,
  Utensils,
  Wifi,
  Zap
} from "lucide-react";
import { QuantityStepper } from "@/components/calculator/quantity-stepper";
import { MotionPage } from "@/components/motion-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  calculateDiet,
  calculateDigital,
  calculateEnergy,
  calculateShopping,
  calculateTransport,
  calculateWaste,
  type DietInput,
  type DigitalInput,
  type EnergyInput,
  type ShoppingInput,
  type TransportInput,
  type WasteInput
} from "@/lib/calculator-engine";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type DietType,
  type EmissionCategory,
  type ShoppingItem,
  type TransportMode
} from "@/lib/emission-factors";
import { cn, formatKg } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

const tabs: Array<{
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

const transportModes: Array<{
  mode: TransportMode;
  label: string;
  icon: LucideIcon;
}> = [
  { mode: "petrol_car", label: "Petrol car", icon: CarFront },
  { mode: "diesel_car", label: "Diesel car", icon: CarFront },
  { mode: "two_wheeler_petrol", label: "Petrol 2W", icon: Bike },
  { mode: "two_wheeler_ev", label: "EV 2W", icon: Bike },
  { mode: "bus_diesel", label: "Bus", icon: TrainFront },
  { mode: "metro_rail", label: "Metro", icon: TrainFront },
  { mode: "auto_cng", label: "Auto CNG", icon: CarFront },
  { mode: "train_ir", label: "Train", icon: TrainFront },
  { mode: "flight_domestic", label: "Domestic flight", icon: Cloud },
  { mode: "flight_intl", label: "Intl flight", icon: Cloud }
];

const shoppingItems: Array<{ item: ShoppingItem; label: string }> = [
  { item: "smartphone", label: "Smartphone" },
  { item: "laptop", label: "Laptop" },
  { item: "clothing_item", label: "Fast fashion" },
  { item: "clothing_sustainable", label: "Sustainable clothing" },
  { item: "appliance_large", label: "Large appliance" }
];

function FieldLabel({
  children,
  value
}: {
  children: ReactNode;
  value?: ReactNode;
}) {
  return (
    <div className="mb-2 flex min-h-8 items-center justify-between gap-3">
      <label className="text-sm font-bold text-ink/70 dark:text-white/70">
        {children}
      </label>
      {value && <span className="text-sm font-extrabold text-primary-dark dark:text-primary-light">{value}</span>}
    </div>
  );
}

export default function CalculatorPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as EmissionCategory | null;
  const [category, setCategory] = useState<EmissionCategory>(
    initialCategory && CATEGORY_ORDER.includes(initialCategory)
      ? initialCategory
      : "transport"
  );
  const [savedMessage, setSavedMessage] = useState("");

  const [transportMode, setTransportMode] = useState<TransportMode>("metro_rail");
  const [distanceKm, setDistanceKm] = useState(12);
  const [frequency, setFrequency] = useState(1);

  const [energyUnit, setEnergyUnit] = useState<"kwh" | "bill">("kwh");
  const [gridKwh, setGridKwh] = useState(120);
  const [billAmount, setBillAmount] = useState(900);
  const [lpgCylinders, setLpgCylinders] = useState(1);
  const [hasSolar, setHasSolar] = useState(false);

  const [dietType, setDietType] = useState<DietType>("vegetarian");
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [dairyLitres, setDairyLitres] = useState(0.5);
  const [localProduce, setLocalProduce] = useState(true);

  const [shopping, setShopping] = useState<Partial<Record<ShoppingItem, number>>>({
    clothing_item: 1
  });

  const [wasteKg, setWasteKg] = useState(5);
  const [recyclingPercent, setRecyclingPercent] = useState(30);
  const [compostingPercent, setCompostingPercent] = useState(15);

  const [streamingHours, setStreamingHours] = useState(2);
  const [videoCallHours, setVideoCallHours] = useState(1);
  const [emails, setEmails] = useState(12);
  const [cloudGb, setCloudGb] = useState(50);

  useEffect(() => {
    if (initialCategory && CATEGORY_ORDER.includes(initialCategory)) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  const activeInput = useMemo(() => {
    if (category === "transport") {
      return {
        mode: transportMode,
        distanceKm,
        frequency
      } satisfies TransportInput;
    }
    if (category === "energy") {
      return {
        gridKwh: energyUnit === "kwh" ? gridKwh : undefined,
        billAmountInr: energyUnit === "bill" ? billAmount : undefined,
        lpgCylinders,
        hasSolar
      } satisfies EnergyInput;
    }
    if (category === "diet") {
      return {
        dietType,
        days: 1,
        mealsPerDay,
        dairyLitres,
        localProduce
      } satisfies DietInput;
    }
    if (category === "shopping") {
      return {
        items: shopping
      } satisfies ShoppingInput;
    }
    if (category === "waste") {
      return {
        totalKgPerWeek: wasteKg,
        recyclingPercent,
        compostingPercent
      } satisfies WasteInput;
    }
    return {
      hours: {
        video_streaming_hd: streamingHours,
        video_call: videoCallHours
      },
      emailsWithAttachment: emails,
      cloudStorageGbMonths: cloudGb
    } satisfies DigitalInput;
  }, [
    billAmount,
    category,
    cloudGb,
    compostingPercent,
    dairyLitres,
    dietType,
    distanceKm,
    emails,
    energyUnit,
    frequency,
    gridKwh,
    hasSolar,
    localProduce,
    lpgCylinders,
    mealsPerDay,
    recyclingPercent,
    shopping,
    streamingHours,
    transportMode,
    videoCallHours,
    wasteKg
  ]);

  const result = useMemo(() => {
    switch (category) {
      case "transport":
        return calculateTransport(activeInput as TransportInput);
      case "energy":
        return calculateEnergy(activeInput as EnergyInput);
      case "diet":
        return calculateDiet(activeInput as DietInput);
      case "shopping":
        return calculateShopping(activeInput as ShoppingInput);
      case "waste":
        return calculateWaste(activeInput as WasteInput);
      case "digital":
        return calculateDigital(activeInput as DigitalInput);
    }
  }, [activeInput, category]);

  // TypeScript will infer that the switch may be missing a return.
  // For our category union, all cases are covered, but we harden runtime output.
  const safeKgCo2e = result?.kgCo2e ?? 0;
  const safeDrivingKm = result?.comparison.drivingKm ?? 0;
  const safeTreesNeededYear = result?.comparison.treesNeededYear ?? 0;

  const saveEntry = async () => {
    setSavedMessage("");

    const response = await fetch("/api/entries", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        category,
        input: activeInput,
        notes: "Logged from calculator"
      })
    });
    const payload = await response.json();
    setSavedMessage(
      payload.error
        ? payload.error
        : `Saved ${formatKg(payload.data.calculation.kgCo2e)} and added eco-coins.`
    );
  };

  const updateShopping = (item: ShoppingItem, value: number) => {
    setShopping((current) => ({
      ...current,
      [item]: Math.max(0, value)
    }));
  };

  return (
    <MotionPage>
      <section className="space-y-5">
        <div>
          <Badge>Calculator</Badge>
          <h1 className="mt-3 font-heading text-3xl font-extrabold text-primary-dark dark:text-white">
            Log a carbon entry
          </h1>
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2" role="tablist">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const active = category === tab.category;
            return (
              <button
                aria-selected={active}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-pill border px-4 text-sm font-bold transition",
                  active
                    ? "border-primary bg-primary text-white"
                    : "border-line bg-white text-ink hover:border-primary dark:border-white/10 dark:bg-white/5 dark:text-white"
                )}
                key={tab.category}
                onClick={() => setCategory(tab.category)}
                role="tab"
                type="button"
              >
                <Icon aria-hidden size={18} />
                {CATEGORY_LABELS[tab.category]}
              </button>
            );
          })}
        </div>

        <Card className="pb-28">
          <CardHeader>
            <CardTitle>{CATEGORY_LABELS[category]}</CardTitle>
          </CardHeader>

          {category === "transport" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {transportModes.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      className={cn(
                        "min-h-16 rounded-card border p-3 text-left text-sm font-bold transition",
                        transportMode === item.mode
                          ? "border-primary bg-primary-light text-primary-dark"
                          : "border-line bg-white text-ink hover:border-primary dark:border-white/10 dark:bg-white/5 dark:text-white"
                      )}
                      key={item.mode}
                      onClick={() => setTransportMode(item.mode)}
                      type="button"
                    >
                      <Icon aria-hidden className="mb-2" size={18} />
                      {item.label}
                    </button>
                  );
                })}
              </div>
              <div>
                <FieldLabel value={`${distanceKm} km`}>Distance</FieldLabel>
                <input
                  aria-label="Distance in kilometres"
                  className="h-11 w-full"
                  max={2000}
                  min={1}
                  onChange={(event) => setDistanceKm(Number(event.target.value))}
                  type="range"
                  value={distanceKm}
                />
                <Input
                  aria-label="Distance number"
                  min={1}
                  onChange={(event) => setDistanceKm(Number(event.target.value))}
                  type="number"
                  value={distanceKm}
                />
              </div>
              <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
                Frequency
                <select
                  className="mt-2 min-h-11 w-full rounded-card border border-line bg-white px-3 text-sm text-ink dark:border-white/10 dark:bg-white/5 dark:text-white"
                  onChange={(event) => setFrequency(Number(event.target.value))}
                  value={frequency}
                >
                  <option value={1}>Once</option>
                  <option value={2}>Round trip</option>
                  <option value={5}>5x weekly</option>
                  <option value={22}>22x monthly commute</option>
                </select>
              </label>
            </div>
          )}

          {category === "energy" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2">
                <button
                  className={cn(
                    "min-h-12 rounded-pill border font-bold",
                    energyUnit === "kwh"
                      ? "border-primary bg-primary text-white"
                      : "border-line dark:border-white/10"
                  )}
                  onClick={() => setEnergyUnit("kwh")}
                  type="button"
                >
                  kWh
                </button>
                <button
                  className={cn(
                    "min-h-12 rounded-pill border font-bold",
                    energyUnit === "bill"
                      ? "border-primary bg-primary text-white"
                      : "border-line dark:border-white/10"
                  )}
                  onClick={() => setEnergyUnit("bill")}
                  type="button"
                >
                  ₹ bill
                </button>
              </div>
              {energyUnit === "kwh" ? (
                <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
                  Electricity units
                  <Input
                    className="mt-2"
                    min={0}
                    onChange={(event) => setGridKwh(Number(event.target.value))}
                    type="number"
                    value={gridKwh}
                  />
                </label>
              ) : (
                <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
                  Electricity bill amount
                  <Input
                    className="mt-2"
                    min={0}
                    onChange={(event) => setBillAmount(Number(event.target.value))}
                    type="number"
                    value={billAmount}
                  />
                </label>
              )}
              <QuantityStepper label="LPG cylinders" onChange={setLpgCylinders} value={lpgCylinders} />
              <button
                aria-pressed={hasSolar}
                className={cn(
                  "flex min-h-14 w-full items-center justify-between rounded-card border px-4 text-left font-bold",
                  hasSolar
                    ? "border-primary bg-primary-light text-primary-dark"
                    : "border-line bg-white text-ink dark:border-white/10 dark:bg-white/5 dark:text-white"
                )}
                onClick={() => setHasSolar((value) => !value)}
                type="button"
              >
                Solar rooftop / green supply
                {hasSolar && <Check aria-hidden size={20} />}
              </button>
            </div>
          )}

          {category === "diet" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {[
                  ["vegan", "Vegan"],
                  ["vegetarian", "Vegetarian"],
                  ["non_veg_chicken", "Chicken"],
                  ["non_veg_mixed", "Mixed non-veg"],
                  ["non_veg_beef", "Beef"]
                ].map(([value, label]) => (
                  <button
                    className={cn(
                      "min-h-12 rounded-pill border px-3 text-sm font-bold",
                      dietType === value
                        ? "border-primary bg-primary text-white"
                        : "border-line bg-white text-ink dark:border-white/10 dark:bg-white/5 dark:text-white"
                    )}
                    key={value}
                    onClick={() => setDietType(value as DietType)}
                    type="button"
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div>
                <FieldLabel value={`${mealsPerDay} meals`}>Meal count</FieldLabel>
                <input
                  aria-label="Meals per day"
                  className="h-11 w-full"
                  max={5}
                  min={1}
                  onChange={(event) => setMealsPerDay(Number(event.target.value))}
                  type="range"
                  value={mealsPerDay}
                />
              </div>
              <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
                Dairy litres
                <Input
                  className="mt-2"
                  min={0}
                  onChange={(event) => setDairyLitres(Number(event.target.value))}
                  step={0.1}
                  type="number"
                  value={dairyLitres}
                />
              </label>
              <button
                aria-pressed={localProduce}
                className={cn(
                  "flex min-h-14 w-full items-center justify-between rounded-card border px-4 text-left font-bold",
                  localProduce
                    ? "border-primary bg-primary-light text-primary-dark"
                    : "border-line bg-white text-ink dark:border-white/10 dark:bg-white/5 dark:text-white"
                )}
                onClick={() => setLocalProduce((value) => !value)}
                type="button"
              >
                Locally sourced produce
                {localProduce && <Leaf aria-hidden size={20} />}
              </button>
            </div>
          )}

          {category === "shopping" && (
            <div className="grid gap-3">
              {shoppingItems.map((item) => (
                <QuantityStepper
                  key={item.item}
                  label={item.label}
                  onChange={(value) => updateShopping(item.item, value)}
                  value={shopping[item.item] ?? 0}
                />
              ))}
            </div>
          )}

          {category === "waste" && (
            <div className="space-y-5">
              <div>
                <FieldLabel value={`${wasteKg} kg/week`}>Waste generated</FieldLabel>
                <input
                  aria-label="Waste in kilograms per week"
                  className="h-11 w-full"
                  max={40}
                  min={0}
                  onChange={(event) => setWasteKg(Number(event.target.value))}
                  type="range"
                  value={wasteKg}
                />
              </div>
              <div>
                <FieldLabel value={`${recyclingPercent}%`}>Recycling</FieldLabel>
                <input
                  aria-label="Recycling percentage"
                  className="h-11 w-full"
                  max={100}
                  min={0}
                  onChange={(event) => setRecyclingPercent(Number(event.target.value))}
                  type="range"
                  value={recyclingPercent}
                />
              </div>
              <div>
                <FieldLabel value={`${compostingPercent}%`}>Composting</FieldLabel>
                <input
                  aria-label="Composting percentage"
                  className="h-11 w-full"
                  max={100}
                  min={0}
                  onChange={(event) => setCompostingPercent(Number(event.target.value))}
                  type="range"
                  value={compostingPercent}
                />
              </div>
            </div>
          )}

          {category === "digital" && (
            <div className="space-y-5">
              <div>
                <FieldLabel value={`${streamingHours} hr/day`}>HD streaming</FieldLabel>
                <input
                  aria-label="HD streaming hours"
                  className="h-11 w-full"
                  max={8}
                  min={0}
                  onChange={(event) => setStreamingHours(Number(event.target.value))}
                  step={0.5}
                  type="range"
                  value={streamingHours}
                />
              </div>
              <div>
                <FieldLabel value={`${videoCallHours} hr/day`}>Video calls</FieldLabel>
                <input
                  aria-label="Video call hours"
                  className="h-11 w-full"
                  max={8}
                  min={0}
                  onChange={(event) => setVideoCallHours(Number(event.target.value))}
                  step={0.5}
                  type="range"
                  value={videoCallHours}
                />
              </div>
              <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
                Emails with attachments
                <Input
                  className="mt-2"
                  min={0}
                  onChange={(event) => setEmails(Number(event.target.value))}
                  type="number"
                  value={emails}
                />
              </label>
              <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
                Cloud storage GB-months
                <Input
                  className="mt-2"
                  min={0}
                  onChange={(event) => setCloudGb(Number(event.target.value))}
                  type="number"
                  value={cloudGb}
                />
              </label>
            </div>
          )}
        </Card>

        <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-2xl px-4 md:bottom-6">
          <div className="rounded-card border border-line bg-white p-4 shadow-soft dark:border-white/10 dark:bg-[#10231F]">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-ink/55 dark:text-white/55">
                  This entry
                </p>
                <p className="font-heading text-3xl font-extrabold text-primary-dark dark:text-primary-light">
                  {safeKgCo2e.toFixed(1)} kgCO2e
                </p>
                <p className="text-sm text-ink/65 dark:text-white/65">
                  = driving {safeDrivingKm.toFixed(0)} km or{" "}
                  {safeTreesNeededYear.toFixed(1)} trees for a year
                </p>

              </div>
              <Button onClick={saveEntry} type="button">

                <Check aria-hidden size={18} />
                Save entry
              </Button>
            </div>
            {savedMessage && (
              <p className="mt-3 rounded-card bg-primary-light p-3 text-sm font-bold text-primary-dark">
                {savedMessage}
              </p>
            )}
          </div>
        </div>
      </section>
    </MotionPage>
  );
}
