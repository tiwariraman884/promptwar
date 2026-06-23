"use client";

import { useState, useRef } from "react";
import type { UserInputData, CarbonAnalysisResult } from "@/types/carbon";
import { InputForm } from "@/components/carbon/InputForm";
import { RiskScoreCard, RiskScoreCardSkeleton } from "@/components/carbon/RiskScoreCard";
import { ForecastChart, ForecastChartSkeleton } from "@/components/carbon/ForecastChart";
import { RoadmapCard, RoadmapCardSkeleton } from "@/components/carbon/RoadmapCard";
import { EmissionsTimeline, EmissionsTimelineSkeleton } from "@/components/carbon/EmissionsTimeline";

const DEFAULT_INPUT: UserInputData = {
  diet: {
    food_type: "vegetarian",
    meat_meals_per_week: 0,
    dairy_daily: true,
    local_produce_percent: 50,
  },
  travel: {
    commute_mode: "public_transport",
    km_per_week: 30,
    flights_per_year: 1,
  },
  electricity: {
    monthly_kwh: 150,
    energy_source: "grid",
    ac_hours_per_day: 4,
  },
  shopping: {
    monthly_spend_inr: 5000,
    fast_fashion_percent: 40,
    electronics_per_year: 1,
  },
  waste: {
    weekly_waste_kg: 4,
    recycling_habit: "sometimes",
    composting: false,
    plastic_bags_per_week: 5,
  },
  city: "Lucknow",
  household_size: 1,
};

export default function CarbonEnginePage() {
  const [formData, setFormData] = useState<UserInputData>(DEFAULT_INPUT);
  const [step, setStep] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<CarbonAnalysisResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const resultsRef = useRef<HTMLDivElement>(null);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError(null);

    // Scroll to results area immediately to show skeletons
    setTimeout(() => {
      resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 150);

    try {
      const res = await fetch("/api/carbon-analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || "Analysis failed");
      }

      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-emerald-800/10" />
        <div className="relative max-w-5xl mx-auto px-4 pt-8 pb-6 md:pt-12 md:pb-8">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="text-3xl">🧠</span>
              <h1 className="font-heading text-2xl md:text-3xl font-extrabold text-white">
                Carbon Intelligence Engine
              </h1>
            </div>
            <p className="text-sm md:text-base text-gray-400 max-w-xl">
              Analyze your lifestyle data across 5 categories and get personalized carbon insights,
              reduction roadmap, and emission forecasts — tailored for India.
            </p>
          </div>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 space-y-8">
        {/* Input Form */}
        <section>
          <InputForm
            formData={formData}
            setFormData={setFormData}
            step={step}
            setStep={setStep}
            onSubmit={handleSubmit}
            isLoading={isLoading}
          />
        </section>

        {/* Results */}
        <div ref={resultsRef}>
          {(isLoading || result) && (
            <section className="space-y-6">
              {/* Section divider */}
              <div className="flex items-center gap-4">
                <div className="section-divider flex-1" />
                <h2 className="font-heading text-lg font-bold text-white flex items-center gap-2 flex-shrink-0">
                  <span className="text-xl">📊</span> Your Analysis
                </h2>
                <div className="section-divider flex-1" />
              </div>

              {error && (
                <div className="glass-card p-4 border-red-500/30">
                  <p className="text-sm text-red-400">⚠️ {error}</p>
                </div>
              )}

              {/* Results grid */}
              <div className="grid gap-6 lg:grid-cols-2">
                {/* Risk Score */}
                {isLoading ? (
                  <RiskScoreCardSkeleton />
                ) : result ? (
                  <RiskScoreCard data={result.carbon_risk_score} />
                ) : null}

                {/* Forecast */}
                {isLoading ? (
                  <ForecastChartSkeleton />
                ) : result ? (
                  <ForecastChart data={result.monthly_forecast} />
                ) : null}

                {/* Roadmap — full width */}
                <div className="lg:col-span-2">
                  {isLoading ? (
                    <RoadmapCardSkeleton />
                  ) : result ? (
                    <RoadmapCard data={result.reduction_roadmap} />
                  ) : null}
                </div>

                {/* Emissions Timeline — full width */}
                <div className="lg:col-span-2">
                  {isLoading ? (
                    <EmissionsTimelineSkeleton />
                  ) : result ? (
                    <EmissionsTimeline data={result.predicted_emissions_timeline} />
                  ) : null}
                </div>
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  );
}
