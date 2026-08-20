"use client";

import { useState, useCallback } from "react";
import type {
  DietProfile,
  TravelProfile,
  EnergyProfile,
  ShoppingProfile,
  WasteProfile,
  CarbonTwinProfile,
} from "@/lib/types/carbon-twin-types";
import type { TransportModeV2 } from "@/lib/emission-factors-v2";
import { calcFullBreakdown } from "@/lib/carbon-engine-v2";
import { calcHealthScore } from "@/lib/health-score";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";

/* ─── Default Profile Values ─── */
const DEFAULT_DIET: DietProfile = {
  vegetarian: true, veganDays: 0, meatServings: 0,
  meatType: "chicken", dairyLitresPerWeek: 3, riceKgPerWeek: 2, localProduce: true,
};
const DEFAULT_TRAVEL: TravelProfile = {
  primaryVehicle: "bus", dailyCommuteKm: 10, flightsDomesticPerYear: 1,
  flightsIntlPerYear: 0, longDistanceTrainTripsPerYear: 2, avgFlightDistanceKm: 1000,
};
const DEFAULT_ENERGY: EnergyProfile = {
  monthlyElectricityKwh: 150, cookingFuel: "lpg", lpgCylindersPerMonth: 1,
  acUnits: 1, acHoursPerDay: 4, hasSolar: false, solarCapacityKw: 0, acTemperatureSetting: 24,
};
const DEFAULT_SHOPPING: ShoppingProfile = {
  monthlyOnlineOrders: 5, clothingItemsPerMonth: 1, electronicsPerYear: 1,
  usesClothBag: false, buysSecondHand: false,
};
const DEFAULT_WASTE: WasteProfile = {
  weeklyWasteKg: 4, composts: false, recyclesPaper: false,
  recyclesPlastic: false, ewasteKgPerYear: 2,
};

const VEHICLE_OPTIONS: { value: TransportModeV2; label: string; labelHindi: string }[] = [
  { value: "petrolCar", label: "Petrol Car", labelHindi: "पेट्रोल कार" },
  { value: "dieselCar", label: "Diesel Car", labelHindi: "डीजल कार" },
  { value: "cngCar", label: "CNG Car", labelHindi: "CNG कार" },
  { value: "electricCar", label: "Electric Car", labelHindi: "इलेक्ट्रिक कार" },
  { value: "petrolBike", label: "Petrol Bike", labelHindi: "पेट्रोल बाइक" },
  { value: "electricScooter", label: "Electric Scooter", labelHindi: "इलेक्ट्रिक स्कूटर" },
  { value: "cngAuto", label: "CNG Auto", labelHindi: "CNG ऑटो" },
  { value: "electricAuto", label: "Electric Auto", labelHindi: "इलेक्ट्रिक ऑटो" },
  { value: "bus", label: "Bus", labelHindi: "बस" },
  { value: "metro", label: "Metro", labelHindi: "मेट्रो" },
  { value: "train", label: "Train", labelHindi: "ट्रेन" },
  { value: "walking", label: "Walking", labelHindi: "पैदल" },
  { value: "cycling", label: "Cycling", labelHindi: "साइकिल" },
];

const STEP_LABELS = [
  { en: "Diet", hi: "आहार", emoji: "🥗" },
  { en: "Travel", hi: "यात्रा", emoji: "🚗" },
  { en: "Energy", hi: "ऊर्जा", emoji: "⚡" },
  { en: "Shopping", hi: "खरीदारी", emoji: "🛍️" },
  { en: "Waste", hi: "कचरा", emoji: "♻️" },
];

interface CarbonTwinSetupProps {
  existingProfile?: CarbonTwinProfile | null;
  userId: string;
  onComplete: () => void;
}

/* ── Reusable Form Controls ── */
function SliderField({
  label, labelHindi, value, min, max, step, unit, onChange, show = true,
}: {
  label: string; labelHindi: string; value: number; min: number; max: number;
  step: number; unit: string; onChange: (v: number) => void; show?: boolean;
}): JSX.Element | null {
  if (!show) return null;
  return (
    <div className="space-y-2">
      <div className="flex justify-between items-baseline">
        <div>
          <span className="block text-sm font-medium text-gray-200">{label}</span>
          <span className="block text-xs text-gray-500">{labelHindi}</span>
        </div>
        <span className="text-sm font-bold text-emerald-400">{value} {unit}</span>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
      <div className="flex justify-between text-xs text-gray-600">
        <span>{min}</span><span>{max}</span>
      </div>
    </div>
  );
}

function ToggleField({
  label, labelHindi, value, onChange,
}: {
  label: string; labelHindi: string; value: boolean; onChange: (v: boolean) => void;
}): JSX.Element {
  return (
    <button
      type="button"
      onClick={() => onChange(!value)}
      className="w-full flex items-center justify-between p-3 rounded-xl border border-gray-700 hover:border-emerald-600 transition-colors"
    >
      <div>
        <span className="block text-sm font-medium text-gray-200">{label}</span>
        <span className="block text-xs text-gray-500">{labelHindi}</span>
      </div>
      <div className={`w-12 h-6 rounded-full transition-colors flex items-center px-1 ${value ? "bg-emerald-500" : "bg-gray-600"}`}>
        <div className={`w-4 h-4 bg-white rounded-full transition-transform ${value ? "translate-x-6" : "translate-x-0"}`} />
      </div>
    </button>
  );
}

function SelectField({
  label, labelHindi, value, options, onChange, show = true,
}: {
  label: string; labelHindi: string; value: string;
  options: { value: string; label: string }[];
  onChange: (v: string) => void; show?: boolean;
}): JSX.Element | null {
  if (!show) return null;
  return (
    <div className="space-y-2">
      <div>
        <span className="block text-sm font-medium text-gray-200">{label}</span>
        <span className="block text-xs text-gray-500">{labelHindi}</span>
      </div>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 focus:border-emerald-500 focus:outline-none"
      >
        {options.map((o) => (
          <option key={o.value} value={o.value}>{o.label}</option>
        ))}
      </select>
    </div>
  );
}

function NumberField({
  label, labelHindi, value, min, max, helper, onChange, show = true,
}: {
  label: string; labelHindi: string; value: number; min: number; max: number;
  helper?: string; onChange: (v: number) => void; show?: boolean;
}): JSX.Element | null {
  if (!show) return null;
  return (
    <div className="space-y-2">
      <div>
        <span className="block text-sm font-medium text-gray-200">{label}</span>
        <span className="block text-xs text-gray-500">{labelHindi}</span>
      </div>
      <input
        type="number" min={min} max={max} value={value}
        onChange={(e) => onChange(Math.min(max, Math.max(min, parseInt(e.target.value) || 0)))}
        className="w-full p-3 bg-gray-800 border border-gray-700 rounded-xl text-sm text-gray-200 focus:border-emerald-500 focus:outline-none"
      />
      {helper && <p className="text-xs text-gray-500">{helper}</p>}
    </div>
  );
}

export function CarbonTwinSetup({ existingProfile, userId, onComplete }: CarbonTwinSetupProps): JSX.Element {
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [diet, setDiet] = useState<DietProfile>(existingProfile?.diet ?? DEFAULT_DIET);
  const [travel, setTravel] = useState<TravelProfile>(existingProfile?.travel ?? DEFAULT_TRAVEL);
  const [energy, setEnergy] = useState<EnergyProfile>(existingProfile?.energy ?? DEFAULT_ENERGY);
  const [shopping, setShopping] = useState<ShoppingProfile>(existingProfile?.shopping ?? DEFAULT_SHOPPING);
  const [waste, setWaste] = useState<WasteProfile>(existingProfile?.waste ?? DEFAULT_WASTE);
  const router = useRouter();

  const handleSubmit = useCallback(async (): Promise<void> => {
    setIsSubmitting(true);
    try {
      const profile: CarbonTwinProfile = {
        userId, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        diet, travel, energy, shopping, waste,
      };

      const breakdown = calcFullBreakdown(profile);
      const healthScore = calcHealthScore(breakdown);
      const yearMonth = new Date().toISOString().slice(0, 7);

      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await Promise.all([
          supabase.from("carbon_twin").upsert({
            user_id: userId, diet, travel, energy, shopping, waste, updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" }),
          supabase.from("emission_snapshots").upsert({
            user_id: userId, year_month: yearMonth,
            total_kg: breakdown.totalMonthlyCO2Kg,
            diet_kg: breakdown.byCategory.find(c => c.category === "diet")?.monthlyCO2Kg ?? 0,
            travel_kg: breakdown.byCategory.find(c => c.category === "travel")?.monthlyCO2Kg ?? 0,
            energy_kg: breakdown.byCategory.find(c => c.category === "energy")?.monthlyCO2Kg ?? 0,
            shopping_kg: breakdown.byCategory.find(c => c.category === "shopping")?.monthlyCO2Kg ?? 0,
            waste_kg: breakdown.byCategory.find(c => c.category === "waste")?.monthlyCO2Kg ?? 0,
            health_score: healthScore.overallScore,
          }, { onConflict: "user_id,year_month" }),
        ]);
      } else {
        throw new Error("Supabase is not configured. Carbon Twin setup now requires Supabase.");
      }
      onComplete();
      router.push("/dashboard");
    } catch (err) {
      console.error("Failed to save Carbon Twin:", err);
    } finally {
      setIsSubmitting(false);
    }
  }, [userId, diet, travel, energy, shopping, waste, onComplete, router]);

  const canGoNext = step < 4;
  const canGoBack = step > 0;
  const isLastStep = step === 4;

  return (
    <div className="max-w-lg mx-auto">
      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm font-medium text-gray-300">
            Step {step + 1} of 5 — {STEP_LABELS[step].emoji} {STEP_LABELS[step].en}
          </span>
          <span className="text-xs text-gray-500">{STEP_LABELS[step].hi}</span>
        </div>
        <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-emerald-500 to-green-400 rounded-full transition-all duration-500"
            style={{ width: `${((step + 1) / 5) * 100}%` }}
          />
        </div>
      </div>

      {/* Step Content */}
      <div className="rounded-2xl border border-gray-700/50 bg-slate-900/60 backdrop-blur-xl p-5 space-y-4">
        {step === 0 && (
          <>
            <ToggleField label="Are you vegetarian?" labelHindi="क्या आप शाकाहारी हैं?" value={diet.vegetarian} onChange={(v) => setDiet({ ...diet, vegetarian: v, meatServings: v ? 0 : diet.meatServings })} />
            <SliderField label="Meat servings per week" labelHindi="सप्ताह में मांस" value={diet.meatServings} min={0} max={21} step={1} unit="servings" onChange={(v) => setDiet({ ...diet, meatServings: v })} show={!diet.vegetarian} />
            <SelectField label="Primary meat type" labelHindi="मुख्य मांस प्रकार" value={diet.meatType} options={[{ value: "chicken", label: "Chicken" }, { value: "mutton", label: "Mutton" }, { value: "beef", label: "Beef" }, { value: "fish", label: "Fish" }, { value: "mixed", label: "Mixed" }]} onChange={(v) => setDiet({ ...diet, meatType: v as DietProfile["meatType"] })} show={!diet.vegetarian} />
            <SliderField label="Dairy (milk/curd/paneer) litres per week" labelHindi="साप्ताहिक दूध/दही/पनीर (लीटर)" value={diet.dairyLitresPerWeek} min={0} max={10} step={0.5} unit="L" onChange={(v) => setDiet({ ...diet, dairyLitresPerWeek: v })} />
            <SliderField label="Rice consumption per week" labelHindi="साप्ताहिक चावल (किग्रा)" value={diet.riceKgPerWeek} min={0} max={5} step={0.25} unit="kg" onChange={(v) => setDiet({ ...diet, riceKgPerWeek: v })} />
            <ToggleField label="Do you buy local/seasonal produce mostly?" labelHindi="क्या आप ज़्यादातर स्थानीय/मौसमी सब्ज़ियां खरीदते हैं?" value={diet.localProduce} onChange={(v) => setDiet({ ...diet, localProduce: v })} />
          </>
        )}

        {step === 1 && (
          <>
            <SelectField label="Primary vehicle" labelHindi="मुख्य वाहन" value={travel.primaryVehicle} options={VEHICLE_OPTIONS.map(v => ({ value: v.value, label: `${v.label} / ${v.labelHindi}` }))} onChange={(v) => setTravel({ ...travel, primaryVehicle: v as TransportModeV2 })} />
            <SliderField label="Daily commute km (one way)" labelHindi="दैनिक आवागमन (एक तरफ़)" value={travel.dailyCommuteKm} min={0} max={80} step={1} unit="km" onChange={(v) => setTravel({ ...travel, dailyCommuteKm: v })} />
            <NumberField label="Domestic flights per year" labelHindi="घरेलू उड़ानें/साल" value={travel.flightsDomesticPerYear} min={0} max={24} onChange={(v) => setTravel({ ...travel, flightsDomesticPerYear: v })} />
            <NumberField label="International flights per year" labelHindi="अंतर्राष्ट्रीय उड़ानें/साल" value={travel.flightsIntlPerYear} min={0} max={12} onChange={(v) => setTravel({ ...travel, flightsIntlPerYear: v })} />
            <SliderField label="Average flight distance (one-way)" labelHindi="औसत उड़ान दूरी (एक तरफ़)" value={travel.avgFlightDistanceKm} min={500} max={8000} step={100} unit="km" onChange={(v) => setTravel({ ...travel, avgFlightDistanceKm: v })} />
            <NumberField label="Long-distance train trips per year" labelHindi="लंबी दूरी ट्रेन यात्राएं/साल" value={travel.longDistanceTrainTripsPerYear} min={0} max={20} onChange={(v) => setTravel({ ...travel, longDistanceTrainTripsPerYear: v })} />
          </>
        )}

        {step === 2 && (
          <>
            <NumberField label="Monthly electricity kWh" labelHindi="मासिक बिजली खपत (kWh)" value={energy.monthlyElectricityKwh} min={0} max={500} helper="Check your DISCOM bill for units consumed." onChange={(v) => setEnergy({ ...energy, monthlyElectricityKwh: v })} />
            <SelectField label="Cooking fuel" labelHindi="खाना पकाने का ईंधन" value={energy.cookingFuel} options={[{ value: "lpg", label: "LPG" }, { value: "cng", label: "CNG" }, { value: "piped_gas", label: "Piped Gas" }, { value: "electric", label: "Electric" }, { value: "solar", label: "Solar" }, { value: "biomass", label: "Biomass" }]} onChange={(v) => setEnergy({ ...energy, cookingFuel: v as EnergyProfile["cookingFuel"] })} />
            <SliderField label="LPG cylinders per month" labelHindi="मासिक LPG सिलेंडर" value={energy.lpgCylindersPerMonth} min={0} max={4} step={0.5} unit="cylinders" onChange={(v) => setEnergy({ ...energy, lpgCylindersPerMonth: v })} show={energy.cookingFuel === "lpg"} />
            <NumberField label="Air conditioner units at home" labelHindi="AC की संख्या" value={energy.acUnits} min={0} max={5} onChange={(v) => setEnergy({ ...energy, acUnits: v })} />
            <SliderField label="Average AC hours per day (summer)" labelHindi="AC उपयोग प्रतिदिन (गर्मी)" value={energy.acHoursPerDay} min={0} max={16} step={0.5} unit="hrs" onChange={(v) => setEnergy({ ...energy, acHoursPerDay: v })} />
            <NumberField label="AC temperature setting" labelHindi="AC तापमान सेटिंग" value={energy.acTemperatureSetting} min={16} max={30} helper="Each degree above 24°C saves ~6% cooling energy" onChange={(v) => setEnergy({ ...energy, acTemperatureSetting: v })} />
            <ToggleField label="Do you have solar panels?" labelHindi="क्या आपके पास सोलर पैनल हैं?" value={energy.hasSolar} onChange={(v) => setEnergy({ ...energy, hasSolar: v })} />
            <SliderField label="Solar capacity" labelHindi="सोलर क्षमता" value={energy.solarCapacityKw} min={0} max={10} step={0.5} unit="kW" onChange={(v) => setEnergy({ ...energy, solarCapacityKw: v })} show={energy.hasSolar} />
          </>
        )}

        {step === 3 && (
          <>
            <SliderField label="Online orders per month" labelHindi="मासिक ऑनलाइन ऑर्डर" value={shopping.monthlyOnlineOrders} min={0} max={30} step={1} unit="orders" onChange={(v) => setShopping({ ...shopping, monthlyOnlineOrders: v })} />
            <SliderField label="Clothing items bought per month" labelHindi="मासिक कपड़ों की खरीदारी" value={shopping.clothingItemsPerMonth} min={0} max={10} step={1} unit="items" onChange={(v) => setShopping({ ...shopping, clothingItemsPerMonth: v })} />
            <NumberField label="Electronics purchased per year" labelHindi="इलेक्ट्रॉनिक्स/साल" value={shopping.electronicsPerYear} min={0} max={10} onChange={(v) => setShopping({ ...shopping, electronicsPerYear: v })} />
            <ToggleField label="Do you use cloth/reusable bags?" labelHindi="क्या आप कपड़े/पुनः प्रयोज्य बैग उपयोग करते हैं?" value={shopping.usesClothBag} onChange={(v) => setShopping({ ...shopping, usesClothBag: v })} />
            <ToggleField label="Do you buy second-hand or refurbished items?" labelHindi="क्या आप सेकंड-हैंड/रीफर्बिश्ड सामान खरीदते हैं?" value={shopping.buysSecondHand} onChange={(v) => setShopping({ ...shopping, buysSecondHand: v })} />
          </>
        )}

        {step === 4 && (
          <>
            <SliderField label="Estimated weekly waste" labelHindi="साप्ताहिक कचरा (अनुमानित)" value={waste.weeklyWasteKg} min={0} max={20} step={0.5} unit="kg" onChange={(v) => setWaste({ ...waste, weeklyWasteKg: v })} />
            <ToggleField label="Do you compost food/garden waste?" labelHindi="क्या आप कम्पोस्ट करते हैं?" value={waste.composts} onChange={(v) => setWaste({ ...waste, composts: v })} />
            <ToggleField label="Do you recycle paper?" labelHindi="क्या आप कागज़ रीसायकल करते हैं?" value={waste.recyclesPaper} onChange={(v) => setWaste({ ...waste, recyclesPaper: v })} />
            <ToggleField label="Do you recycle plastic?" labelHindi="क्या आप प्लास्टिक रीसायकल करते हैं?" value={waste.recyclesPlastic} onChange={(v) => setWaste({ ...waste, recyclesPlastic: v })} />
            <SliderField label="E-waste disposed per year" labelHindi="वार्षिक ई-कचरा" value={waste.ewasteKgPerYear} min={0} max={20} step={0.5} unit="kg" onChange={(v) => setWaste({ ...waste, ewasteKgPerYear: v })} />
          </>
        )}
      </div>

      {/* Navigation Buttons */}
      <div className="flex gap-3 mt-5">
        {canGoBack && (
          <button
            onClick={() => setStep(step - 1)}
            className="flex-1 py-3 rounded-xl border border-gray-700 text-gray-300 text-sm font-medium hover:bg-gray-800 transition-colors"
          >
            ← Back
          </button>
        )}
        {canGoNext && !isLastStep && (
          <button
            onClick={() => setStep(step + 1)}
            className="flex-1 py-3 rounded-xl bg-emerald-600 text-white text-sm font-bold hover:bg-emerald-500 transition-colors"
          >
            Next →
          </button>
        )}
        {isLastStep && (
          <button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white text-sm font-bold hover:from-emerald-500 hover:to-green-400 transition-all disabled:opacity-50"
          >
            {isSubmitting ? "Saving..." : "🧬 Create My Carbon Twin / कार्बन ट्विन बनाएं"}
          </button>
        )}
      </div>
    </div>
  );
}
