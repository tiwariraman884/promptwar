import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "Settings",
  description:
    "Manage your profile, appearance, language, notifications, privacy, and account settings.",
  alternates: { canonical: "/settings" },
};

export default function SettingsLayout({ children }: { children: ReactNode }) {
  return children;
}
