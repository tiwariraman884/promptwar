"use client";

import { type Dispatch, type SetStateAction } from "react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { FORM_STEPS, type UserInputData } from "@/types/carbon";

interface InputFormProps {
  formData: UserInputData;
  setFormData: Dispatch<SetStateAction<UserInputData>>;
  step: number;
  setStep: Dispatch<SetStateAction<number>>;
  onSubmit: () => void;
  isLoading: boolean;
}

export function InputForm({ formData, setFormData, step, setStep, onSubmit, isLoading }: InputFormProps) {
  const currentStep = FORM_STEPS[step];
  const isLast = step === FORM_STEPS.length - 1;
  const progress = ((step + 1) / FORM_STEPS.length) * 100;

  const updateField = (
    category: string,
    field: string,
    value: unknown
  ) => {
    setFormData((prev) => {
      const catObj = (prev as unknown as Record<string, Record<string, unknown>>)[category];
      return { ...prev, [category]: { ...catObj, [field]: value } };
    });
  };

  return (
    <div className="glass-card p-6 space-y-6">
      {/* Step indicator */}
      <div className="space-y-3">
        <div className="flex items-center justify-between text-sm">
          <span className="text-gray-400">Step {step + 1} of {FORM_STEPS.length}</span>
          <span className="text-gray-500">{Math.round(progress)}% complete</span>
        </div>
        <Progress value={progress} />

        {/* Step pills */}
        <div className="flex gap-1.5">
          {FORM_STEPS.map((s) => (
            <button
              key={s.id}
              onClick={() => setStep(s.id)}
              className={`flex-1 h-1.5 rounded-full transition-all duration-300 ${
                s.id <= step ? "bg-emerald-500/80" : "bg-white/[0.06]"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Step header */}
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <span className="text-2xl">{currentStep.icon}</span>
          <h2 className="font-heading text-xl font-bold text-white">{currentStep.title}</h2>
        </div>
        <p className="text-sm text-gray-400">{currentStep.description}</p>
      </div>

      {/* Step content */}
      <div className="space-y-5 min-h-[260px]">
        {step === 0 && <DietStep formData={formData} updateField={updateField} />}
        {step === 1 && <TravelStep formData={formData} updateField={updateField} />}
        {step === 2 && <ElectricityStep formData={formData} updateField={updateField} />}
        {step === 3 && <ShoppingStep formData={formData} updateField={updateField} />}
        {step === 4 && <WasteStep formData={formData} updateField={updateField} />}
      </div>

      {/* Navigation */}
      <div className="flex gap-3">
        {step > 0 && (
          <Button variant="secondary" onClick={() => setStep(step - 1)} disabled={isLoading}
            className="flex-1">
            ← Previous
          </Button>
        )}
        {isLast ? (
          <Button onClick={onSubmit} disabled={isLoading} className="flex-1">
            {isLoading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                </svg>
                Analyzing...
              </span>
            ) : (
              "🌿 Analyze My Footprint"
            )}
          </Button>
        ) : (
          <Button onClick={() => setStep(step + 1)} className="flex-1">
            Next →
          </Button>
        )}
      </div>
    </div>
  );
}

/* ═══════ Shared field components ═══════ */

function FieldLabel({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) {
  return <label htmlFor={htmlFor} className="block text-sm font-semibold text-gray-300">{children}</label>;
}

function RadioGroup({ options, value, onChange, name }: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  name: string;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((opt) => (
        <button
          key={opt.value}
          type="button"
          onClick={() => onChange(opt.value)}
          className={`rounded-xl border px-4 py-2.5 text-sm font-medium transition-all duration-200 ${
            value === opt.value
              ? "bg-emerald-500/15 border-emerald-500/30 text-emerald-400"
              : "bg-white/[0.03] border-white/[0.08] text-gray-400 hover:border-white/[0.15]"
          }`}
          id={`${name}-${opt.value}`}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

function SliderField({ label, value, onChange, min, max, step = 1, unit, id }: {
  label: string; value: number; onChange: (v: number) => void;
  min: number; max: number; step?: number; unit?: string; id: string;
}) {
  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <FieldLabel htmlFor={id}>{label}</FieldLabel>
        <span className="text-sm font-bold text-emerald-400">{value}{unit}</span>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="w-full h-2 rounded-full appearance-none cursor-pointer bg-white/[0.08]"
      />
      <div className="flex justify-between text-[10px] text-gray-500">
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function NumberField({ label, value, onChange, min = 0, max, unit, id }: {
  label: string; value: number; onChange: (v: number) => void;
  min?: number; max?: number; unit?: string; id: string;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <div className="relative">
        <input
          id={id}
          type="number"
          min={min}
          max={max}
          value={value}
          onChange={(e) => onChange(Math.max(min, Number(e.target.value) || 0))}
          className="w-full glass-input rounded-xl px-4 py-3 pr-14 text-sm"
        />
        {unit && (
          <span className="absolute right-4 top-1/2 -translate-y-1/2 text-xs text-gray-500">{unit}</span>
        )}
      </div>
    </div>
  );
}

function ToggleField({ label, checked, onChange, id }: {
  label: string; checked: boolean; onChange: (v: boolean) => void; id: string;
}) {
  return (
    <div className="flex items-center justify-between">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <button
        id={id}
        type="button"
        role="switch"
        aria-checked={checked}
        onClick={() => onChange(!checked)}
        className={`relative w-12 h-7 rounded-full transition-colors duration-200 ${
          checked ? "bg-emerald-500" : "bg-white/[0.12]"
        }`}
      >
        <span className={`absolute top-0.5 left-0.5 w-6 h-6 rounded-full bg-white shadow transition-transform duration-200 ${
          checked ? "translate-x-5" : ""
        }`} />
      </button>
    </div>
  );
}

function SelectField({ label, options, value, onChange, id }: {
  label: string;
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  id: string;
}) {
  return (
    <div className="space-y-2">
      <FieldLabel htmlFor={id}>{label}</FieldLabel>
      <select
        id={id}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full glass-input rounded-xl px-4 py-3 text-sm appearance-none cursor-pointer"
      >
        {options.map((opt) => (
          <option key={opt.value} value={opt.value} className="bg-[#1C2F2D] text-white">
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}

/* ═══════ Step contents ═══════ */

type UpdateFn = (
  category: string, field: string, value: unknown
) => void;

function DietStep({ formData, updateField }: { formData: UserInputData; updateField: UpdateFn }) {
  return (
    <>
      <div className="space-y-2">
        <FieldLabel>Food Type</FieldLabel>
        <RadioGroup
          name="diet-food-type"
          options={[
            { value: "vegan", label: "🌱 Vegan" },
            { value: "vegetarian", label: "🥬 Vegetarian" },
            { value: "non_vegetarian", label: "🍖 Non-Vegetarian" },
          ]}
          value={formData.diet.food_type}
          onChange={(v) => updateField("diet", "food_type", v as any)}
        />
      </div>
      <SliderField
        id="diet-meat"
        label="Meat meals per week"
        value={formData.diet.meat_meals_per_week}
        onChange={(v) => updateField("diet", "meat_meals_per_week", v)}
        min={0} max={14} unit=" meals"
      />
      <ToggleField
        id="diet-dairy"
        label="Daily dairy consumption"
        checked={formData.diet.dairy_daily}
        onChange={(v) => updateField("diet", "dairy_daily", v)}
      />
      <SliderField
        id="diet-local"
        label="Local produce percentage"
        value={formData.diet.local_produce_percent}
        onChange={(v) => updateField("diet", "local_produce_percent", v)}
        min={0} max={100} step={5} unit="%"
      />
    </>
  );
}

function TravelStep({ formData, updateField }: { formData: UserInputData; updateField: UpdateFn }) {
  const showVehicle = formData.travel.commute_mode === "car" || formData.travel.commute_mode === "two_wheeler";

  return (
    <>
      <SelectField
        id="travel-mode"
        label="Primary commute mode"
        options={[
          { value: "walk_cycle", label: "🚶 Walk / Cycle" },
          { value: "public_transport", label: "🚌 Public Transport" },
          { value: "two_wheeler", label: "🏍️ Two Wheeler" },
          { value: "car", label: "🚗 Car" },
          { value: "mixed", label: "🔀 Mixed" },
        ]}
        value={formData.travel.commute_mode}
        onChange={(v) => updateField("travel", "commute_mode", v as any)}
      />
      <NumberField
        id="travel-km"
        label="Weekly commute distance"
        value={formData.travel.km_per_week}
        onChange={(v) => updateField("travel", "km_per_week", v)}
        unit="km/week"
      />
      <NumberField
        id="travel-flights"
        label="Flights per year"
        value={formData.travel.flights_per_year}
        onChange={(v) => updateField("travel", "flights_per_year", v)}
        unit="flights/yr"
      />
      {showVehicle && (
        <SelectField
          id="travel-vehicle"
          label="Vehicle type"
          options={[
            { value: "petrol", label: "⛽ Petrol" },
            { value: "diesel", label: "🛢️ Diesel" },
            { value: "electric", label: "🔋 Electric" },
            { value: "cng", label: "💨 CNG" },
          ]}
          value={formData.travel.vehicle_type || "petrol"}
          onChange={(v) => updateField("travel", "vehicle_type", v as any)}
        />
      )}
    </>
  );
}

function ElectricityStep({ formData, updateField }: { formData: UserInputData; updateField: UpdateFn }) {
  return (
    <>
      <NumberField
        id="elec-kwh"
        label="Monthly electricity consumption"
        value={formData.electricity.monthly_kwh}
        onChange={(v) => updateField("electricity", "monthly_kwh", v)}
        unit="kWh/month"
      />
      <div className="space-y-2">
        <FieldLabel>Energy source</FieldLabel>
        <RadioGroup
          name="elec-source"
          options={[
            { value: "grid", label: "🔌 Grid" },
            { value: "solar", label: "☀️ Solar" },
            { value: "mixed", label: "⚡ Mixed" },
          ]}
          value={formData.electricity.energy_source}
          onChange={(v) => updateField("electricity", "energy_source", v as any)}
        />
      </div>
      <SliderField
        id="elec-ac"
        label="AC usage hours per day"
        value={formData.electricity.ac_hours_per_day}
        onChange={(v) => updateField("electricity", "ac_hours_per_day", v)}
        min={0} max={24} unit=" hrs"
      />
    </>
  );
}

function ShoppingStep({ formData, updateField }: { formData: UserInputData; updateField: UpdateFn }) {
  return (
    <>
      <NumberField
        id="shop-spend"
        label="Monthly shopping spend"
        value={formData.shopping.monthly_spend_inr}
        onChange={(v) => updateField("shopping", "monthly_spend_inr", v)}
        unit="₹/month"
      />
      <SliderField
        id="shop-fashion"
        label="Fast fashion percentage"
        value={formData.shopping.fast_fashion_percent}
        onChange={(v) => updateField("shopping", "fast_fashion_percent", v)}
        min={0} max={100} step={5} unit="%"
      />
      <NumberField
        id="shop-electronics"
        label="Electronics purchased per year"
        value={formData.shopping.electronics_per_year}
        onChange={(v) => updateField("shopping", "electronics_per_year", v)}
        unit="devices/yr"
      />
    </>
  );
}

function WasteStep({ formData, updateField }: { formData: UserInputData; updateField: UpdateFn }) {
  return (
    <>
      <NumberField
        id="waste-kg"
        label="Weekly household waste"
        value={formData.waste.weekly_waste_kg}
        onChange={(v) => updateField("waste", "weekly_waste_kg", v)}
        unit="kg/week"
      />
      <SelectField
        id="waste-recycling"
        label="Recycling habit"
        options={[
          { value: "never", label: "❌ Never" },
          { value: "sometimes", label: "🔄 Sometimes" },
          { value: "always", label: "♻️ Always" },
        ]}
        value={formData.waste.recycling_habit}
        onChange={(v) => updateField("waste", "recycling_habit", v as any)}
      />
      <ToggleField
        id="waste-compost"
        label="Home composting"
        checked={formData.waste.composting}
        onChange={(v) => updateField("waste", "composting", v)}
      />
      <NumberField
        id="waste-plastic"
        label="Plastic bags per week"
        value={formData.waste.plastic_bags_per_week}
        onChange={(v) => updateField("waste", "plastic_bags_per_week", v)}
        unit="bags/week"
      />
    </>
  );
}
