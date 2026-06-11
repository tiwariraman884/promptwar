import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { demoLeaderboard } from "@/lib/demo-data";
import { INDIA_DAILY_AVERAGE_KG } from "@/lib/emission-factors";
import {
  AuthRequiredError,
  createAdminSupabaseClient,
  createServerSupabaseClient,
  requireCurrentUser
} from "@/lib/supabase/server";

function monthStartIso() {
  const date = new Date();
  date.setDate(1);
  date.setHours(12, 0, 0, 0);
  return date.toISOString().slice(0, 10);
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const scope = new URL(request.url).searchParams.get("scope") ?? "city";
    const admin = createAdminSupabaseClient();

    if (user.isDemo || !admin) {
      return apiSuccess(scope === "state" ? demoLeaderboard.state : demoLeaderboard.city);
    }

    const supabase = createServerSupabaseClient();
    type ProfileRow = {
      id: string;
      display_name: string | null;
      city: string;
      state: string;
    };

    const { data: currentProfile } = await supabase!
      .from("profiles")
      .select("city, state")
      .eq("id", user.id)
      .maybeSingle();
    const profileCity = currentProfile?.city ?? "Haridwar";
    const profileState = currentProfile?.state ?? "Uttarakhand";

    const { data: profiles } = await admin
      .from("profiles")
      .select("id, display_name, city, state")
      .eq(scope === "state" ? "state" : "city", scope === "state" ? profileState : profileCity);

    const profileRows = ((profiles ?? []) as Array<{
      id: string;
      display_name: string | null;
      city: string | null;
      state: string | null;
    }>).map((profile) => ({
      id: profile.id,
      display_name: profile.display_name,
      city: profile.city ?? "Haridwar",
      state: profile.state ?? "Uttarakhand"
    }));
    const ids = profileRows.map((profile: ProfileRow) => profile.id);

    if (ids.length === 0) {
      return apiSuccess([]);
    }

    const { data: entries, error } = await admin
      .from("emission_entries")
      .select("user_id, entry_date, kg_co2e")
      .in("user_id", ids)
      .gte("entry_date", monthStartIso());

    if (error) {
      return apiError(error.message, 500);
    }

    if (scope === "state") {
      const cities = new Map<string, { city: string; state: string; kg: number; days: Set<string> }>();
      profileRows.forEach((profile: ProfileRow) => {
        cities.set(profile.city, {
          city: profile.city,
          state: profile.state,
          kg: 0,
          days: new Set()
        });
      });

      type EntryRow = { user_id: string; entry_date: string; kg_co2e: number | string };
      const entryRows = (entries ?? []) as EntryRow[];
      entryRows.forEach((entry: EntryRow) => {
        const profile = profileRows.find((item: ProfileRow) => item.id === entry.user_id);
        if (!profile) return;
        const city = cities.get(profile.city);
        if (!city) return;
        city.kg += Number(entry.kg_co2e ?? 0);
        city.days.add(entry.entry_date as string);
      });

      return apiSuccess(
        Array.from(cities.values())
          .map((city) => {
            const days = Math.max(1, city.days.size);
            const reductionPercent = Math.max(
              0,
              100 - (city.kg / days / INDIA_DAILY_AVERAGE_KG) * 100
            );
            return {
              city: city.city,
              state: city.state,
              reductionPercent: Number(reductionPercent.toFixed(0))
            };
          })
          .sort((a, b) => b.reductionPercent - a.reductionPercent)
          .slice(0, 10)
          .map((city, index) => ({ rank: index + 1, ...city }))
      );
    }

    const users = new Map<string, { id: string; kg: number; days: Set<string> }>();
    ids.forEach((id) => users.set(id, { id, kg: 0, days: new Set() }));
    (entries ?? []).forEach((entry) => {
      const item = users.get(entry.user_id);
      if (!item) return;
      item.kg += Number(entry.kg_co2e ?? 0);
      item.days.add(entry.entry_date as string);
    });

    return apiSuccess(
      Array.from(users.values())
        .map((item) => {
          const days = Math.max(1, item.days.size);
          const reductionPercent = Math.max(
            0,
            100 - (item.kg / days / INDIA_DAILY_AVERAGE_KG) * 100
          );
          return {
            displayName: "Anonymous GreenStepper",
            city: profileCity,
            reductionPercent: Number(reductionPercent.toFixed(0))
          };
        })
        .sort((a, b) => b.reductionPercent - a.reductionPercent)
        .slice(0, 10)
        .map((item, index) => ({
          rank: index + 1,
          ...item,
          displayName: `GreenStep ${String(index + 1).padStart(2, "0")}`
        }))
    );
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return apiError("Authentication required", 401);
    }
    return apiError("Unable to load leaderboard", 500);
  }
}
