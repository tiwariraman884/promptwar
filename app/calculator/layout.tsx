import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Carbon Calculator",
  description:
    "Calculate your carbon emissions across 10 categories — transport, energy, diet, shopping, waste, digital, food delivery, water, pets, and events.",
  alternates: { canonical: "/calculator" },
};

export default function CalculatorLayout({ children }: { children: ReactNode }) {
  return children;
}
