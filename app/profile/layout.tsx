import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Profile",
  description:
    "View your stats, badges, emission history, and eco-coin balance.",
  alternates: { canonical: "/profile" },
};

export default function ProfileLayout({ children }: { children: ReactNode }) {
  return children;
}
