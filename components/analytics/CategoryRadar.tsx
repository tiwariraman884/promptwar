"use client";

import {
  ResponsiveContainer, RadarChart, Radar, PolarGrid,
  PolarAngleAxis, PolarRadiusAxis, Legend,
} from "recharts";
import { INDIA_DAILY_AVERAGE_KG } from "@/lib/emission-factors";

interface CategoryRadarProps {
  userCategories: Record<string, number>; // category → kg total
  days: number;
}

const INDIA_CATEGORY_SHARES: Record<string, number> = {
  transport: 0.20,
  energy: 0.29,
  diet: 0.24,
  shopping: 0.15,
  waste: 0.12,
};

export function CategoryRadar({ userCategories, days }: CategoryRadarProps) {
  const categories = Object.keys(INDIA_CATEGORY_SHARES);

  const chartData = categories.map(cat => {
    const userKg = userCategories[cat] ?? 0;
    const userDailyKg = userKg / Math.max(days, 1);
    const indiaDaily = INDIA_DAILY_AVERAGE_KG * (INDIA_CATEGORY_SHARES[cat] ?? 0.2);

    return {
      category: cat.charAt(0).toUpperCase() + cat.slice(1),
      you: Math.round(userDailyKg * 100) / 100,
      india: Math.round(indiaDaily * 100) / 100,
    };
  });

  return (
    <ResponsiveContainer width="100%" height={300}>
      <RadarChart data={chartData} cx="50%" cy="50%" outerRadius="75%">
        <PolarGrid stroke="#52B78830" />
        <PolarAngleAxis
          dataKey="category"
          tick={{ fontSize: 12, fontWeight: 600, fill: "#666" }}
        />
        <PolarRadiusAxis
          tick={{ fontSize: 10, fill: "#999" }}
          axisLine={false}
        />
        <Radar
          name="You"
          dataKey="you"
          stroke="#2D6A4F"
          fill="#2D6A4F"
          fillOpacity={0.15}
          strokeWidth={2}
        />
        <Radar
          name="India Avg"
          dataKey="india"
          stroke="#EF4444"
          fill="#EF4444"
          fillOpacity={0.05}
          strokeWidth={1.5}
          strokeDasharray="4 3"
        />
        <Legend
          iconType="circle"
          iconSize={8}
          wrapperStyle={{ fontSize: "12px", fontWeight: 600 }}
        />
      </RadarChart>
    </ResponsiveContainer>
  );
}
