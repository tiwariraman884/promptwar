"use client";

import type { ReactNode } from "react";
import { useSearchParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  Bike,
  CarFront,
  Check,
  ChevronDown,
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
import { Skeleton } from "@/components/ui/skeleton";
import { showSettingsToast } from "@/components/settings/SettingsToast";
import {
  calculateDiet,
  calculateDigital,
  calculateEnergy,
  calculateEvents,
  calculateFoodDelivery,
  calculatePet,
  calculateShopping,
  calculateTransport,
  calculateWaste,
  calculateWater,
  type DietInput,
  type DigitalInput,
  type EnergyInput,
  type EventsInput,
  type FoodDeliveryInput,
  type PetInput,
  type ShoppingInput,
  type TransportInput,
  type WasteInput,
  type WaterInput
} from "@/lib/calculator-engine";
import {
  CATEGORY_LABELS,
  CATEGORY_ORDER,
  type DietType,
  type EmissionCategory,
  type EventCateringType,
  type PetType,
  type ShoppingItem,
  type TransportMode,
  type WaterSource
} from "@/lib/emission-factors";
import { cn, formatKg } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

/* ─── Category tabs (all 10!) ─── */
const tabs: Array<{
  category: EmissionCategory;
  icon: LucideIcon;
  emoji: string;
  tip: string;
}> = [
  { category: "transport", icon: CarFront, emoji: "🚗", tip: "Commute & travel" },
  { category: "energy", icon: Zap, emoji: "⚡", tip: "Electricity & gas" },
  { category: "diet", icon: Utensils, emoji: "🍽️", tip: "Food & dairy" },
  { category: "shopping", icon: ShoppingBag, emoji: "🛍️", tip: "Products & devices" },
  { category: "waste", icon: Recycle, emoji: "♻️", tip: "Trash & recycling" },
  { category: "digital", icon: Wifi, emoji: "💻", tip: "Streaming & cloud" },
  { category: "food_delivery", icon: CarFront, emoji: "🛵", tip: "Online orders" },
  { category: "water", icon: Zap, emoji: "💧", tip: "Daily water use" },
  { category: "pet", icon: Leaf, emoji: "🐾", tip: "Pet ownership" },
  { category: "events", icon: Zap, emoji: "🎉", tip: "Events & parties" },
];

const transportModes: Array<{
  mode: TransportMode;
  label: string;
  icon: LucideIcon;
  emoji: string;
}> = [
  { mode: "petrol_car", label: "Petrol Car", icon: CarFront, emoji: "⛽" },
  { mode: "diesel_car", label: "Diesel Car", icon: CarFront, emoji: "🛢️" },
  { mode: "two_wheeler_petrol", label: "Petrol 2W", icon: Bike, emoji: "🏍️" },
  { mode: "two_wheeler_ev", label: "EV 2W", icon: Bike, emoji: "🔋" },
  { mode: "bus_diesel", label: "Bus", icon: TrainFront, emoji: "🚌" },
  { mode: "metro_rail", label: "Metro", icon: TrainFront, emoji: "🚇" },
  { mode: "auto_cng", label: "Auto CNG", icon: CarFront, emoji: "🛺" },
  { mode: "train_ir", label: "Train", icon: TrainFront, emoji: "🚂" },
  { mode: "flight_domestic", label: "Domestic ✈️", icon: Cloud, emoji: "🛫" },
  { mode: "flight_intl", label: "Intl ✈️", icon: Cloud, emoji: "🌍" },
];

const shoppingItems: Array<{ item: ShoppingItem; label: string; emoji: string }> = [
  { item: "smartphone", label: "Smartphone", emoji: "📱" },
  { item: "laptop", label: "Laptop", emoji: "💻" },
  { item: "clothing_item", label: "Fast Fashion", emoji: "👕" },
  { item: "clothing_sustainable", label: "Sustainable Clothing", emoji: "🌿" },
  { item: "appliance_large", label: "Large Appliance", emoji: "🧊" },
];

/* ─── Reusable components ─── */

function SectionLabel({ children, icon, value }: { children: ReactNode; icon?: ReactNode; value?: ReactNode }) {
  return (
    <div className="mb-2.5 flex min-h-8 items-center justify-between gap-3">
      <label className="flex items-center gap-2 text-sm font-bold text-ink/70 dark:text-white/70">
        {icon}
        {children}
      </label>
      {value && (
        <span className="rounded-full bg-[#D1FAE5] dark:bg-[#2D6A4F]/30 px-2.5 py-0.5 text-xs font-extrabold text-[#2D6A4F] dark:text-[#52B788]">
          {value}
        </span>
      )}
    </div>
  );
}

function OptionCard({
  active,
  onClick,
  children,
  emoji,
  className = "",
}: {
  active: boolean;
  onClick: () => void;
  children: ReactNode;
  emoji?: string;
  className?: string;
}) {
  return (
    <button
      className={cn(
        "relative min-h-16 rounded-2xl border-2 p-3 text-left text-sm font-bold transition-all duration-200",
        active
          ? "border-[#2D6A4F] bg-gradient-to-br from-[#F0FDF4] to-[#D1FAE5] text-[#1B4332] shadow-md shadow-[#52B788]/10 dark:from-[#2D6A4F]/20 dark:to-[#2D6A4F]/10 dark:text-[#52B788] dark:border-[#52B788]"
          : "border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/[0.03] text-ink/80 dark:text-white/70 hover:border-[#52B788]/40 hover:bg-[#F8FAF5] dark:hover:bg-white/[0.05] hover:shadow-sm",
        className
      )}
      onClick={onClick}
      type="button"
    >
      {emoji && <span className="mb-1.5 block text-lg">{emoji}</span>}
      {children}
      {active && (
        <span className="absolute top-2 right-2 flex h-5 w-5 items-center justify-center rounded-full bg-[#2D6A4F] text-white text-[10px]">✓</span>
      )}
    </button>
  );
}

function PremiumSlider({
  label,
  value,
  onChange,
  min,
  max,
  step = 1,
  unit,
  icon,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step?: number;
  unit: string;
  icon?: ReactNode;
}) {
  const percent = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <SectionLabel icon={icon} value={`${value} ${unit}`}>{label}</SectionLabel>
      <div className="relative mt-1">
        <div className="h-2 w-full rounded-full bg-gray-100 dark:bg-white/10">
          <div
            className="h-full rounded-full bg-gradient-to-r from-[#2D6A4F] to-[#52B788] transition-all duration-150"
            style={{ width: `${percent}%` }}
          />
        </div>
        <input
          aria-label={label}
          className="absolute inset-0 h-full w-full cursor-pointer appearance-none bg-transparent [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:bg-[#2D6A4F] [&::-webkit-slider-thumb]:border-2 [&::-webkit-slider-thumb]:border-white [&::-webkit-slider-thumb]:shadow-md [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:cursor-pointer"
          max={max}
          min={min}
          onChange={(e) => onChange(Number(e.target.value))}
          step={step}
          type="range"
          value={value}
        />
      </div>
    </div>
  );
}

function ToggleButton({ active, onClick, children, icon }: { active: boolean; onClick: () => void; children: ReactNode; icon?: ReactNode }) {
  return (
    <button
      aria-pressed={active}
      className={cn(
        "flex min-h-14 w-full items-center justify-between rounded-2xl border-2 px-4 text-left font-bold transition-all duration-200",
        active
          ? "border-[#2D6A4F] bg-[#F0FDF4] text-[#1B4332] dark:bg-[#2D6A4F]/20 dark:text-[#52B788] dark:border-[#52B788]"
          : "border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/[0.03] text-ink/80 dark:text-white/70 hover:border-[#52B788]/40"
      )}
      onClick={onClick}
      type="button"
    >
      <span className="flex items-center gap-2 text-sm">{children}</span>
      {icon || (active && <Check aria-hidden size={18} className="text-[#2D6A4F] dark:text-[#52B788]" />)}
    </button>
  );
}

function StyledSelect({ label, value, onChange, children }: { label: string; value: string | number; onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void; children: ReactNode }) {
  return (
    <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
      {label}
      <div className="relative mt-2">
        <select
          className="min-h-12 w-full appearance-none rounded-2xl border-2 border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/[0.03] px-4 pr-10 text-sm font-semibold text-ink dark:text-white focus:border-[#2D6A4F] focus:outline-none transition"
          onChange={onChange}
          value={value}
        >
          {children}
        </select>
        <ChevronDown className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-[#6B7C6E]" size={16} />
      </div>
    </label>
  );
}

function StyledInput({ label, ...props }: { label: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <label className="block text-sm font-bold text-ink/70 dark:text-white/70">
      {label}
      <input
        {...props}
        className="mt-2 min-h-12 w-full rounded-2xl border-2 border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/[0.03] px-4 text-sm font-semibold text-ink dark:text-white focus:border-[#2D6A4F] focus:outline-none transition"
      />
    </label>
  );
}

/* ─── Impact comparison cards ─── */
function ImpactCard({ icon, value, label }: { icon: string; value: string; label: string }) {
  return (
    <div className="flex items-center gap-3 rounded-xl bg-white/60 dark:bg-white/[0.04] border border-[#D1FAE5]/60 dark:border-white/[0.06] p-3">
      <span className="text-xl">{icon}</span>
      <div>
        <p className="text-lg font-extrabold text-[#1B4332] dark:text-white tabular-nums">{value}</p>
        <p className="text-[11px] font-medium text-[#6B7C6E] dark:text-white/50">{label}</p>
      </div>
    </div>
  );
}

/* ─── Eco tips per category ─── */
const ECO_TIPS: Record<string, string> = {
  transport: "🌱 Metro emits 90% less CO₂ than a petrol car per km. Switch to public transport for your daily commute!",
  energy: "💡 LED bulbs save 75% energy. Turn off AC when room reaches desired temp.",
  diet: "🥗 A vegan diet produces 70% fewer emissions than beef-heavy diets.",
  shopping: "📱 A refurbished phone uses 80% less carbon than manufacturing a new one.",
  waste: "♻️ India generates 62M tonnes of waste yearly. Composting can reduce your contribution by 30%.",
  digital: "🔌 Streaming 4K uses 7x more energy than SD. Choose lower resolution when possible.",
  food_delivery: "🛵 Combine deliveries to reduce packaging waste. Choose nearby restaurants.",
  water: "💧 Fixing a leaky faucet saves ~35L/day. Use a bucket instead of shower to save 60%.",
  pet: "🐾 Feed locally-sourced pet food to cut transport emissions by 40%.",
  events: "🎉 Zero-waste events can reduce carbon footprint by up to 50%.",
};

/* ─── Main page ─── */
export default function CalculatorPage() {
  const searchParams = useSearchParams();
  const initialCategory = searchParams.get("category") as EmissionCategory | null;
  const allCategories = ["transport", "energy", "diet", "shopping", "waste", "digital", "food_delivery", "water", "pet", "events"] as const;
  const [category, setCategory] = useState<EmissionCategory>(
    initialCategory && allCategories.includes(initialCategory as any)
      ? initialCategory
      : "transport"
  );
  const [savedMessage, setSavedMessage] = useState("");
  const [saving, setSaving] = useState(false);
  const [notes, setNotes] = useState("");
  const [showBreakdown, setShowBreakdown] = useState(false);

  // Transport
  const [transportMode, setTransportMode] = useState<TransportMode>("metro_rail");
  const [distanceKm, setDistanceKm] = useState(12);
  const [frequency, setFrequency] = useState(1);

  // Energy
  const [energyUnit, setEnergyUnit] = useState<"kwh" | "bill">("kwh");
  const [gridKwh, setGridKwh] = useState(120);
  const [billAmount, setBillAmount] = useState(900);
  const [lpgCylinders, setLpgCylinders] = useState(1);
  const [hasSolar, setHasSolar] = useState(false);

  // Diet
  const [dietType, setDietType] = useState<DietType>("vegetarian");
  const [mealsPerDay, setMealsPerDay] = useState(3);
  const [dairyLitres, setDairyLitres] = useState(0.5);
  const [localProduce, setLocalProduce] = useState(true);

  // Shopping
  const [shopping, setShopping] = useState<Partial<Record<ShoppingItem, number>>>({
    clothing_item: 1,
  });

  // Waste
  const [wasteKg, setWasteKg] = useState(5);
  const [recyclingPercent, setRecyclingPercent] = useState(30);
  const [compostingPercent, setCompostingPercent] = useState(15);

  // Digital
  const [streamingHours, setStreamingHours] = useState(2);
  const [videoCallHours, setVideoCallHours] = useState(1);
  const [emails, setEmails] = useState(12);
  const [cloudGb, setCloudGb] = useState(50);

  // Food Delivery (NEW)
  const [ordersPerWeek, setOrdersPerWeek] = useState(3);
  const [avgDeliveryKm, setAvgDeliveryKm] = useState(3.5);
  const [packagingWaste, setPackagingWaste] = useState(true);

  // Water (NEW)
  const [waterLitres, setWaterLitres] = useState(150);
  const [waterSource, setWaterSource] = useState<WaterSource>("tap");
  const [hotWaterLitres, setHotWaterLitres] = useState(20);
  const [hotWaterMode, setHotWaterMode] = useState<"boiler" | "solar">("boiler");

  // Pet (NEW)
  const [petType, setPetType] = useState<PetType>("dog_medium");
  const [petCount, setPetCount] = useState(1);
  const [petFoodKg, setPetFoodKg] = useState(8);

  // Events (NEW)
  const [eventType, setEventType] = useState<"wedding" | "festival" | "office_party" | "concert">("office_party");
  const [attendees, setAttendees] = useState(50);
  const [cateringType, setCateringType] = useState<EventCateringType>("veg");
  const [generatorHours, setGeneratorHours] = useState(0);
  const [fireworks, setFireworks] = useState(false);
  const [zeroWaste, setZeroWaste] = useState(false);

  useEffect(() => {
    if (initialCategory && allCategories.includes(initialCategory as any)) {
      setCategory(initialCategory);
    }
  }, [initialCategory]);

  const activeInput = useMemo(() => {
    switch (category) {
      case "transport":
        return { mode: transportMode, distanceKm, frequency } satisfies TransportInput;
      case "energy":
        return {
          gridKwh: energyUnit === "kwh" ? gridKwh : undefined,
          billAmountInr: energyUnit === "bill" ? billAmount : undefined,
          lpgCylinders,
          hasSolar,
        } satisfies EnergyInput;
      case "diet":
        return { dietType, days: 1, mealsPerDay, dairyLitres, localProduce } satisfies DietInput;
      case "shopping":
        return { items: shopping } satisfies ShoppingInput;
      case "waste":
        return { totalKgPerWeek: wasteKg, recyclingPercent, compostingPercent } satisfies WasteInput;
      case "digital":
        return {
          hours: { video_streaming_hd: streamingHours, video_call: videoCallHours },
          emailsWithAttachment: emails,
          cloudStorageGbMonths: cloudGb,
        } satisfies DigitalInput;
      case "food_delivery":
        return { ordersPerWeek, avgDeliveryKm, packagingWaste } satisfies FoodDeliveryInput;
      case "water":
        return { litresPerDay: waterLitres, source: waterSource, hotWaterLitres, hotWaterMode } satisfies WaterInput;
      case "pet":
        return { petType, count: petCount, foodKgPerMonth: petFoodKg } satisfies PetInput;
      case "events":
        return { eventType, attendees, cateringType, generatorHours, fireworks, zeroWaste } satisfies EventsInput;
      default:
        return { mode: transportMode, distanceKm, frequency } satisfies TransportInput;
    }
  }, [
    category, transportMode, distanceKm, frequency, energyUnit, gridKwh, billAmount,
    lpgCylinders, hasSolar, dietType, mealsPerDay, dairyLitres, localProduce,
    shopping, wasteKg, recyclingPercent, compostingPercent, streamingHours,
    videoCallHours, emails, cloudGb, ordersPerWeek, avgDeliveryKm, packagingWaste,
    waterLitres, waterSource, hotWaterLitres, hotWaterMode, petType, petCount,
    petFoodKg, eventType, attendees, cateringType, generatorHours, fireworks, zeroWaste,
  ]);

  const result = useMemo(() => {
    try {
      switch (category) {
        case "transport": return calculateTransport(activeInput as TransportInput);
        case "energy": return calculateEnergy(activeInput as EnergyInput);
        case "diet": return calculateDiet(activeInput as DietInput);
        case "shopping": return calculateShopping(activeInput as ShoppingInput);
        case "waste": return calculateWaste(activeInput as WasteInput);
        case "digital": return calculateDigital(activeInput as DigitalInput);
        case "food_delivery": return calculateFoodDelivery(activeInput as FoodDeliveryInput);
        case "water": return calculateWater(activeInput as WaterInput);
        case "pet": return calculatePet(activeInput as PetInput);
        case "events": return calculateEvents(activeInput as EventsInput);
      }
    } catch { return null; }
  }, [activeInput, category]);

  const safeKgCo2e = result?.kgCo2e ?? 0;
  const safeDrivingKm = result?.comparison.drivingKm ?? 0;
  const safeTreesNeededYear = result?.comparison.treesNeededYear ?? 0;
  const safeSmartphones = result?.comparison.smartphonesCharged ?? 0;

  // Fix #10 — Guard ref to prevent duplicate submissions
  const savingRef = useRef(false);

  const saveEntry = async () => {
    if (savingRef.current) return;
    savingRef.current = true;
    setSaving(true);
    setSavedMessage("");

    try {
      const response = await fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ category, input: activeInput, notes: notes || "Logged from calculator" }),
      });
      const payload = await response.json();
      if (payload.error) {
        showSettingsToast(payload.error, "error");
      } else {
        showSettingsToast(`Saved ${formatKg(payload.data.calculation.kgCo2e)} — eco-coins added! 🌿`);
        setSavedMessage(`✅ Logged ${formatKg(payload.data.calculation.kgCo2e)}`);
      }
    } catch {
      showSettingsToast("Failed to save entry", "error");
    } finally {
      setSaving(false);
      savingRef.current = false;
    }
  };

  const updateShopping = (item: ShoppingItem, value: number) => {
    setShopping((current) => ({ ...current, [item]: Math.max(0, value) }));
  };

  // Impact level color
  const impactLevel = safeKgCo2e < 1 ? "low" : safeKgCo2e < 5 ? "moderate" : safeKgCo2e < 20 ? "high" : "very-high";
  const impactColors = {
    low: "from-emerald-400 to-emerald-600",
    moderate: "from-amber-400 to-amber-600",
    high: "from-orange-400 to-orange-600",
    "very-high": "from-red-400 to-red-600",
  };
  const impactLabels = { low: "Low Impact 🌿", moderate: "Moderate ⚡", high: "High Impact 🔥", "very-high": "Very High ⚠️" };

  const tabData = tabs.find((t) => t.category === category);

  return (
    <MotionPage>
      <section className="space-y-5">
        {/* ─── Premium Header ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
          <Badge className="bg-white/15 text-white backdrop-blur-sm" tone="dark">
            🌍 Carbon Calculator
          </Badge>
          <h1 className="mt-3 font-heading text-2xl font-extrabold leading-tight sm:text-3xl">
            Log a carbon entry
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Track your footprint across <span className="font-bold text-white/90">10 categories</span>. Every entry earns eco-coins.
          </p>
        </div>

        {/* ─── Category tabs ─── */}
        <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar" role="tablist">
          {tabs.map((tab) => {
            const active = category === tab.category;
            return (
              <button
                aria-selected={active}
                className={cn(
                  "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-sm font-bold transition-all duration-200",
                  active
                    ? "border-[#2D6A4F] bg-[#2D6A4F] text-white shadow-md shadow-[#2D6A4F]/20"
                    : "border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/[0.03] text-ink/70 dark:text-white/70 hover:border-[#52B788]/40 hover:shadow-sm"
                )}
                key={tab.category}
                onClick={() => { setCategory(tab.category); setSavedMessage(""); }}
                role="tab"
                type="button"
              >
                <span className="text-base">{tab.emoji}</span>
                {(CATEGORY_LABELS as Record<string, string>)[tab.category] || tab.category.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}
              </button>
            );
          })}
        </div>

        {/* ─── Eco tip ─── */}
        <div className="rounded-2xl border border-[#D1FAE5]/80 dark:border-[#2D6A4F]/40 bg-[#F0FDF4] dark:bg-[#2D6A4F]/15 px-4 py-3">
          <p className="text-sm text-[#2D6A4F] dark:text-[#B7E4C7]">
            {ECO_TIPS[category] || "🌱 Track your emissions to discover your impact."}
          </p>
        </div>

        {/* ─── Form Card ─── */}
        <Card className="pb-28 rounded-3xl border-2 border-[#E5E7EB]/80 dark:border-white/[0.08]">
          <CardHeader>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{tabData?.emoji}</span>
              <div>
                <CardTitle className="text-lg">{(CATEGORY_LABELS as Record<string, string>)[category] || category.replace("_", " ").replace(/\b\w/g, c => c.toUpperCase())}</CardTitle>
                <p className="text-xs text-[#6B7C6E] dark:text-white/50 mt-0.5">{tabData?.tip}</p>
              </div>
            </div>
          </CardHeader>

          {/* ═══ TRANSPORT ═══ */}
          {category === "transport" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 lg:grid-cols-4">
                {transportModes.map((item) => (
                  <OptionCard
                    active={transportMode === item.mode}
                    emoji={item.emoji}
                    key={item.mode}
                    onClick={() => setTransportMode(item.mode)}
                  >
                    {item.label}
                  </OptionCard>
                ))}
              </div>
              <PremiumSlider label="Distance" value={distanceKm} onChange={setDistanceKm} min={1} max={2000} unit="km" />
              <StyledInput label="Or type exact distance (km)" min={1} type="number" value={distanceKm} onChange={(e) => setDistanceKm(Number((e.target as HTMLInputElement).value))} />
              <StyledSelect label="Frequency" value={frequency} onChange={(e) => setFrequency(Number(e.target.value))}>
                <option value={1}>Once</option>
                <option value={2}>Round trip</option>
                <option value={5}>5x weekly</option>
                <option value={22}>22x monthly commute</option>
                <option value={30}>Daily (30x)</option>
              </StyledSelect>
            </div>
          )}

          {/* ═══ ENERGY ═══ */}
          {category === "energy" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2">
                <OptionCard active={energyUnit === "kwh"} onClick={() => setEnergyUnit("kwh")} emoji="⚡">kWh units</OptionCard>
                <OptionCard active={energyUnit === "bill"} onClick={() => setEnergyUnit("bill")} emoji="💰">₹ Bill amount</OptionCard>
              </div>
              {energyUnit === "kwh" ? (
                <StyledInput label="Electricity units (kWh)" min={0} type="number" value={gridKwh} onChange={(e) => setGridKwh(Number((e.target as HTMLInputElement).value))} />
              ) : (
                <StyledInput label="Electricity bill amount (₹)" min={0} type="number" value={billAmount} onChange={(e) => setBillAmount(Number((e.target as HTMLInputElement).value))} />
              )}
              <QuantityStepper label="LPG cylinders" onChange={setLpgCylinders} value={lpgCylinders} />
              <ToggleButton active={hasSolar} onClick={() => setHasSolar((v) => !v)}>
                ☀️ Solar rooftop / green supply
              </ToggleButton>
            </div>
          )}

          {/* ═══ DIET ═══ */}
          {category === "diet" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {([
                  ["vegan", "Vegan", "🌱"],
                  ["vegetarian", "Vegetarian", "🥗"],
                  ["non_veg_chicken", "Chicken", "🍗"],
                  ["non_veg_mixed", "Mixed Non-Veg", "🥩"],
                  ["non_veg_beef", "Beef", "🥩"],
                ] as const).map(([value, label, emoji]) => (
                  <OptionCard active={dietType === value} emoji={emoji} key={value} onClick={() => setDietType(value as DietType)}>
                    {label}
                  </OptionCard>
                ))}
              </div>
              <PremiumSlider label="Meals per day" value={mealsPerDay} onChange={setMealsPerDay} min={1} max={5} unit="meals" />
              <StyledInput label="Dairy consumption (litres)" min={0} step={0.1} type="number" value={dairyLitres} onChange={(e) => setDairyLitres(Number((e.target as HTMLInputElement).value))} />
              <ToggleButton active={localProduce} onClick={() => setLocalProduce((v) => !v)}>
                🥬 Locally sourced produce
              </ToggleButton>
            </div>
          )}

          {/* ═══ SHOPPING ═══ */}
          {category === "shopping" && (
            <div className="grid gap-3">
              {shoppingItems.map((item) => (
                <div key={item.item} className="flex min-h-16 items-center justify-between gap-3 rounded-2xl border-2 border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/[0.03] px-4">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xl">{item.emoji}</span>
                    <span className="text-sm font-bold">{item.label}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button
                      aria-label={`Decrease ${item.label}`}
                      onClick={() => updateShopping(item.item, (shopping[item.item] ?? 0) - 1)}
                      size="icon"
                      type="button"
                      variant="secondary"
                    >
                      <span className="text-base font-bold">−</span>
                    </Button>
                    <span className="w-8 text-center font-heading text-lg font-extrabold">
                      {shopping[item.item] ?? 0}
                    </span>
                    <Button
                      aria-label={`Increase ${item.label}`}
                      onClick={() => updateShopping(item.item, (shopping[item.item] ?? 0) + 1)}
                      size="icon"
                      type="button"
                      variant="secondary"
                    >
                      <span className="text-base font-bold">+</span>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* ═══ WASTE ═══ */}
          {category === "waste" && (
            <div className="space-y-5">
              <PremiumSlider label="Waste generated" value={wasteKg} onChange={setWasteKg} min={0} max={40} unit="kg/week" />
              <PremiumSlider label="Recycling" value={recyclingPercent} onChange={setRecyclingPercent} min={0} max={100} unit="%" />
              <PremiumSlider label="Composting" value={compostingPercent} onChange={setCompostingPercent} min={0} max={100} unit="%" />
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 p-3">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  ⚠️ Landfill: {Math.max(0, 100 - recyclingPercent - compostingPercent)}% — reducing this saves the most emissions.
                </p>
              </div>
            </div>
          )}

          {/* ═══ DIGITAL ═══ */}
          {category === "digital" && (
            <div className="space-y-5">
              <PremiumSlider label="HD streaming" value={streamingHours} onChange={setStreamingHours} min={0} max={8} step={0.5} unit="hr/day" />
              <PremiumSlider label="Video calls" value={videoCallHours} onChange={setVideoCallHours} min={0} max={8} step={0.5} unit="hr/day" />
              <StyledInput label="Emails with attachments" min={0} type="number" value={emails} onChange={(e) => setEmails(Number((e.target as HTMLInputElement).value))} />
              <StyledInput label="Cloud storage (GB-months)" min={0} type="number" value={cloudGb} onChange={(e) => setCloudGb(Number((e.target as HTMLInputElement).value))} />
            </div>
          )}

          {/* ═══ FOOD DELIVERY (NEW) ═══ */}
          {category === "food_delivery" && (
            <div className="space-y-5">
              <PremiumSlider label="Orders per week" value={ordersPerWeek} onChange={setOrdersPerWeek} min={0} max={20} unit="orders" />
              <PremiumSlider label="Avg delivery distance" value={avgDeliveryKm} onChange={(v) => setAvgDeliveryKm(Number(v.toFixed(1)))} min={0.5} max={15} step={0.5} unit="km" />
              <ToggleButton active={packagingWaste} onClick={() => setPackagingWaste((v) => !v)}>
                📦 Includes packaging waste
              </ToggleButton>
            </div>
          )}

          {/* ═══ WATER (NEW) ═══ */}
          {category === "water" && (
            <div className="space-y-5">
              <PremiumSlider label="Daily water usage" value={waterLitres} onChange={setWaterLitres} min={10} max={500} unit="litres" />
              <div className="grid grid-cols-2 gap-2">
                {([
                  ["tap", "Tap Water", "🚰"],
                  ["borewell", "Borewell", "⛏️"],
                  ["tanker", "Tanker", "🚛"],
                  ["rainwater", "Rainwater", "🌧️"],
                ] as const).map(([val, label, emoji]) => (
                  <OptionCard active={waterSource === val} emoji={emoji} key={val} onClick={() => setWaterSource(val as WaterSource)}>
                    {label}
                  </OptionCard>
                ))}
              </div>
              <PremiumSlider label="Hot water usage" value={hotWaterLitres} onChange={setHotWaterLitres} min={0} max={100} unit="litres" />
              <div className="grid grid-cols-2 gap-2">
                <OptionCard active={hotWaterMode === "boiler"} emoji="🔥" onClick={() => setHotWaterMode("boiler")}>Electric Boiler</OptionCard>
                <OptionCard active={hotWaterMode === "solar"} emoji="☀️" onClick={() => setHotWaterMode("solar")}>Solar Heater</OptionCard>
              </div>
            </div>
          )}

          {/* ═══ PET (NEW) ═══ */}
          {category === "pet" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
                {([
                  ["dog_medium", "Dog (Medium)", "🐕"],
                  ["dog_large", "Dog (Large)", "🐕‍🦺"],
                  ["cat", "Cat", "🐱"],
                  ["bird", "Bird", "🐦"],
                  ["fish_tank", "Fish Tank", "🐟"],
                  ["rabbit", "Rabbit", "🐰"],
                ] as const).map(([val, label, emoji]) => (
                  <OptionCard active={petType === val} emoji={emoji} key={val} onClick={() => setPetType(val as PetType)}>
                    {label}
                  </OptionCard>
                ))}
              </div>
              <QuantityStepper label="Number of pets" onChange={setPetCount} value={petCount} />
              <PremiumSlider label="Food consumption" value={petFoodKg} onChange={setPetFoodKg} min={0} max={30} unit="kg/month" />
            </div>
          )}

          {/* ═══ EVENTS (NEW) ═══ */}
          {category === "events" && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 gap-2">
                {([
                  ["wedding", "Wedding", "💒"],
                  ["festival", "Festival", "🪔"],
                  ["office_party", "Office Party", "🏢"],
                  ["concert", "Concert", "🎵"],
                ] as const).map(([val, label, emoji]) => (
                  <OptionCard active={eventType === val} emoji={emoji} key={val} onClick={() => setEventType(val as typeof eventType)}>
                    {label}
                  </OptionCard>
                ))}
              </div>
              <PremiumSlider label="Attendees" value={attendees} onChange={setAttendees} min={1} max={1000} unit="people" />
              <div className="grid grid-cols-2 gap-2">
                <OptionCard active={cateringType === "veg"} emoji="🥗" onClick={() => setCateringType("veg")}>Veg Catering</OptionCard>
                <OptionCard active={cateringType === "non_veg"} emoji="🍖" onClick={() => setCateringType("non_veg" as EventCateringType)}>Non-Veg Catering</OptionCard>
              </div>
              <PremiumSlider label="Generator hours" value={generatorHours} onChange={setGeneratorHours} min={0} max={24} unit="hours" />
              <ToggleButton active={fireworks} onClick={() => setFireworks((v) => !v)}>
                🎆 Fireworks / Pyrotechnics
              </ToggleButton>
              <ToggleButton active={zeroWaste} onClick={() => setZeroWaste((v) => !v)}>
                🌿 Zero-waste event
              </ToggleButton>
            </div>
          )}
        </Card>

        {/* ─── Fixed bottom results bar ─── */}
        <div className="fixed inset-x-0 bottom-20 z-40 mx-auto max-w-2xl px-4 md:bottom-6" aria-live="polite" role="status">
          <div className="rounded-3xl border-2 border-[#D1FAE5]/60 dark:border-white/10 bg-white/95 dark:bg-[#0B1815]/95 p-5 shadow-2xl backdrop-blur-xl">
            {/* Impact level badge */}
            <div className="mb-3 flex items-center justify-between">
              <span className={`inline-flex items-center gap-1.5 rounded-full bg-gradient-to-r ${impactColors[impactLevel]} px-3 py-1 text-xs font-bold text-white shadow-sm`}>
                {impactLabels[impactLevel]}
              </span>
              <button
                onClick={() => setShowBreakdown((v) => !v)}
                className="text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] hover:underline"
              >
                {showBreakdown ? "Hide breakdown ▲" : "Show breakdown ▼"}
              </button>
            </div>

            {/* Main result */}
            <div className="flex flex-wrap items-end justify-between gap-3">
              <div>
                <p className="text-xs font-bold uppercase text-ink/70 dark:text-white/55">
                  This entry
                </p>
                <p className="font-heading text-4xl font-extrabold text-[#1B4332] dark:text-white tabular-nums">
                  {safeKgCo2e.toFixed(1)} <span className="text-lg font-bold text-[#6B7C6E]">kgCO₂e</span>
                </p>
              </div>
              <Button
                className="rounded-2xl bg-[#2D6A4F] px-6 py-3 text-sm font-bold text-white shadow-lg shadow-[#2D6A4F]/20 hover:bg-[#1B4332] transition-all"
                disabled={saving}
                onClick={saveEntry}
                type="button"
              >
                {saving ? (
                  <>
                    <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                    Saving…
                  </>
                ) : (
                  <>
                    <Check aria-hidden size={18} />
                    Save entry
                  </>
                )}
              </Button>
            </div>

            {/* Comparison cards */}
            <div className="mt-3 grid grid-cols-3 gap-2">
              <ImpactCard icon="🚗" value={`${safeDrivingKm.toFixed(0)} km`} label="Driving equivalent" />
              <ImpactCard icon="🌳" value={safeTreesNeededYear.toFixed(1)} label="Trees for a year" />
              <ImpactCard icon="📱" value={safeSmartphones > 999 ? `${(safeSmartphones / 1000).toFixed(0)}k` : safeSmartphones.toFixed(0)} label="Phone charges" />
            </div>

            {/* Breakdown */}
            {showBreakdown && result?.breakdown && (
              <div className="mt-3 rounded-xl border border-[#D1FAE5]/60 dark:border-white/[0.06] bg-[#F8FAF5] dark:bg-white/[0.02] p-3 space-y-1.5">
                <p className="text-xs font-bold uppercase text-[#6B7C6E] mb-2">Emission Breakdown</p>
                {result.breakdown.filter(b => b.kgCo2e > 0).map((b) => (
                  <div key={b.label} className="flex items-center justify-between text-sm">
                    <span className="text-[#6B7C6E] dark:text-white/60 capitalize">{b.label.replace(/_/g, " ")}</span>
                    <span className="font-bold text-[#1B4332] dark:text-white tabular-nums">{b.kgCo2e.toFixed(2)} kg</span>
                  </div>
                ))}
              </div>
            )}

            {/* Notes */}
            <div className="mt-3">
              <input
                className="w-full rounded-xl border border-[#D1FAE5]/60 dark:border-white/10 bg-[#F8FAF5] dark:bg-white/[0.03] px-3 py-2 text-sm placeholder:text-[#6B7C6E]/60 focus:border-[#2D6A4F] focus:outline-none transition"
                placeholder="Add a note (optional)…"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {savedMessage && (
              <p className="mt-2 rounded-xl bg-[#D1FAE5] dark:bg-[#2D6A4F]/30 p-3 text-sm font-bold text-[#2D6A4F] dark:text-[#52B788]">
                {savedMessage}
              </p>
            )}
          </div>
        </div>
      </section>
    </MotionPage>
  );
}
