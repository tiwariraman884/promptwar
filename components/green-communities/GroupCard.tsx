"use client";

import { Plus } from "lucide-react";

interface GroupActivity {
  name: string;
  action: string;
  saved: number;
  time: string;
}

const DEMO_ACTIVITIES: GroupActivity[] = [
  { name: "Priya", action: "Took metro instead of car", saved: 1.2, time: "2 hours ago" },
  { name: "Rahul", action: "Logged a vegetarian meal", saved: 4.5, time: "5 hours ago" },
  { name: "Sneha", action: "Completed 'No New Clothes' week 2", saved: 15.0, time: "1 day ago" },
];

const MEMBERS = ["You", "PS", "AK", "MJ", "RD", "SJ", "VT", "NK"];

export function GroupCard() {
  return (
    <div className="grid lg:grid-cols-3 gap-8">
      <div className="lg:col-span-2 space-y-8">
        {/* Group header */}
        <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 md:p-8 shadow-sm border border-[#52B788]/20">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-2xl font-black text-[#2D6A4F] dark:text-[#52B788] mb-1">
                Green Saharanpur 🌿
              </h2>
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
              {MEMBERS.map((initials, i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div
                    className={`flex h-12 w-12 items-center justify-center rounded-full font-bold shadow-sm ${
                      i === 0
                        ? "bg-[#2D6A4F] text-white ring-2 ring-offset-2 ring-[#52B788]"
                        : "bg-[#52B788]/20 text-[#1B4332] dark:text-[#F8FAF5]"
                    }`}
                  >
                    {initials}
                  </div>
                  {i === 1 && <span className="text-[10px] font-bold text-amber-600 dark:text-amber-400">👑</span>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Activity feed */}
        <div>
          <h3 className="text-xl font-bold text-[#2D6A4F] dark:text-[#52B788] mb-4">Group Activity</h3>
          <div className="space-y-4">
            {DEMO_ACTIVITIES.map((activity, i) => (
              <div
                key={i}
                className="rounded-2xl bg-white dark:bg-[#1A2F2A] p-4 flex gap-4 items-start shadow-sm border border-[#52B788]/10"
              >
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

      {/* Sidebar: Create group */}
      <div className="space-y-6">
        <div className="rounded-3xl bg-[#2D6A4F] text-white p-6 shadow-md">
          <h3 className="text-xl font-bold mb-2">Create a new group</h3>
          <p className="text-sm text-[#B7E4C7] mb-6 font-medium">
            Invite friends, family, or coworkers to reduce emissions together.
          </p>
          <form className="space-y-4" onSubmit={(e) => e.preventDefault()}>
            <input
              type="text"
              placeholder="Group Name"
              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
            />
            <textarea
              placeholder="Description"
              rows={2}
              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/40 resize-none"
            />
            <input
              type="email"
              placeholder="Invite by emails (comma separated)"
              className="w-full rounded-xl bg-white/10 border border-white/20 px-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:border-white/40"
            />
            <button
              type="button"
              className="w-full rounded-xl bg-white text-[#2D6A4F] py-2.5 font-bold hover:bg-[#F8FAF5] transition"
            >
              Create Group
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
