"use client";

import type { CategoryScore } from "@/lib/types/carbon-twin-types";

interface CategoryBarProps {
  categoryScore: CategoryScore;
}

export function CategoryBar({ categoryScore }: CategoryBarProps): JSX.Element {
  const { label, labelHindi, score } = categoryScore;

  const barColor =
    score >= 80 ? "bg-green-500" :
    score >= 60 ? "bg-lime-500" :
    score >= 40 ? "bg-yellow-500" :
    score >= 20 ? "bg-orange-500" :
    "bg-red-500";

  return (
    <div className="flex items-center gap-3">
      <div className="w-24 flex-shrink-0">
        <span className="block text-sm font-medium text-gray-300">{label}</span>
        <span className="block text-xs text-gray-500">{labelHindi}</span>
      </div>
      <div className="flex-1 h-3 bg-gray-800 rounded-full overflow-hidden">
        <div
          className={`h-full ${barColor} rounded-full transition-all`}
          style={{ width: `${score}%` }}
        />
      </div>
      <span className="w-12 text-right text-sm font-bold text-gray-300">{score}/100</span>
    </div>
  );
}
