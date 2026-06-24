import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Analytics • GreenStep",
  description: "Enterprise-grade carbon analytics — daily trends, weekly insights, forecasts, goal tracking, and advanced sustainability metrics.",
};

export default function AnalyticsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
