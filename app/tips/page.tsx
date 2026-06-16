"use client";

import type { ReactNode } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { CheckCircle2, Coins, Lightbulb, Recycle, TrainFront, Utensils, Zap } from "lucide-react";
import { useEffect, useState } from "react";
import { MotionPage } from "@/components/motion-page";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { demoDashboard, demoTips } from "@/lib/demo-data";
import { CATEGORY_LABELS, type EmissionCategory } from "@/lib/emission-factors";
import { QuickWinsCarousel } from "@/components/quick-wins-carousel";

type Tip = {
  id: string;
  category: EmissionCategory;
  action: string;
  monthlySavingKg: number;
  context: string;
};

const iconMap: Partial<Record<EmissionCategory, ReactNode>> = {
  transport: <TrainFront aria-hidden size={20} />,
  energy: <Zap aria-hidden size={20} />,
  diet: <Utensils aria-hidden size={20} />,
  shopping: <Lightbulb aria-hidden size={20} />,
  waste: <Recycle aria-hidden size={20} />,
  digital: <Lightbulb aria-hidden size={20} />
};

function TipCard({
  tip,
  completed,
  onComplete,
  preferred
}: {
  tip: Tip;
  completed: boolean;
  onComplete: (tip: Tip) => void;
  preferred?: boolean;
}) {
  const prefersReduced = useReducedMotion();

  return (
    <motion.div
      animate={completed && !prefersReduced ? { scale: [1, 1.02, 1] } : { scale: 1 }}
      transition={{ duration: prefersReduced ? 0 : 0.28 }}
    >
      <Card className={preferred ? "border-emerald-300 bg-emerald-50/60 dark:border-accent/30 dark:bg-accent/5" : undefined}>
        <div className="flex items-start gap-3">
          <div className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-accent/15 dark:text-accent">
            {iconMap[tip.category]}
          </div>
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-center gap-2">
              <Badge tone={preferred ? "dark" : "green"}>
                {CATEGORY_LABELS[tip.category]}
              </Badge>
              {preferred && <Badge tone="amber">Personalized</Badge>}
            </div>
            <h3 className="mt-3 font-heading text-lg font-extrabold text-gray-900 dark:text-white">
              {tip.action}
            </h3>
            <p className="mt-1 text-sm leading-6 text-gray-500 dark:text-white/70">
              {tip.context}
            </p>
            <div className="mt-4 flex flex-wrap items-center justify-between gap-3">
              <p className="text-sm font-extrabold text-emerald-600 dark:text-accent">
                Saves {tip.monthlySavingKg.toFixed(1)} kgCO2e/month
              </p>
              <Button
                disabled={completed}
                onClick={() => onComplete(tip)}
                type="button"
                variant={completed ? "secondary" : "default"}
              >
                {completed ? (
                  <CheckCircle2 aria-hidden size={18} />
                ) : (
                  <Coins aria-hidden size={18} />
                )}
                {completed ? "Done" : "Mark as done"}
              </Button>
              {preferred && (
                <span className="sr-only">Recommended based on your highest emission category</span>
              )}
            </div>
          </div>
        </div>
      </Card>
    </motion.div>
  );
}

export default function TipsPage() {
  const [topCategory, setTopCategory] = useState<EmissionCategory>(
    demoDashboard.topCategory
  );
  const [completed, setCompleted] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState<Record<string, boolean>>({});
  const [message, setMessage] = useState("");

  useEffect(() => {
    fetch("/api/dashboard")
      .then((response) => response.json())
      .then((payload) => {
        if (payload.data?.topCategory) setTopCategory(payload.data.topCategory);
      })
      .catch(() => setTopCategory(demoDashboard.topCategory));
  }, []);

  const completeTip = async (tip: Tip) => {
    if (loading[tip.id]) return;
    setLoading((current) => ({ ...current, [tip.id]: true }));

    try {
      const response = await fetch("/api/tips/complete", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ tipId: tip.id })
      });
      const payload = await response.json();

      if (payload.error) {
        setMessage(`❌ ${payload.error}`);
      } else {
        // Only mark completed AFTER successful API response
        setCompleted((current) => ({ ...current, [tip.id]: true }));
        setMessage(`Nice step. +${payload.data.coinsEarned} eco-coins added. 🌿`);
      }
    } catch {
      setMessage("❌ Failed to complete tip. Please try again.");
    } finally {
      setLoading((current) => ({ ...current, [tip.id]: false }));
    }
  };

  const sections: Array<{ title: string; description: string; tips: Tip[] }> = [
    {
      title: "Quick wins",
      description: "Actions that usually save under 0.5 kg/day.",
      tips: demoTips.quickWins
    },
    {
      title: "Big impact",
      description: "Actions that usually save over 1 kg/day.",
      tips: demoTips.bigImpact
    },
    {
      title: "India-specific",
      description: "Local context for Indian homes and city routines.",
      tips: demoTips.indiaSpecific
    }
  ];

  return (
    <MotionPage>
      <section className="space-y-8">
        {/* Hero header */}
        <div className="relative rounded-card p-5 text-gray-900 dark:text-white shadow-soft overflow-hidden glass-card border-0">
          {/* Background image */}
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('/images/tips-hero-bg.png')" }}
          />
          <div className="absolute inset-0 cinematic-overlay" />

          <div className="relative z-10">
            <Badge className="bg-white/10 text-white/80" tone="dark">
              Highest category: {CATEGORY_LABELS[topCategory]}
            </Badge>
            <h1 className="mt-4 font-heading text-3xl font-extrabold">
              Tips & actions
            </h1>
            <p className="mt-2 max-w-2xl text-sm leading-6 text-white/75">
              Small changes first, bigger wins when they fit your routine.
            </p>
          </div>
        </div>

        {message && (
          <p role="status" aria-live="polite" className="rounded-card bg-emerald-50 p-3 text-sm font-bold text-emerald-700 dark:bg-accent/10 dark:text-accent">
            {message}
          </p>
        )}

        {/* ── Quick Wins Carousel Section ── */}
        <QuickWinsCarousel />

        {/* ── Actionable Tips Grid ── */}
        {sections.map((section) => (
          <section className="space-y-3" key={section.title}>
            <CardHeader className="mb-0 px-0">
              <CardTitle>{section.title}</CardTitle>
              <CardDescription>{section.description}</CardDescription>
            </CardHeader>
            <div className="grid gap-3 lg:grid-cols-2">
              {section.tips.map((tip) => (
                <TipCard
                  completed={Boolean(completed[tip.id])}
                  key={tip.id}
                  onComplete={completeTip}
                  preferred={tip.category === topCategory}
                  tip={tip}
                />
              ))}
            </div>
          </section>
        ))}
      </section>
    </MotionPage>
  );
}
