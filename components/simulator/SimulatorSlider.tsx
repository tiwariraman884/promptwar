"use client";

interface SimulatorSliderProps {
  label: string;
  labelHindi: string;
  value: number;
  min: number;
  max: number;
  step: number;
  unit: string;
  originalValue: number;
  impactKg: number;
  onChange: (v: number) => void;
}

export function SimulatorSlider({
  label, labelHindi, value, min, max, step, unit, originalValue, impactKg, onChange,
}: SimulatorSliderProps): JSX.Element {
  const changed = value !== originalValue;
  const impactText = impactKg > 0 ? `+${impactKg.toFixed(1)} kg` : `${impactKg.toFixed(1)} kg`;
  const impactColor = impactKg > 0 ? "text-red-400" : impactKg < 0 ? "text-green-400" : "text-gray-500";

  return (
    <div className={`p-4 rounded-xl border transition-colors ${changed ? "border-emerald-500/50 bg-emerald-900/10" : "border-gray-700/50 bg-slate-900/40"}`}>
      <div className="flex justify-between items-start mb-2">
        <div className="flex-1">
          <span className="block text-sm font-medium text-gray-200">{label}</span>
          <span className="block text-xs text-gray-500">{labelHindi}</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-bold text-emerald-400">{value} {unit}</span>
          {changed && (
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${impactKg < 0 ? "bg-green-900/40 text-green-400" : impactKg > 0 ? "bg-red-900/40 text-red-400" : ""} ${impactColor}`}>
              {impactText}/mo
            </span>
          )}
        </div>
      </div>
      <input
        type="range" min={min} max={max} step={step} value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer accent-emerald-500"
      />
      <div className="flex justify-between text-xs text-gray-600 mt-1">
        <span>{min} {unit}</span>
        <span>{max} {unit}</span>
      </div>
    </div>
  );
}
