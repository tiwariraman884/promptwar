"use client";

import { Flame, Trophy, Target } from "lucide-react";

interface GoalProgressRingProps {
  progressPct: number;
  goalPct: number;
  currentPct: number;
  streak: number;
  longestStreak: number;
  milestones: { label: string; reached: boolean; value: number }[];
  predictedCompletion: string;
  successProbability: number;
  difficultyScore: number;
}

export function GoalProgressRing({
  progressPct,
  goalPct,
  currentPct,
  streak,
  longestStreak,
  milestones,
  predictedCompletion,
  successProbability,
  difficultyScore,
}: GoalProgressRingProps) {
  const radius = 80;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.min(progressPct, 100) / 100) * circumference;

  const progressColor =
    progressPct >= 75 ? "#10B981" : progressPct >= 50 ? "#52B788" : progressPct >= 25 ? "#F59E0B" : "#EF4444";

  return (
    <div className="space-y-6">
      {/* Main ring + stats */}
      <div className="flex flex-col sm:flex-row items-center gap-8">
        {/* SVG ring */}
        <div className="relative flex items-center justify-center shrink-0">
          <svg className="w-48 h-48 transform -rotate-90">
            <circle
              cx="96" cy="96" r={radius}
              className="stroke-neutral-100 dark:stroke-neutral-800"
              strokeWidth="14"
              fill="none"
            />
            <circle
              cx="96" cy="96" r={radius}
              stroke={progressColor}
              strokeWidth="14"
              fill="none"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              className="transition-all duration-1000 ease-out"
            />
          </svg>
          <div className="absolute inset-0 flex flex-col items-center justify-center">
            <span className="text-3xl font-black text-[#1B4332] dark:text-white">
              {Math.round(progressPct)}%
            </span>
            <span className="text-xs font-bold text-neutral-500 uppercase tracking-wider">
              of {goalPct}% goal
            </span>
          </div>
        </div>

        {/* Stats grid */}
        <div className="grid grid-cols-2 gap-3 flex-1">
          <div className="rounded-xl bg-[#F8FAF5] dark:bg-black/20 p-4 border border-[#52B788]/10">
            <div className="flex items-center gap-2 mb-1">
              <Flame size={16} className="text-orange-500" />
              <span className="text-xs font-bold uppercase text-neutral-500">Streak</span>
            </div>
            <p className="text-2xl font-black text-[#1B4332] dark:text-white">{streak}</p>
            <p className="text-xs text-neutral-400">Best: {longestStreak}</p>
          </div>

          <div className="rounded-xl bg-[#F8FAF5] dark:bg-black/20 p-4 border border-[#52B788]/10">
            <div className="flex items-center gap-2 mb-1">
              <Target size={16} className="text-[#52B788]" />
              <span className="text-xs font-bold uppercase text-neutral-500">Reduction</span>
            </div>
            <p className="text-2xl font-black text-[#1B4332] dark:text-white">{currentPct.toFixed(1)}%</p>
            <p className="text-xs text-neutral-400">Target: {goalPct}%</p>
          </div>

          <div className="rounded-xl bg-[#F8FAF5] dark:bg-black/20 p-4 border border-[#52B788]/10">
            <div className="flex items-center gap-2 mb-1">
              <Trophy size={16} className="text-amber-500" />
              <span className="text-xs font-bold uppercase text-neutral-500">Success</span>
            </div>
            <p className="text-2xl font-black text-[#1B4332] dark:text-white">{successProbability}%</p>
            <p className="text-xs text-neutral-400">probability</p>
          </div>

          <div className="rounded-xl bg-[#F8FAF5] dark:bg-black/20 p-4 border border-[#52B788]/10">
            <span className="text-xs font-bold uppercase text-neutral-500 block mb-1">Difficulty</span>
            <div className="flex gap-1 mt-2">
              {[1, 2, 3, 4, 5].map(i => (
                <div
                  key={i}
                  className={`h-3 flex-1 rounded-full ${
                    i <= difficultyScore
                      ? difficultyScore <= 2 ? "bg-emerald-500" : difficultyScore <= 3 ? "bg-amber-500" : "bg-rose-500"
                      : "bg-neutral-200 dark:bg-neutral-700"
                  }`}
                />
              ))}
            </div>
            <p className="text-xs text-neutral-400 mt-1.5">
              {difficultyScore <= 2 ? "Easy" : difficultyScore <= 3 ? "Moderate" : "Challenging"}
            </p>
          </div>
        </div>
      </div>

      {/* Predicted completion */}
      <div className="rounded-xl bg-gradient-to-r from-[#2D6A4F] to-[#1B4332] p-4 text-white">
        <p className="text-xs font-bold uppercase tracking-wider text-white/60 mb-1">Predicted Goal Completion</p>
        <p className="text-lg font-black">
          {predictedCompletion === "Not on track" ? "⚠️ Not on track — increase daily effort" : `🎯 ${predictedCompletion}`}
        </p>
      </div>

      {/* Milestones */}
      <div>
        <h4 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-3">Milestones</h4>
        <div className="flex flex-wrap gap-2">
          {milestones.map(m => (
            <div
              key={m.label}
              className={`rounded-full px-3.5 py-1.5 text-xs font-bold transition-all ${
                m.reached
                  ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400"
                  : "bg-neutral-100 text-neutral-400 dark:bg-neutral-800 dark:text-neutral-600"
              }`}
            >
              {m.reached ? "✓ " : "○ "}{m.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
