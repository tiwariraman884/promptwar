"use client";

import Link from "next/link";
import { useSettings } from "@/lib/settings-context";
import { SettingsCard } from "@/components/settings/SettingsCard";
import { SettingsToggle } from "@/components/settings/SettingsToggle";
import { showSettingsToast } from "@/components/settings/SettingsToast";
import { IconArrowLeft } from "@/components/icons/EcoIcons";

type NotifKey = keyof ReturnType<typeof useSettings>["notifications"];

interface ToggleRow {
  key: NotifKey;
  label: string;
  locked?: boolean;
}

const GROUPS: { title: string; description: string; emoji: string; items: ToggleRow[] }[] = [
  {
    title: "Account Notifications",
    description: "Security and account-related alerts",
    emoji: "🔐",
    items: [
      { key: "loginAlerts", label: "Login alerts" },
      { key: "securityAlerts", label: "Security alerts", locked: true },
      { key: "passwordChanges", label: "Password changes" },
      { key: "accountUpdates", label: "Account updates" },
    ],
  },
  {
    title: "Eco Platform",
    description: "Carbon tracking and sustainability updates",
    emoji: "🌿",
    items: [
      { key: "dailyCarbonReminders", label: "Daily carbon reminders" },
      { key: "weeklyReports", label: "Weekly sustainability reports" },
      { key: "streakReminders", label: "Streak reminders" },
      { key: "challengeUpdates", label: "Challenge updates" },
      { key: "badgeUnlocks", label: "Badge unlock alerts" },
      { key: "ecoCoinRewards", label: "Eco coin rewards" },
    ],
  },
  {
    title: "Email Notifications",
    description: "Email digests and newsletters",
    emoji: "📧",
    items: [
      { key: "productUpdates", label: "Product updates" },
      { key: "newsletter", label: "Newsletter" },
      { key: "sustainabilityTips", label: "Sustainability tips" },
      { key: "monthlySummaries", label: "Monthly summaries" },
    ],
  },
  {
    title: "Push Notifications",
    description: "Real-time browser and mobile alerts",
    emoji: "🔔",
    items: [
      { key: "browserNotifications", label: "Browser notifications" },
      { key: "mobileNotifications", label: "Mobile notifications" },
      { key: "instantAlerts", label: "Instant alerts" },
    ],
  },
];

export default function NotificationSettingsPage() {
  const { notifications, updateNotifications } = useSettings();

  function handleToggle(key: NotifKey, val: boolean) {
    updateNotifications({ [key]: val });
    showSettingsToast(val ? "Enabled" : "Disabled", "info");
  }

  async function handleBrowserPermission() {
    if (!("Notification" in window)) {
      showSettingsToast("Browser notifications not supported", "error");
      return;
    }
    const permission = await Notification.requestPermission();
    if (permission === "granted") {
      updateNotifications({ browserNotifications: true });
      showSettingsToast("Browser notifications enabled");
    } else {
      showSettingsToast("Permission denied", "error");
    }
  }

  return (
    <div className="min-h-screen bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-white pb-28 md:pb-8">
      <div className="mx-auto max-w-2xl px-4 py-8 space-y-6">
        <Link href="/settings" className="inline-flex items-center gap-2 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:underline">
          <IconArrowLeft size={16} /> Settings
        </Link>

        <div>
          <h1 className="text-2xl font-bold">Notifications</h1>
          <p className="mt-1 text-sm text-[#6B7C6E] dark:text-white/50">
            Control which alerts and updates you receive.
          </p>
        </div>

        {/* Master pause */}
        <SettingsCard>
          <div className="flex items-center justify-between">
            <div>
              <p className="font-bold">⏸️ Pause all notifications</p>
              <p className="text-xs text-[#6B7C6E] dark:text-white/50 mt-0.5">Temporarily silence everything</p>
            </div>
            <SettingsToggle
              checked={notifications.paused}
              onChange={(val) => {
                updateNotifications({ paused: val });
                showSettingsToast(val ? "All notifications paused" : "Notifications resumed");
              }}
            />
          </div>
        </SettingsCard>

        {/* Groups */}
        {GROUPS.map((group) => (
          <SettingsCard
            key={group.title}
            title={`${group.emoji} ${group.title}`}
            description={group.description}
          >
            <div className={`space-y-0 -mx-5 -mb-5 ${notifications.paused ? "opacity-40 pointer-events-none" : ""}`}>
              {group.items.map((item, idx) => (
                <div
                  key={item.key}
                  className={`flex items-center justify-between px-5 py-3.5 ${
                    idx !== 0 ? "border-t border-[#D1FAE5]/60 dark:border-white/5" : ""
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <label className="text-sm font-medium cursor-pointer">{item.label}</label>
                    {item.locked && (
                      <span className="text-[10px] font-bold text-[#6B7C6E] dark:text-white/40 bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded-full">Required</span>
                    )}
                  </div>
                  <SettingsToggle
                    checked={notifications[item.key] as boolean}
                    onChange={(val) => handleToggle(item.key, val)}
                    disabled={item.locked}
                  />
                </div>
              ))}

              {/* Browser notification permission button */}
              {group.title === "Push Notifications" && (
                <div className="px-5 pb-4 pt-2 border-t border-[#D1FAE5]/60 dark:border-white/5">
                  <button
                    onClick={handleBrowserPermission}
                    className="w-full rounded-xl border border-[#52B788]/30 py-2.5 text-sm font-medium text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-white/5 transition"
                  >
                    🔔 Request Browser Permission
                  </button>
                </div>
              )}
            </div>
          </SettingsCard>
        ))}

        {/* Schedule */}
        <SettingsCard title="⏰ Notification Schedule" description="Set quiet hours and weekend preferences">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold mb-3">Quiet Hours</p>
              <div className="flex items-center gap-3">
                <div className="flex-1">
                  <label className="text-xs text-[#6B7C6E] mb-1 block">From</label>
                  <input
                    type="time"
                    value={notifications.quietFrom}
                    onChange={(e) => updateNotifications({ quietFrom: e.target.value })}
                    className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-3 py-2 text-sm focus:border-[#2D6A4F] focus:outline-none"
                  />
                </div>
                <span className="text-[#6B7C6E] mt-5">to</span>
                <div className="flex-1">
                  <label className="text-xs text-[#6B7C6E] mb-1 block">To</label>
                  <input
                    type="time"
                    value={notifications.quietTo}
                    onChange={(e) => updateNotifications({ quietTo: e.target.value })}
                    className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-3 py-2 text-sm focus:border-[#2D6A4F] focus:outline-none"
                  />
                </div>
              </div>
            </div>

            <div className="flex items-center justify-between pt-2 border-t border-[#D1FAE5]/60 dark:border-white/5">
              <label className="text-sm font-medium cursor-pointer">Don&apos;t notify on weekends</label>
              <SettingsToggle
                checked={notifications.noWeekends}
                onChange={(val) => updateNotifications({ noWeekends: val })}
              />
            </div>
          </div>
        </SettingsCard>

        {/* Link to notification center */}
        <Link
          href="/notifications"
          className="flex items-center justify-center gap-2 w-full rounded-xl border border-[#52B788]/30 py-3 text-sm font-bold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-white/5 transition"
        >
          📬 View Notification History
        </Link>
      </div>
    </div>
  );
}
