import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Dashboard",
  description:
    "Track your daily CO₂ footprint — view today's emissions, weekly trends, streaks, and eco-coins earned.",
  alternates: { canonical: "/dashboard" },
};

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return children;
}
