"use client";

import { useState, useEffect, useCallback } from "react";
import { RoadmapCard } from "./RoadmapCard";
import { calcFullBreakdown } from "@/lib/carbon-engine-v2";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { AIRoadmap, RoadmapWeek, CarbonTwinProfile } from "@/lib/types/carbon-twin-types";

export function AIRoadmapWidget(): JSX.Element {
  const [roadmap, setRoadmap] = useState<AIRoadmap | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profile, setProfile] = useState<CarbonTwinProfile | null>(null);

  const loadData = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setLoading(false); return; }

      const [twinResult, roadmapResult, completionsResult] = await Promise.all([
        supabase.from("carbon_twin").select("user_id,diet,travel,energy,shopping,waste,created_at,updated_at").eq("user_id", user.id).limit(1).single(),
        supabase.from("ai_roadmaps").select("roadmap_json,generated_at,total_weeks,projected_saving_kg").eq("user_id", user.id).limit(1).single(),
        supabase.from("roadmap_completions").select("week_number").eq("user_id", user.id).limit(20),
      ]);

      if (twinResult.data) {
        const p: CarbonTwinProfile = {
          userId: twinResult.data.user_id, createdAt: twinResult.data.created_at,
          updatedAt: twinResult.data.updated_at, diet: twinResult.data.diet,
          travel: twinResult.data.travel, energy: twinResult.data.energy,
          shopping: twinResult.data.shopping, waste: twinResult.data.waste,
        };
        setProfile(p);
      }

      if (roadmapResult.data) {
        const completedWeeks = new Set((completionsResult.data ?? []).map(c => c.week_number));
        const rm = roadmapResult.data.roadmap_json as AIRoadmap;
        rm.weeks = rm.weeks.map((w: RoadmapWeek) => ({
          ...w, isCompleted: completedWeeks.has(w.weekNumber),
        }));
        setRoadmap(rm);
      }
    } catch {
      setError("Failed to load roadmap data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  const handleGenerate = useCallback(async (): Promise<void> => {
    if (!profile) return;
    setGenerating(true);
    setError(null);
    try {
      const breakdown = calcFullBreakdown(profile);
      const res = await fetch("/api/roadmap/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: profile.userId, breakdown, twinProfile: profile }),
      });
      const data = await res.json();
      if (!res.ok || !data.success) throw new Error(data.error ?? "Generation failed");

      const newRoadmap: AIRoadmap = data.data;
      setRoadmap(newRoadmap);

      // Save to Supabase
      if (isSupabaseConfigured()) {
        const supabase = createClient();
        await supabase.from("ai_roadmaps").upsert({
          user_id: profile.userId,
          roadmap_json: newRoadmap,
          generated_at: newRoadmap.generatedAt,
          total_weeks: newRoadmap.totalWeeks,
          projected_saving_kg: newRoadmap.totalProjectedSavingKg,
        }, { onConflict: "user_id" });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Generation failed");
    } finally {
      setGenerating(false);
    }
  }, [profile]);

  const handleToggleComplete = useCallback(async (weekNumber: number): Promise<void> => {
    if (!roadmap || !profile) return;

    const week = roadmap.weeks.find(w => w.weekNumber === weekNumber);
    if (!week) return;

    const newCompleted = !week.isCompleted;
    setRoadmap({
      ...roadmap,
      weeks: roadmap.weeks.map(w =>
        w.weekNumber === weekNumber ? { ...w, isCompleted: newCompleted } : w
      ),
    });

    if (isSupabaseConfigured()) {
      const supabase = createClient();
      if (newCompleted) {
        await supabase.from("roadmap_completions").upsert(
          { user_id: profile.userId, week_number: weekNumber },
          { onConflict: "user_id,week_number" }
        );
      } else {
        await supabase.from("roadmap_completions")
          .delete().eq("user_id", profile.userId).eq("week_number", weekNumber);
      }
    }
  }, [roadmap, profile]);

  const completedCount = roadmap?.weeks.filter(w => w.isCompleted).length ?? 0;
  const savedSoFar = roadmap?.weeks
    .filter(w => w.isCompleted)
    .reduce((sum, w) => sum + w.estimatedSavingKg, 0) ?? 0;

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="animate-pulse h-24 rounded-2xl bg-gray-800/50" />
        ))}
      </div>
    );
  }

  if (!roadmap) {
    return (
      <div className="rounded-2xl border border-gray-700/50 bg-slate-900/60 p-8 text-center">
        <span className="text-4xl mb-4 block">🗺️</span>
        <p className="text-gray-300 font-medium mb-1">No roadmap yet</p>
        <p className="text-xs text-gray-500 mb-4">
          {profile
            ? "Generate a personalized 8-week plan based on your Carbon Twin."
            : "Create your Carbon Twin profile first, then generate a roadmap."}
        </p>
        {error && <p className="text-xs text-red-400 mb-3">{error}</p>}
        <button
          onClick={handleGenerate}
          disabled={generating || !profile}
          className="px-6 py-3 rounded-xl bg-gradient-to-r from-emerald-600 to-green-500 text-white text-sm font-bold hover:from-emerald-500 hover:to-green-400 transition-all disabled:opacity-50"
        >
          {generating ? "Claude is building your plan... (15–30 sec)" : "🗺️ Generate My Roadmap / मेरा रोडमैप बनाएं"}
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Progress Header */}
      <div className="rounded-2xl border border-gray-700/50 bg-slate-900/60 p-4 flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-gray-200">
            {completedCount} / {roadmap.totalWeeks} weeks completed
          </p>
          <p className="text-xs text-gray-500">
            {savedSoFar.toFixed(0)} kg saved so far · Total goal: {roadmap.totalProjectedSavingKg.toFixed(0)} kg/month
          </p>
        </div>
        <div className="w-32 h-2 bg-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-emerald-500 rounded-full transition-all"
            style={{ width: `${(completedCount / roadmap.totalWeeks) * 100}%` }}
          />
        </div>
      </div>

      {error && <p className="text-xs text-red-400">{error}</p>}

      {/* Week Cards */}
      {roadmap.weeks.map((week) => (
        <RoadmapCard key={week.weekNumber} week={week} onToggleComplete={handleToggleComplete} />
      ))}

      {/* Regenerate */}
      {(completedCount >= 4 || !profile) && (
        <button
          onClick={handleGenerate}
          disabled={generating}
          className="w-full py-3 rounded-xl border border-gray-700 text-gray-300 text-sm hover:bg-gray-800 transition-colors disabled:opacity-50"
        >
          {generating ? "Regenerating..." : "🔄 Regenerate Roadmap"}
        </button>
      )}
    </div>
  );
}
