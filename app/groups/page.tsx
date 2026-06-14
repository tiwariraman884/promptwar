"use client";

import { useState, useEffect } from "react";
import { GROUP_CHALLENGES } from "@/lib/carbonData";
import { Users, Trophy, Target, Share2, Plus, ArrowRight, HelpCircle } from "lucide-react";

export default function GroupsPage() {
  const [activeTab, setActiveTab] = useState<"challenges" | "group" | "leaderboard">("challenges");
  const [joinedChallenges, setJoinedChallenges] = useState<Record<string, boolean>>({});
  
  useEffect(() => {
    const stored = localStorage.getItem("joined_challenges");
    if (stored) {
      try {
        setJoinedChallenges(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleJoin = (id: string) => {
    const newJoined = { ...joinedChallenges, [id]: true };
    setJoinedChallenges(newJoined);
    localStorage.setItem("joined_challenges", JSON.stringify(newJoined));
    alert("✅ You're in! Challenge added to your dashboard.");
  };

  const handleShareRank = () => {
    const text = "I'm #4 on GreenStep's leaderboard! I've saved 72 kg CO2 this month. 🌱";
    navigator.clipboard.writeText(text);
    alert("Copied to clipboard!");
  };

  const LEADERBOARD_DATA = [
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

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5] pb-20 md:pb-8">
      
      {/* Header & Tabs */}
      <div className="bg-white dark:bg-[#1A2F2A] border-b border-[#52B788]/20 sticky top-0 md:top-16 z-20">
        <div className="max-w-5xl mx-auto px-4 md:px-8">
          <h1 className="text-3xl font-black text-[#2D6A4F] dark:text-[#52B788] py-8">Community</h1>
          <div className="flex overflow-x-auto hide-scrollbar gap-8">
            {(["challenges", "group", "leaderboard"] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`pb-4 text-sm font-bold capitalize whitespace-nowrap transition-colors relative ${
                  activeTab === tab ? "text-[#2D6A4F] dark:text-[#52B788]" : "text-neutral-500 hover:text-[#1B4332] dark:hover:text-[#F8FAF5]"
                }`}
              >
                {tab === "challenges" && "Active Challenges"}
                {tab === "group" && "My Group"}
                {tab === "leaderboard" && "Leaderboard"}
                {activeTab === tab && (
                  <div className="absolute bottom-0 left-0 right-0 h-1 bg-[#2D6A4F] dark:bg-[#52B788] rounded-t-full"></div>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-4 md:px-8 py-8">
        
        {/* TAB: ACTIVE CHALLENGES */}
        {activeTab === "challenges" && (
          <div className="animate-in fade-in slide-in-from-bottom-4">
            <p className="text-neutral-600 dark:text-neutral-400 font-medium mb-6 flex items-center gap-2">
              <Target size={18} /> Join community challenges to amplify your impact.
            </p>
            <div className="grid md:grid-cols-2 gap-6">
              {GROUP_CHALLENGES.map((challenge, idx) => {
                const randomProgress = [45, 62, 30, 78][idx % 4];
                const isJoined = joinedChallenges[challenge.id];
                return (
                  <div key={challenge.id} className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20 flex flex-col justify-between hover:shadow-md transition">
                    <div>
                      <div className="flex items-start justify-between mb-4">
                        <div className="rounded-2xl bg-[#F8FAF5] dark:bg-black/20 p-3 text-2xl">
                          {challenge.badge.split(' ')[0]}
                        </div>
                        <span className="inline-flex items-center gap-1 rounded-full bg-[#52B788]/10 px-3 py-1 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                          <Users size={12} /> {(challenge.participants + (isJoined ? 1 : 0)).toLocaleString()} joined
                        </span>
                      </div>
                      
                      <h3 className="text-xl font-bold mb-2">{challenge.name}</h3>
                      <div className="flex gap-4 text-sm font-semibold text-neutral-500 mb-6">
                        <span>⏳ {challenge.duration_days} days</span>
                        <span className="text-[#2D6A4F] dark:text-[#52B788]">🎯 Target: -{challenge.target_kg} kg CO2</span>
                      </div>

                      <div className="mb-6">
                        <div className="flex justify-between text-xs font-bold mb-2">
                          <span>Group Progress</span>
                          <span>{randomProgress}%</span>
                        </div>
                        <div className="h-2 w-full rounded-full bg-neutral-100 dark:bg-neutral-800 overflow-hidden">
                          <div className="h-full bg-[#52B788] rounded-full" style={{ width: `${randomProgress}%` }}></div>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button
                        onClick={() => !isJoined && handleJoin(challenge.id)}
                        disabled={isJoined}
                        className={`flex-1 rounded-xl py-3 font-bold transition ${
                          isJoined 
                            ? "bg-neutral-100 dark:bg-neutral-800 text-neutral-500 cursor-default" 
                            : "bg-[#2D6A4F] text-white hover:bg-[#1B4332]"
                        }`}
                      >
                        {isJoined ? "Joined ✅" : "Join Challenge"}
                      </button>
                      <button className="p-3 text-neutral-400 hover:text-[#2D6A4F] transition relative group" title="How it works">
                        <HelpCircle size={20} />
                        <div className="absolute bottom-full right-0 mb-2 hidden w-48 rounded-xl bg-[#1B4332] p-3 text-xs font-medium text-white shadow-lg group-hover:block z-10">
                          Log your actions daily. We calculate your CO2 savings automatically.
                        </div>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB: MY GROUP */}
        {activeTab === "group" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 md:p-8 shadow-sm border border-[#52B788]/20">
                <div className="flex items-center justify-between mb-8">
                  <div>
                    <h2 className="text-2xl font-black text-[#2D6A4F] dark:text-[#52B788] mb-1">Green Saharanpur 🌿</h2>
                    <p className="font-semibold text-neutral-500">8 members • Private group</p>
                  </div>
                  <button className="rounded-full bg-[#52B788]/20 p-3 text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#52B788]/30 transition">
                    <Plus size={20} />
                  </button>
                </div>

                <div className="flex gap-6 mb-8">
                  <div className="flex-1 rounded-2xl bg-[#F8FAF5] dark:bg-black/20 p-4 border border-[#52B788]/10 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Total Savings</p>
                    <p className="text-2xl font-black text-[#2D6A4F] dark:text-[#52B788]">2,340 kg</p>
                  </div>
                  <div className="flex-1 rounded-2xl bg-[#F8FAF5] dark:bg-black/20 p-4 border border-[#52B788]/10 text-center">
                    <p className="text-xs font-bold uppercase tracking-wider text-neutral-500 mb-1">Group Rank</p>
                    <p className="text-2xl font-black text-[#2D6A4F] dark:text-[#52B788]">#14</p>
                  </div>
                </div>

                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">Members</h3>
                  <div className="flex flex-wrap gap-4">
                    {["You", "PS", "AK", "MJ", "RD", "SJ", "VT", "NK"].map((initials, i) => (
                      <div key={i} className="flex flex-col items-center gap-1">
                        <div className={`flex h-12 w-12 items-center justify-center rounded-full font-bold shadow-sm ${
                          i === 0 ? "bg-[#2D6A4F] text-white ring-2 ring-offset-2 ring-[#52B788]" : "bg-[#52B788]/20 text-[#1B4332] dark:text-[#F8FAF5]"
                        }`}>
                          {initials}
                        </div>
                        {i === 1 && <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">👑</span>}
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              <div>
                <h3 className="text-xl font-bold text-[#2D6A4F] dark:text-[#52B788] mb-4">Group Activity</h3>
                <div className="space-y-4">
                  {[
                    { name: "Priya", action: "Took metro instead of car", saved: 1.2, time: "2 hours ago" },
                    { name: "Rahul", action: "Logged a vegetarian meal", saved: 4.5, time: "5 hours ago" },
                    { name: "Sneha", action: "Completed 'No New Clothes' week 2", saved: 15.0, time: "1 day ago" },
                  ].map((activity, i) => (
                    <div key={i} className="rounded-2xl bg-white dark:bg-[#1A2F2A] p-4 flex gap-4 items-start shadow-sm border border-[#52B788]/10">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#F8FAF5] dark:bg-black/20 font-bold text-[#2D6A4F] dark:text-[#52B788]">
                        {activity.name[0]}
                      </div>
                      <div>
                        <p className="text-sm">
                          <span className="font-bold">{activity.name}</span> reduced: {activity.action}
                        </p>
                        <div className="flex gap-3 mt-1 text-xs font-semibold">
                          <span className="text-[#52B788]">+ {activity.saved} kg CO2</span>
                          <span className="text-neutral-400">{activity.time}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="space-y-6">
              <div className="rounded-3xl bg-[#2D6A4F] text-white p-6 shadow-md">
                <h3 className="text-xl font-bold mb-2">Create a new group</h3>
                <p className="text-sm text-[#B7E4C7] mb-6 font-medium">Invite friends, family, or coworkers to reduce emissions together.</p>
                <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
                  <input type="text" placeholder="Group Name" className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/40" />
                  <textarea placeholder="Description" rows={2} className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 resize-none"></textarea>
                  <input type="email" placeholder="Invite by emails (comma separated)" className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/40" />
                  <button type="button" className="w-full rounded-xl bg-white text-[#2D6A4F] py-2.5 font-bold hover:bg-[#F8FAF5] transition">Create Group</button>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* TAB: LEADERBOARD */}
        {activeTab === "leaderboard" && (
          <div className="animate-in fade-in slide-in-from-bottom-4 max-w-3xl mx-auto">
            <div className="flex flex-col md:flex-row items-center justify-between mb-8 gap-4 bg-white dark:bg-[#1A2F2A] p-6 rounded-3xl shadow-sm border border-[#52B788]/20">
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

            <div className="bg-white dark:bg-[#1A2F2A] rounded-3xl shadow-sm border border-[#52B788]/20 overflow-hidden">
              <div className="grid grid-cols-[3rem_1fr_5rem] md:grid-cols-[4rem_1fr_8rem] gap-4 p-4 border-b border-[#52B788]/10 bg-[#F8FAF5] dark:bg-black/20 text-xs font-bold uppercase tracking-wider text-neutral-500">
                <div className="text-center">Rank</div>
                <div>Carbon Saver</div>
                <div className="text-right">Saved (kg)</div>
              </div>
              <div className="divide-y divide-[#52B788]/10">
                {LEADERBOARD_DATA.map((row) => (
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
                      <div className={`flex h-8 w-8 md:h-10 md:w-10 shrink-0 items-center justify-center rounded-full font-bold text-xs md:text-sm ${
                        row.isMe ? "bg-[#2D6A4F] text-white" : "bg-neutral-100 dark:bg-neutral-800"
                      }`}>
                        {row.name.split(' ').map(n => n[0]).join('')}
                      </div>
                      <div className="truncate">
                        <p className={`font-bold truncate ${row.isMe ? "text-[#2D6A4F] dark:text-[#52B788]" : ""}`}>
                          {row.name}
                        </p>
                        {row.badge && (
                          <p className="text-xs font-semibold text-neutral-500 truncate">{row.badge}</p>
                        )}
                      </div>
                    </div>
                    <div className="text-right font-black text-[#52B788]">
                      {row.saved}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
