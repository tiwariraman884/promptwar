import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Emission History",
  description:
    "Browse your complete carbon emission log — filter by date, category, and view detailed breakdowns.",
  alternates: { canonical: "/history" },
};

export default function HistoryLayout({ children }: { children: ReactNode }) {
  return children;
}
