import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Carbon Scanner",
  description:
    "Scan products by name, barcode, or image to check their carbon footprint — get sustainability ratings and greener alternatives.",
  alternates: { canonical: "/scanner" },
};

export default function ScannerLayout({ children }: { children: ReactNode }) {
  return children;
}
