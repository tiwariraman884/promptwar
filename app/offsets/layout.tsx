import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Carbon Offsets",
  description:
    "Offset your carbon footprint with verified projects — tree planting, clean energy, and community initiatives across India.",
  alternates: { canonical: "/offsets" },
};

export default function OffsetsLayout({ children }: { children: ReactNode }) {
  return children;
}
