"use client";

import { Share2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface LeaderEntry {
  rank: number;
  name: string;
  saved: number;
  badge: string;
  isMe: boolean;
}

interface CityLeader {
  rank: number;
  displayName: string;
  city: string;
  reductionPercent: number;
}

interface StateLeader {
  rank: number;
  city: string;
  state: string;
  reductionPercent: number;
}

const DEFAULT_LEADERBOARD: LeaderEntry[] = [
  { rank: 1, name: "Aarav Sharma", saved: 118, badge: "🌟 Eco Legend", isMe: false },
  { rank: 2, name: "Diya Patel", saved: 95, badge: "🔥 Streaker", isMe: false },
  { rank: 3, name: "Arjun Singh", saved: 84, badge: "⚡ Grid Guardian", isMe: false },
  { rank: 4, name: "You", saved: 72, badge: "🌱 Rising Star", isMe: true },
  { rank: 5, name: "Ananya Iyer", saved: 65, badge: "🚲 Urban Rider", isMe: false },
  { rank: 6, name: "Rohan Gupta", saved: 58, badge: "", isMe: false },
  { rank: 7, name: "Kavya Desai", saved: 42, badge: "", isMe: false },
  { rank: 8, name: "Vihaan Reddy", saved: 37, badge: "", isMe: false },
  { rank: 9, name: "Ishaan Verma", saved: 29, badge: "", isMe: false },
  { rank: 10, name: "Zara Khan", saved: 15, badge: "", isMe: false },
];

function LeaderRow({
  rank,
  primary,
  secondary,
  value,
}: {
  rank: number;
  primary: string;
  secondary: string;
  value: string;
}) {
  return (
    <div className="flex min-h-14 items-center gap-3 rounded-2xl border border-gray-200 bg-white dark:border-white/10 dark:bg-white/5 px-3">
      <span className="grid h-9 w-9 place-items-center rounded-full bg-emerald-100 font-heading font-extrabold text-emerald-600 dark:bg-[#52B788]/15 dark:text-[#52B788]">
        {rank}
      </span>
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-extrabold text-gray-900 dark:text-white">{primary}</p>
        <p className="truncate text-xs font-bold text-gray-500 dark:text-white/60">{secondary}</p>
      </div>
      <Badge tone="amber">{value}</Badge>
    </div>
  );
}

export function LeaderboardTable({
  cityLeaders,
  stateLeaders,
}: {
  cityLeaders: CityLeader[];
  stateLeaders: StateLeader[];
}) {
  const handleShareRank = () => {
    const text = "I'm #4 on GreenStep's leaderboard! I've saved 72 kg CO2 this month. 🌱";
    navigator.clipboard.writeText(text);
  };

  return (
    <div className="space-y-8">
      {/* Personal rank card */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white dark:bg-[#1A2F2A] p-6 rounded-3xl shadow-sm border border-[#52B788]/20">
        <div className="flex items-center gap-4">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-yellow-100 text-3xl shadow-inner">
            🏆
          </div>
          <div>
            <p className="text-sm font-bold uppercase tracking-wider text-neutral-500">Your Monthly Rank</p>
            <h2 className="text-3xl font-black text-[#2D6A4F] dark:text-[#52B788]">#4</h2>
          </div>
        </div>
        <button
          onClick={handleShareRank}
          className="flex items-center gap-2 rounded-full bg-[#52B788]/10 px-6 py-3 font-bold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#52B788]/20 transition"
        >
          <Share2 size={18} /> Share Rank
        </button>
      </div>

      {/* Detailed leaderboard table */}
      <div className="bg-white dark:bg-[#1A2F2A] rounded-3xl shadow-sm border border-[#52B788]/20 overflow-hidden">
        <div className="grid grid-cols-[3rem_1fr_5rem] md:grid-cols-[4rem_1fr_8rem] gap-4 p-4 border-b border-[#52B788]/10 bg-[#F8FAF5] dark:bg-black/20 text-xs font-bold uppercase tracking-wider text-neutral-500">
          <div className="text-center">Rank</div>
          <div>Carbon Saver</div>
          <div className="text-right">Saved (kg)</div>
        </div>
        <div className="divide-y divide-[#52B788]/10">
          {DEFAULT_LEADERBOARD.map((row) => (
            <div
              key={row.rank}
              className={`grid grid-cols-[3rem_1fr_5rem] md:grid-cols-[4rem_1fr_8rem] gap-4 p-4 items-center transition-colors ${
                row.isMe ? "bg-[#52B788]/10" : "hover:bg-[#F8FAF5] dark:hover:bg-black/10"
              }`}
            >
              <div className="text-center font-bold text-neutral-400">
                {row.rank === 1 ? "🥇" : row.rank === 2 ? "🥈" : row.rank === 3 ? "🥉" : `#${row.rank}`}
              </div>
              <div className="flex items-center gap-3 overflow-hidden">
                <div
                  className={`flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full font-bold text-xs md:text-sm ${
                    row.isMe ? "bg-[#2D6A4F] text-white" : "bg-neutral-100 dark:bg-neutral-800"
                  }`}
                >
                  {row.name
                    .split(" ")
                    .map((n) => n[0])
                    .join("")}
                </div>
                <div className="truncate">
                  <p className={`font-bold truncate ${row.isMe ? "text-[#2D6A4F] dark:text-[#52B788]" : ""}`}>
                    {row.name}
                  </p>
                  {row.badge && <p className="text-xs font-semibold text-neutral-500 truncate">{row.badge}</p>}
                </div>
              </div>
              <div className="text-right font-black text-[#52B788]">{row.saved}</div>
            </div>
          ))}
        </div>
      </div>

      {/* City & State leaderboards */}
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
          <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-1">City Leaderboard</h3>
          <p className="text-sm text-neutral-500 mb-4">Top 10 in your city this month.</p>
          <div className="space-y-2">
            {cityLeaders.slice(0, 10).map((leader) => (
              <LeaderRow
                key={leader.rank}
                primary={leader.displayName}
                rank={leader.rank}
                secondary={leader.city}
                value={`${leader.reductionPercent}%`}
              />
            ))}
          </div>
        </div>

        <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
          <h3 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-1">State Leaderboard</h3>
          <p className="text-sm text-neutral-500 mb-4">Uttarakhand cities by average reduction.</p>
          <div className="space-y-2">
            {stateLeaders.map((leader) => (
              <LeaderRow
                key={leader.rank}
                primary={leader.city}
                rank={leader.rank}
                secondary={leader.state}
                value={`${leader.reductionPercent}%`}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
