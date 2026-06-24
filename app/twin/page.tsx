"use client";

import { useState, useEffect, useCallback } from "react";
import { CarbonTwinSetup } from "@/components/carbon-twin/CarbonTwinSetup";
import { CarbonTwinProfile } from "@/components/carbon-twin/CarbonTwinProfile";
import { calcFullBreakdown } from "@/lib/carbon-engine-v2";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { CarbonTwinProfile as TwinProfileType, EmissionBreakdown } from "@/lib/types/carbon-twin-types";

type ViewMode = "loading" | "setup" | "profile";

export default function CarbonTwinPage(): JSX.Element {
  const [view, setView] = useState<ViewMode>("loading");
  const [profile, setProfile] = useState<TwinProfileType | null>(null);
  const [breakdown, setBreakdown] = useState<EmissionBreakdown | null>(null);
  const [userId, setUserId] = useState<string>("demo-user");

  const loadProfile = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured()) {
      setView("setup");
      return;
    }
    try {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setView("setup"); return; }
      setUserId(user.id);

      const { data } = await supabase
        .from("carbon_twin")
        .select("user_id,diet,travel,energy,shopping,waste,created_at,updated_at")
        .eq("user_id", user.id)
        .limit(1)
        .single();

      if (data) {
        const p: TwinProfileType = {
          userId: data.user_id,
          createdAt: data.created_at,
          updatedAt: data.updated_at,
          diet: data.diet,
          travel: data.travel,
          energy: data.energy,
          shopping: data.shopping,
          waste: data.waste,
        };
        setProfile(p);
        setBreakdown(calcFullBreakdown(p));
        setView("profile");
      } else {
        setView("setup");
      }
    } catch {
      setView("setup");
    }
  }, []);

  useEffect(() => { loadProfile(); }, [loadProfile]);

  const handleSetupComplete = useCallback((): void => {
    loadProfile();
  }, [loadProfile]);

  if (view === "loading") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse text-emerald-400 text-lg">Loading Carbon Twin...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen pb-24">
      <header className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-900/20 via-transparent to-green-800/10" />
        <div className="relative max-w-3xl mx-auto px-4 pt-8 pb-6">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-3xl">🧬</span>
            <h1 className="font-bold text-2xl md:text-3xl text-white">Carbon Twin</h1>
          </div>
          <p className="text-sm text-gray-400">
            Your complete digital carbon identity — कार्बन ट्विन
          </p>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 mt-6">
        {view === "setup" && (
          <CarbonTwinSetup
            existingProfile={profile}
            userId={userId}
            onComplete={handleSetupComplete}
          />
        )}
        {view === "profile" && breakdown && (
          <>
            <CarbonTwinProfile
              breakdown={breakdown}
              hasForecast={false}
            />
            <div className="mt-6 flex justify-center">
              <button
                onClick={() => setView("setup")}
                className="px-6 py-2.5 rounded-xl border border-gray-700 text-gray-300 text-sm hover:bg-gray-800 transition-colors"
              >
                ✏️ Update My Profile / प्रोफ़ाइल अपडेट करें
              </button>
            </div>
          </>
        )}
      </main>
    </div>
  );
}
