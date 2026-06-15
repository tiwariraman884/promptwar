import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Eco Store",
  description:
    "Shop eco-friendly products — sustainable alternatives for everyday life, from reusable bags to solar chargers.",
  alternates: { canonical: "/eco-store" },
};

export default function EcoStoreLayout({ children }: { children: ReactNode }) {
  return children;
}
