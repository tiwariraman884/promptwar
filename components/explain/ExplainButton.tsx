"use client";

import { useState, useCallback } from "react";
import { ExplainSheet } from "./ExplainSheet";
import type { AIExplanation, CarbonHealthScore, EmissionBreakdown, CategoryEmission, CarbonTwinProfile, ForecastPoint, RoadmapWeek } from "@/lib/types/carbon-twin-types";
import { explainHealthScore, explainCategoryEmission, explainForecast } from "@/lib/rule-based-explainer";

type ExplainType = "health_score" | "forecast" | "roadmap_week" | "category" | "total";

interface ExplainContext {
  type: ExplainType;
  healthScore?: CarbonHealthScore;
  breakdown?: EmissionBreakdown;
  category?: CategoryEmission;
  profile?: CarbonTwinProfile;
  forecast?: ForecastPoint;
  snapshots?: { year_month: string; total_kg: number }[];
  roadmapWeek?: RoadmapWeek;
}

interface ExplainButtonProps {
  context: ExplainContext;
}

export function ExplainButton({ context }: ExplainButtonProps): JSX.Element {
  const [isOpen, setIsOpen] = useState(false);
  const [explanation, setExplanation] = useState<AIExplanation | null>(null);
  const [loading, setLoading] = useState(false);

  const handleClick = useCallback(async (): Promise<void> => {
    setIsOpen(true);
    setLoading(true);

    try {
      let result: AIExplanation | null = null;

      switch (context.type) {
        case "health_score":
          if (context.healthScore && context.breakdown) {
            result = explainHealthScore(context.healthScore, context.breakdown);
          }
          break;

        case "category":
        case "total":
          if (context.category && context.profile) {
            result = explainCategoryEmission(context.category, context.profile);
          }
          break;

        case "forecast":
          if (context.forecast && context.snapshots) {
            result = explainForecast(context.forecast, context.snapshots);
          }
          break;

        case "roadmap_week":
          if (context.roadmapWeek && context.breakdown) {
            // AI-powered explanation for roadmap
            const res = await fetch("/api/explain", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                weekAction: context.roadmapWeek,
                breakdown: context.breakdown,
              }),
            });
            const data = await res.json();
            if (data.success) {
              result = data.data;
            }
          }
          break;
      }

      setExplanation(result);
    } catch {
      setExplanation(null);
    } finally {
      setLoading(false);
    }
  }, [context]);

  return (
    <>
      <button
        onClick={handleClick}
        className="inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs text-gray-400 hover:text-emerald-400 hover:bg-emerald-900/20 transition-colors"
        title="Why this number?"
      >
        <span>ℹ️</span>
        <span>Why? / क्यों?</span>
      </button>

      <ExplainSheet
        isOpen={isOpen}
        onClose={() => setIsOpen(false)}
        explanation={explanation}
        loading={loading}
      />
    </>
  );
}
