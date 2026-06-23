import type { Metadata } from "next";
import type { ReactNode } from "react";

export const metadata: Metadata = {
  title: "AI Sustainability Assistant",
  description:
    "Chat with EcoCoach AI for personalized carbon advice, and explore curated eco tips to reduce your environmental impact.",
  alternates: { canonical: "/ai-assistant" },
};

export default function AiAssistantLayout({ children }: { children: ReactNode }) {
  return children;
}
