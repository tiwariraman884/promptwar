import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Green Map",
  description:
    "Discover eco-friendly spots near you — recycling centers, organic stores, EV charging stations, and community gardens.",
  alternates: { canonical: "/green-map" },
};

export default function GreenMapLayout({ children }: { children: ReactNode }) {
  return children;
}
