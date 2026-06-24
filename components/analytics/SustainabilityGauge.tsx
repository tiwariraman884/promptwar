"use client";

interface SustainabilityGaugeProps {
  score: number; // 0–100
  label: string;
  sublabel?: string;
}

export function SustainabilityGauge({ score, label, sublabel }: SustainabilityGaugeProps) {
  const clampedScore = Math.max(0, Math.min(100, score));
  const angle = (clampedScore / 100) * 180; // Half-circle

  // Gradient stops for the gauge arc
  const radius = 80;
  const circumference = Math.PI * radius; // Half circle
  const offset = circumference - (clampedScore / 100) * circumference;

  const scoreColor =
    clampedScore >= 75 ? "#10B981" : clampedScore >= 50 ? "#52B788" : clampedScore >= 25 ? "#F59E0B" : "#EF4444";

  const gradeLabel =
    clampedScore >= 80 ? "Excellent" : clampedScore >= 60 ? "Good" : clampedScore >= 40 ? "Average" : clampedScore >= 20 ? "Needs Work" : "Critical";

  return (
    <div className="flex flex-col items-center">
      <div className="relative">
        <svg viewBox="0 0 200 120" className="w-56 h-32">
          {/* Background arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            className="stroke-neutral-100 dark:stroke-neutral-800"
            strokeWidth="16"
            strokeLinecap="round"
          />
          {/* Colored arc */}
          <path
            d="M 20 100 A 80 80 0 0 1 180 100"
            fill="none"
            stroke={scoreColor}
            strokeWidth="16"
            strokeLinecap="round"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            className="transition-all duration-1000 ease-out"
          />
          {/* Needle */}
          <line
            x1="100"
            y1="100"
            x2={100 + 55 * Math.cos(Math.PI - (angle * Math.PI) / 180)}
            y2={100 - 55 * Math.sin((angle * Math.PI) / 180)}
            stroke={scoreColor}
            strokeWidth="3"
            strokeLinecap="round"
            className="transition-all duration-1000 ease-out"
          />
          <circle cx="100" cy="100" r="6" fill={scoreColor} className="transition-all duration-1000" />
        </svg>

        {/* Center score */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 text-center">
          <span className="text-3xl font-black text-[#1B4332] dark:text-white">{Math.round(clampedScore)}</span>
          <span className="text-sm font-bold text-neutral-500">/100</span>
        </div>
      </div>

      <div className="mt-3 text-center">
        <p className="text-sm font-black text-[#1B4332] dark:text-white">{label}</p>
        <div
          className="inline-block mt-1 rounded-full px-3 py-1 text-xs font-bold"
          style={{ backgroundColor: `${scoreColor}20`, color: scoreColor }}
        >
          {gradeLabel}
        </div>
        {sublabel && (
          <p className="text-xs text-neutral-400 mt-1">{sublabel}</p>
        )}
      </div>
    </div>
  );
}
