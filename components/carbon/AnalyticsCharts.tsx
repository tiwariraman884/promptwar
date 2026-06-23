"use client";

import {
  PieChart, Pie, Cell, ResponsiveContainer, Tooltip as RechartsTooltip,
  LineChart, Line, CartesianGrid, XAxis, YAxis, BarChart, Bar,
} from "recharts";

/* ─── Types ─── */
interface CategoryItem {
  name: string;
  value: number;
  color: string;
  icon: string;
}

interface MonthlyItem {
  month: string;
  value: number;
}

/* ─── Donut Chart ─── */
export function CategoryDonutChart({
  data,
  onSliceClick,
}: {
  data: CategoryItem[];
  onSliceClick: (index: number) => void;
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={data}
          innerRadius={60}
          outerRadius={80}
          paddingAngle={5}
          dataKey="value"
          onClick={(_, index) => onSliceClick(index)}
          className="cursor-pointer"
        >
          {data.map((entry, index) => (
            <Cell key={`cell-${index}`} fill={entry.color} />
          ))}
        </Pie>
        <RechartsTooltip formatter={(val: number) => `${val} kg`} />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* ─── Monthly Trend Line Chart ─── */
export function MonthlyTrendChart({ data }: { data: MonthlyItem[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52B78820" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <RechartsTooltip
          contentStyle={{ borderRadius: "12px", border: "none", boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)" }}
          formatter={(val: number) => [`${val} kg`, "Footprint"]}
        />
        <Line type="monotone" dataKey="value" stroke="#2D6A4F" strokeWidth={3} dot={{ r: 4, fill: "#2D6A4F" }} activeDot={{ r: 6 }} />
      </LineChart>
    </ResponsiveContainer>
  );
}

/* ─── Monthly Bar Chart ─── */
export function MonthlyBarChart({ data }: { data: MonthlyItem[] }) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#52B78820" />
        <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 12 }} />
        <RechartsTooltip formatter={(val: number) => [`${val} kg`, "Emissions"]} />
        <Bar dataKey="value" fill="#2D6A4F" radius={[8, 8, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
