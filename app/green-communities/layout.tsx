import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Green Communities",
  description:
    "Join challenges, connect with eco groups, compete on leaderboards, and discuss sustainability with the GreenStep India community.",
  alternates: { canonical: "/green-communities" },
};

export default function GreenCommunitiesLayout({ children }: { children: ReactNode }) {
  return children;
}
