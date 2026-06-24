"use client";

import { useState, useEffect, useCallback } from "react";
import { ForecastCard } from "./ForecastCard";
import { calcForecast } from "@/lib/forecast-engine";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";
import type { CarbonForecast as ForecastType } from "@/lib/types/carbon-twin-types";

interface CarbonForecastWidgetProps {
  userId?: string;
}

export function CarbonForecastWidget({ userId }: CarbonForecastWidgetProps): JSX.Element {
  const [forecast, setForecast] = useState<ForecastType | null>(null);
  const [loading, setLoading] = useState(true);

  const loadForecast = useCallback(async (): Promise<void> => {
    if (!isSupabaseConfigured()) { setLoading(false); return; }
    try {
      const supabase = createClient();
      let uid = userId;
      if (!uid) {
        const { data: { user } } = await supabase.auth.getUser();
        uid = user?.id;
      }
      if (!uid) { setLoading(false); return; }

      const { data } = await supabase
        .from("emission_snapshots")
        .select("year_month,total_kg")
        .eq("user_id", uid)
        .order("year_month", { ascending: false })
        .limit(12);

      if (data && data.length > 0) {
        const snapshots = data.map((d) => ({
          year_month: d.year_month,
          total_kg: parseFloat(String(d.total_kg)),
        }));
        setForecast(calcForecast(snapshots));
      }
    } catch {
      // silently fail — forecast is optional
    } finally {
      setLoading(false);
    }
  }, [userId]);

  useEffect(() => { loadForecast(); }, [loadForecast]);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-x-auto pb-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="animate-pulse h-32 w-48 rounded-2xl bg-gray-800/50 flex-shrink-0" />
        ))}
      </div>
    );
  }

  if (!forecast || forecast.modelUsed === "insufficient_data") {
    return (
      <div className="rounded-xl border border-gray-700/50 bg-gray-800/30 p-4">
        <div className="flex items-center gap-2">
          <span className="text-lg">📊</span>
          <div>
            <p className="text-sm text-gray-300">Forecast unavailable</p>
            <p className="text-xs text-gray-500">
              {forecast?.warning ?? "Need at least 3 months of data to forecast."}
            </p>
          </div>
        </div>
        <p className="text-xs text-gray-600 mt-2">
          Based on {forecast?.dataPointsUsed ?? 0} month(s) of data.
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="flex gap-3 overflow-x-auto pb-2 -mx-1 px-1">
        {forecast.forecasts.map((fp) => (
          <ForecastCard key={fp.period} forecast={fp} />
        ))}
      </div>
      <p className="text-xs text-gray-600 mt-2">
        Based on {forecast.dataPointsUsed} months of data · Model: {forecast.modelUsed.replace("_", " ")}
      </p>
    </div>
  );
}
