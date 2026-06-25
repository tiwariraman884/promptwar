"use client";

import { useState, useEffect, useCallback } from "react";
import { CarbonSimulator } from "@/components/simulator/CarbonSimulator";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { CarbonTwinProfile } from "@/lib/types/carbon-twin-types";

export function SimulatorPageClient(): JSX.Element {
  const [profile, setProfile] = useState<CarbonTwinProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadProfile = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured()) {
      setError("Supabase is not configured. Please set up your Carbon Twin profile first.");
      setLoading(false);
      return;
    }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setError("Please sign in to use the simulator."); setLoading(false); return; }

      const { data } = await supabase
        .from("carbon_twin")
        .select("user_id,diet,travel,energy,shopping,waste,created_at,updated_at")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (data) {
        setProfile({
          userId: data.user_id, createdAt: data.created_at, updatedAt: data.updated_at,
          diet: data.diet, travel: data.travel, energy: data.energy,
          shopping: data.shopping, waste: data.waste,
        });
      } else {
        setError("No Carbon Twin profile found. Please create your profile at /twin first.");
      }
    } catch {
      setError("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  if (loading) {
    return (
      <div className="space-y-3">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="animate-pulse h-20 rounded-xl bg-gray-800/50" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-2xl border border-yellow-700/50 bg-yellow-900/20 p-6 text-center">
        <p className="text-sm text-yellow-400">{error}</p>
        <a href="/twin" className="inline-block mt-3 px-4 py-2 rounded-xl bg-emerald-600 text-white text-sm font-medium hover:bg-emerald-500">
          Create Carbon Twin →
        </a>
      </div>
    );
  }

  return profile ? <CarbonSimulator profile={profile} /> : <></>;
}
