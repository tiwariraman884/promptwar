import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AI Eco Coach",
  description:
    "Get personalized sustainability advice from an AI coach — ask about carbon reduction, Indian emissions, and eco-friendly alternatives.",
  alternates: { canonical: "/ai-coach" },
};

export default function AiCoachLayout({ children }: { children: ReactNode }) {
  return children;
}
