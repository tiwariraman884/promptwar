import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Community",
  description:
    "Join city and state leaderboards, compete in eco-challenges, and connect with fellow eco-warriors across India.",
  alternates: { canonical: "/community" },
};

export default function CommunityLayout({ children }: { children: ReactNode }) {
  return children;
}
