import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Eco Tips",
  description:
    "Actionable tips to reduce your carbon footprint — personalized recommendations based on your highest emission categories.",
  alternates: { canonical: "/tips" },
};

export default function TipsLayout({ children }: { children: ReactNode }) {
  return children;
}
