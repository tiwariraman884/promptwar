"use client";

interface HotspotHeatmapProps {
  data: { dayOfWeek: string; category: string; intensity: number }[];
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];
const CATEGORY_EMOJIS: Record<string, string> = {
  transport: "🚗",
  energy: "⚡",
  diet: "🍽️",
  shopping: "🛍️",
  waste: "♻️",
  digital: "💻",
  food_delivery: "🛵",
  water: "💧",
  pet: "🐾",
  events: "🎉",
};

function getHeatColor(intensity: number, maxIntensity: number): string {
  if (maxIntensity === 0) return "bg-neutral-50 dark:bg-neutral-800/30";
  const ratio = intensity / maxIntensity;
  if (ratio >= 0.75) return "bg-[#2D6A4F] text-white";
  if (ratio >= 0.5) return "bg-[#52B788] text-white";
  if (ratio >= 0.25) return "bg-[#B7E4C7] dark:bg-[#2D6A4F]/40 text-[#1B4332] dark:text-[#B7E4C7]";
  if (ratio > 0) return "bg-[#D8F3DC] dark:bg-[#1A2F2A] text-[#2D6A4F]";
  return "bg-neutral-50 dark:bg-neutral-800/30 text-neutral-300 dark:text-neutral-600";
}

export function HotspotHeatmap({ data }: HotspotHeatmapProps) {
  const categories = [...new Set(data.map(d => d.category))];
  const maxIntensity = Math.max(...data.map(d => d.intensity), 0.01);

  const getIntensity = (day: string, cat: string): number =>
    data.find(d => d.dayOfWeek === day && d.category === cat)?.intensity ?? 0;

  return (
    <div className="overflow-x-auto">
      <table className="w-full border-separate border-spacing-1.5">
        <thead>
          <tr>
            <th className="text-xs font-bold text-neutral-500 text-left pb-2 w-20" />
            {categories.map(cat => (
              <th
                key={cat}
                className="text-xs font-bold text-neutral-500 uppercase tracking-wider pb-2 text-center"
                title={cat}
              >
                <span className="text-lg">{CATEGORY_EMOJIS[cat] ?? "📊"}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {DAYS.map(day => (
            <tr key={day}>
              <td className="text-xs font-bold text-neutral-500 pr-2">{day}</td>
              {categories.map(cat => {
                const intensity = getIntensity(day, cat);
                return (
                  <td key={cat} className="text-center">
                    <div
                      className={`rounded-lg py-2 px-1 text-xs font-bold transition-all hover:scale-110 cursor-default ${getHeatColor(intensity, maxIntensity)}`}
                      title={`${day} • ${cat}: ${intensity.toFixed(1)} kg`}
                    >
                      {intensity > 0 ? intensity.toFixed(1) : "–"}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>

      {/* Legend */}
      <div className="flex items-center justify-end gap-2 mt-3">
        <span className="text-xs text-neutral-400">Low</span>
        <div className="flex gap-0.5">
          <div className="w-5 h-3 rounded-sm bg-[#D8F3DC] dark:bg-[#1A2F2A]" />
          <div className="w-5 h-3 rounded-sm bg-[#B7E4C7] dark:bg-[#2D6A4F]/40" />
          <div className="w-5 h-3 rounded-sm bg-[#52B788]" />
          <div className="w-5 h-3 rounded-sm bg-[#2D6A4F]" />
        </div>
        <span className="text-xs text-neutral-400">High</span>
      </div>
    </div>
  );
}
