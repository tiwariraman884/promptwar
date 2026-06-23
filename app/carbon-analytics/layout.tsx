import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Carbon Analytics",
  description:
    "Track your carbon footprint with detailed reports, emission trends, category breakdowns, and complete history — all in one analytics dashboard.",
  alternates: { canonical: "/carbon-analytics" },
};

export default function CarbonAnalyticsLayout({ children }: { children: ReactNode }) {
  return children;
}
