"use client";

import { Trophy, Users, WandSparkles, HelpCircle } from "lucide-react";
import { useState } from "react";

interface ChallengeData {
  id: string;
  name: string;
  target_kg: number;
  duration_days: number;
  participants: number;
  badge: string;
}

export function ChallengeCard({
  challenge,
  progress,
  isJoined,
  onJoin,
}: {
  challenge: ChallengeData;
  progress: number;
  isJoined: boolean;
  onJoin: (id: string) => void;
}) {
  return (
    <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20 flex flex-col justify-between hover:shadow-md transition">
      <div>
        <div className="flex items-start justify-between mb-4">
          <div className="rounded-2xl bg-[#F8FAF5] dark:bg-black/20 p-3 text-2xl">
            {challenge.badge.split(" ")[0]}
          </div>
          <span className="inline-flex items-center gap-1 rounded-full bg-[#52B788]/10 px-3 py-1 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
            <Users size={12} />
            {(challenge.participants + (isJoined ? 1 : 0)).toLocaleString()} joined
          </span>
        </div>

        <h3 className="text-xl font-bold mb-2">{challenge.name}</h3>
        <div className="flex gap-4 text-sm font-semibold text-neutral-500 mb-6">
          <span>⏳ {challenge.duration_days} days</span>
          <span className="text-[#2D6A4F] dark:text-[#52B788]">
            🎯 Target: -{challenge.target_kg} kg CO2
          </span>
        </div>

        <div className="mb-6">
          <div className="flex justify-between text-xs font-bold mb-2">
            <span>Group Progress</span>
            <span>{progress}%</span>
          </div>
          <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
            <div
              className="h-full bg-[#52B788] rounded-full transition-all duration-500"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={() => !isJoined && onJoin(challenge.id)}
          disabled={isJoined}
          className={`flex-1 rounded-xl py-3 font-bold transition ${
            isJoined
              ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-default"
              : "bg-[#2D6A4F] text-white hover:bg-[#1B4332]"
          }`}
        >
          {isJoined ? "Joined ✅" : "Join Challenge"}
        </button>
        <button
          className="p-3 text-neutral-400 hover:text-[#2D6A4F] transition relative group"
          title="How it works"
        >
          <HelpCircle size={20} />
          <div className="absolute bottom-full right-0 mb-2 hidden w-48 rounded-xl bg-[#1B4332] p-3 text-xs font-medium text-white shadow-lg group-hover:block z-10">
            Log your actions daily. We calculate your CO2 savings automatically.
          </div>
        </button>
      </div>
    </div>
  );
}
