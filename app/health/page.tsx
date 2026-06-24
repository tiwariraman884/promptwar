"use client";

import { useState, useEffect, useCallback } from "react";
import { CarbonHealthScoreWidget } from "@/components/health-score/CarbonHealthScore";
import { calcFullBreakdown } from "@/lib/carbon-engine-v2";
import { calcHealthScore } from "@/lib/health-score";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { CarbonTwinProfile, CarbonHealthScore, EmissionBreakdown } from "@/lib/types/carbon-twin-types";

export default function HealthPage(): JSX.Element {
  const [healthScore, setHealthScore] = useState<CarbonHealthScore | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadData = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured()) {
      setError("Supabase not configured.");
      setLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Please sign in."); setLoading(false); return; }

      const { data } = await supabase
        .from("carbon_twin")
        .select("user_id,diet,travel,energy,shopping,waste,created_at,updated_at")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (!data) {
        setError("No Carbon Twin profile. Create one at /twin first.");
        setLoading(false);
        return;
      }

      const profile: CarbonTwinProfile = {
        userId: data.user_id, createdAt: data.created_at, updatedAt: data.updated_at,
        diet: data.diet, travel: data.travel, energy: data.energy,
        shopping: data.shopping, waste: data.waste,
      };

      const breakdown: EmissionBreakdown = calcFullBreakdown(profile);
      const score = calcHealthScore(breakdown);
      setHealthScore(score);
    } catch {
      setError("Failed to load data.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  return (
    <div className="min-h-screen pb-24">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 via-transparent to-emerald-800/10" />
        <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">💚</span>
            <h1 className="font-bold text-2xl md:text-3xl text-white">Carbon Health Score</h1>
          </div>
          <p className="text-sm text-gray-400">
            Your 0–100 sustainability score, like CIBIL for carbon / कार्बन हेल्थ स्कोर
          </p>
        </div>
      </header>

      <main className="max-w-lg mx-auto px-4 mt-6">
        {loading && (
          <div className="animate-pulse space-y-4">
            <div className="h-48 rounded-2xl bg-gray-800/50" />
            <div className="space-y-2">
              {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="h-8 rounded-lg bg-gray-800/50" />
              ))}
            </div>
          </div>
        )}
        {error && (
          <div className="rounded-2xl border border-yellow-700/50 bg-yellow-900/20 p-6 text-center">
            <p className="text-sm text-yellow-400">{error}</p>
            <a href="/twin" className="inline-block mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500">
              Create Carbon Twin →
            </a>
          </div>
        )}
        {healthScore && <CarbonHealthScoreWidget score={healthScore} />}
      </main>
    </div>
  );
}
