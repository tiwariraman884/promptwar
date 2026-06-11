"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { IconArrowLeft, IconLock } from "@/components/icons/EcoIcons";

const NOTIFICATION_GROUPS = [
  {
    group: "Weekly Reports",
    description: "Your carbon footprint summary every Sunday",
    settings: [
      { id: "weekly_report_email", label: "Email digest", defaultValue: true },
      { id: "weekly_report_push", label: "Push notification", defaultValue: false },
    ],
  },
  {
    group: "AI Coach",
    description: "Tips and reminders from your EcoCoach",
    settings: [
      { id: "coach_tips", label: "Daily eco tips", defaultValue: true },
      { id: "coach_milestone", label: "Milestone alerts", defaultValue: true },
      { id: "coach_nudge", label: "Inactivity nudges", defaultValue: false },
    ],
  },
  {
    group: "Group & Challenges",
    description: "Updates from your groups and active challenges",
    settings: [
      { id: "group_activity", label: "Group member activity", defaultValue: true },
      { id: "challenge_progress", label: "Challenge progress reminders", defaultValue: true },
      { id: "leaderboard_change", label: "Leaderboard changes", defaultValue: false },
    ],
  },
  {
    group: "Offsets & Store",
    description: "Order updates and new project launches",
    settings: [
      { id: "offset_confirmation", label: "Offset certificate issued", defaultValue: true },
      { id: "new_project", label: "New offset projects available", defaultValue: false },
      { id: "store_offers", label: "Eco store offers", defaultValue: false },
    ],
  },
  {
    group: "Platform",
    description: "Important account and security alerts",
    settings: [
      { id: "security_alerts", label: "Security alerts", defaultValue: true, locked: true },
      { id: "product_updates", label: "Product updates & changelog", defaultValue: true },
      { id: "research_surveys", label: "Research surveys (help us improve)", defaultValue: false },
    ],
  },
];

type Prefs = Record<string, boolean>;

function Toggle({
  id,
  checked,
  onChange,
  disabled,
}: {
  id: string;
  checked: boolean;
  onChange: (val: boolean) => void;
  disabled?: boolean;
}) {
  return (
    <button
      id={id}
      role="switch"
      aria-checked={checked}
      disabled={disabled}
      onClick={() => !disabled && onChange(!checked)}
      className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-[#52B788] focus:ring-offset-2 ${
        checked ? "bg-[#2D6A4F]" : "bg-gray-200 dark:bg-white/20"
      } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
    >
      <span
        className={`inline-block h-4 w-4 rounded-full bg-white shadow transition-transform ${
          checked ? "translate-x-6" : "translate-x-1"
        }`}
      />
    </button>
  );
}

function Toast({ message }: { message: string }) {
  if (!message) return null;
  return (
    <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[#2D6A4F] px-6 py-3 text-sm font-bold text-white shadow-lg">
      {message}
    </div>
  );
}

export default function NotificationSettingsPage() {
  const [paused, setPaused] = useState(false);
  const [prefs, setPrefs] = useState<Prefs>(() => {
    const defaults: Prefs = {};
    NOTIFICATION_GROUPS.forEach((g) =>
      g.settings.forEach((s) => (defaults[s.id] = s.defaultValue))
    );
    return defaults;
  });
  const [quietFrom, setQuietFrom] = useState("22:00");
  const [quietTo, setQuietTo] = useState("07:00");
  const [noWeekends, setNoWeekends] = useState(false);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("eco_notifications");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.prefs) setPrefs(parsed.prefs);
        if (typeof parsed.paused === "boolean") setPaused(parsed.paused);
        if (parsed.quietFrom) setQuietFrom(parsed.quietFrom);
        if (parsed.quietTo) setQuietTo(parsed.quietTo);
        if (typeof parsed.noWeekends === "boolean") setNoWeekends(parsed.noWeekends);
      } catch {
        // ignore
      }
    }
  }, []);

  function handleToggle(id: string, val: boolean) {
    setPrefs((p) => ({ ...p, [id]: val }));
  }

  function handleSave() {
    const data = { prefs, paused, quietFrom, quietTo, noWeekends };
    localStorage.setItem("eco_notifications", JSON.stringify(data));
    setToast("Notification preferences saved!");
    setTimeout(() => setToast(""), 3000);
  }

  return (
    <div className="min-h-screen bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-white">
      <Toast message={toast} />

      <div className="mx-auto max-w-2xl px-4 py-8">
        <Link
          href="/profile"
          className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:underline"
        >
          <IconArrowLeft size={16} /> Back
        </Link>

        <h1 className="text-2xl font-bold mb-1">Notifications</h1>
        <p className="text-sm text-[#6B7C6E] dark:text-white/60 mb-6">
          Control which alerts and updates you receive from GreenStep.
        </p>

        {/* Master pause toggle */}
        <div className="mb-6 flex items-center justify-between rounded-2xl border border-[#D1FAE5] dark:border-white/10 bg-white dark:bg-[#111C18] px-4 py-4">
          <div>
            <p className="font-bold">Pause all notifications</p>
            <p className="text-xs text-[#6B7C6E] dark:text-white/60 mt-0.5">Temporarily silence everything</p>
          </div>
          <Toggle id="master-pause" checked={paused} onChange={setPaused} />
        </div>

        {/* Notification groups */}
        <div className="space-y-4 mb-8">
          {NOTIFICATION_GROUPS.map((group) => (
            <div
              key={group.group}
              className={`rounded-2xl border bg-white dark:bg-[#111C18] overflow-hidden transition ${
                paused ? "opacity-50 pointer-events-none" : "border-[#D1FAE5] dark:border-white/10"
              }`}
            >
              <div className="px-4 pt-4 pb-2">
                <p className="font-bold text-[#1B4332] dark:text-white">{group.group}</p>
                <p className="text-xs text-[#6B7C6E] dark:text-white/60">{group.description}</p>
              </div>
              <div className="divide-y divide-[#D1FAE5]/60 dark:divide-white/5">
                {group.settings.map((setting) => {
                  const locked = "locked" in setting && setting.locked;
                  return (
                    <div key={setting.id} className="flex items-center justify-between px-4 py-3">
                      <div className="flex items-center gap-2">
                        <label htmlFor={setting.id} className="text-sm font-medium cursor-pointer">
                          {setting.label}
                        </label>
                        {locked && (
                          <span title="Required for account security">
                            <IconLock size={13} className="text-[#6B7C6E] dark:text-white/40" />
                          </span>
                        )}
                      </div>
                      <Toggle
                        id={setting.id}
                        checked={prefs[setting.id] ?? setting.defaultValue}
                        onChange={(val) => handleToggle(setting.id, val)}
                        disabled={!!locked}
                      />
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Quiet hours */}
        <h2 className="text-lg font-bold mb-3">Notification Schedule</h2>
        <div className="rounded-2xl border border-[#D1FAE5] dark:border-white/10 bg-white dark:bg-[#111C18] divide-y divide-[#D1FAE5]/60 dark:divide-white/5 overflow-hidden mb-6">
          <div className="px-4 py-4">
            <p className="text-sm font-semibold mb-3">Quiet hours</p>
            <div className="flex items-center gap-3">
              <div className="flex-1">
                <label className="text-xs text-[#6B7C6E] mb-1 block">From</label>
                <input
                  type="time"
                  value={quietFrom}
                  onChange={(e) => setQuietFrom(e.target.value)}
                  className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-3 py-2 text-sm focus:border-[#2D6A4F] focus:outline-none"
                />
              </div>
              <span className="text-[#6B7C6E] mt-5">to</span>
              <div className="flex-1">
                <label className="text-xs text-[#6B7C6E] mb-1 block">To</label>
                <input
                  type="time"
                  value={quietTo}
                  onChange={(e) => setQuietTo(e.target.value)}
                  className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-3 py-2 text-sm focus:border-[#2D6A4F] focus:outline-none"
                />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-between px-4 py-4">
            <label htmlFor="no-weekends" className="text-sm font-medium cursor-pointer">
              Don&apos;t notify on weekends
            </label>
            <Toggle id="no-weekends" checked={noWeekends} onChange={setNoWeekends} />
          </div>
        </div>

        <button
          onClick={handleSave}
          className="w-full rounded-xl bg-[#2D6A4F] py-3.5 text-sm font-bold text-white hover:bg-[#1B4332] transition"
        >
          Save Preferences
        </button>
      </div>
    </div>
  );
}
