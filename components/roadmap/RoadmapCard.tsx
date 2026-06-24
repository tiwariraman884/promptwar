"use client";

import type { RoadmapWeek } from "@/lib/types/carbon-twin-types";

interface RoadmapCardProps {
  week: RoadmapWeek;
  onToggleComplete: (weekNumber: number) => void;
}

const DIFFICULTY_STYLES: Record<string, string> = {
  easy: "bg-green-100 text-green-700 dark:bg-green-900/30 dark:text-green-400",
  medium: "bg-yellow-100 text-yellow-700 dark:bg-yellow-900/30 dark:text-yellow-400",
  hard: "bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400",
};

const CATEGORY_EMOJI: Record<string, string> = {
  diet: "🥗", travel: "🚗", energy: "⚡", shopping: "🛍️", waste: "♻️",
};

export function RoadmapCard({ week, onToggleComplete }: RoadmapCardProps): JSX.Element {
  return (
    <div className={`rounded-2xl border p-4 transition-colors ${week.isCompleted ? "border-green-600/50 bg-green-900/10" : "border-gray-700/50 bg-slate-900/40"}`}>
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-gray-400 bg-gray-800 px-2 py-1 rounded-lg">
            Week {week.weekNumber}
          </span>
          <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${DIFFICULTY_STYLES[week.difficulty] ?? ""}`}>
            {week.difficulty}
          </span>
        </div>
        {week.isCompleted && (
          <span className="text-xs font-medium text-green-400 bg-green-900/30 px-2 py-1 rounded-lg">
            ✅ Done
          </span>
        )}
      </div>

      <p className="text-sm font-medium text-gray-200 mb-1">
        {CATEGORY_EMOJI[week.category] ?? "🌍"} {week.action}
      </p>
      <p className="text-xs text-gray-500 mb-3">{week.actionHindi}</p>

      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3 text-xs text-gray-400">
          <span>Save: ~{week.estimatedSavingKg} kg CO₂/month</span>
          <span className="capitalize">Category: {week.category}</span>
        </div>

        <button
          onClick={() => onToggleComplete(week.weekNumber)}
          className={`text-xs font-medium px-3 py-1.5 rounded-lg transition-colors ${
            week.isCompleted
              ? "border border-gray-700 text-gray-400 hover:bg-gray-800"
              : "bg-emerald-600 text-white hover:bg-emerald-500"
          }`}
        >
          {week.isCompleted ? "Undo" : "Mark Complete / पूर्ण करें"}
        </button>
      </div>
    </div>
  );
}
