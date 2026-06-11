import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { demoDashboard } from "@/lib/demo-data";
import {
  CATEGORY_ORDER,
  INDIA_DAILY_AVERAGE_KG,
  type EmissionCategory
} from "@/lib/emission-factors";
import {
  AuthRequiredError,
  createServerSupabaseClient,
  requireCurrentUser
} from "@/lib/supabase/server";

function isoDateOffset(daysAgo: number) {
  const date = new Date();
  date.setHours(12, 0, 0, 0);
  date.setDate(date.getDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

export async function GET(_request: NextRequest) {
  try {
    const user = await requireCurrentUser();

    if (user.isDemo) {
      return apiSuccess(demoDashboard);
    }

    const supabase = createServerSupabaseClient();
    const from = isoDateOffset(29);
    const today = isoDateOffset(0);
    const yesterday = isoDateOffset(1);
    const weekStart = isoDateOffset(6);

    const [profileResult, entriesResult, streakResult, coinsResult] =
      await Promise.all([
        supabase!.from("profiles").select("*").eq("id", user.id).maybeSingle(),
        supabase!
          .from("emission_entries")
          .select("*")
          .eq("user_id", user.id)
          .gte("entry_date", from)
          .order("entry_date", { ascending: true }),
        supabase!
          .from("user_streaks")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle(),
        supabase!
          .from("eco_coins")
          .select("*")
          .eq("user_id", user.id)
          .maybeSingle()
      ]);

    if (entriesResult.error) {
      return apiError(entriesResult.error.message, 500);
    }

    type EntryRow = {
      entry_date: string;
      category: EmissionCategory;
      kg_co2e: number | string;
    };

    const entries = (entriesResult.data ?? []) as EntryRow[];
    const byDate = new Map<string, number>();
    const byCategory = new Map<EmissionCategory, number>();

    entries.forEach((entry: EntryRow) => {
      const date = entry.entry_date as string;
      const category = entry.category as EmissionCategory;
      const kg = Number(entry.kg_co2e ?? 0);
      byDate.set(date, (byDate.get(date) ?? 0) + kg);
      byCategory.set(category, (byCategory.get(category) ?? 0) + kg);
    });

    const dailySeries = Array.from({ length: 30 }, (_, index) => {
      const date = isoDateOffset(29 - index);
      return {
        date,
        kgCo2e: Number((byDate.get(date) ?? 0).toFixed(2)),
        average: INDIA_DAILY_AVERAGE_KG
      };
    });

    const topCategory =
      CATEGORY_ORDER.map((category) => ({
        category,
        kg: byCategory.get(category) ?? 0
      })).sort((a, b) => b.kg - a.kg)[0]?.category ?? "transport";

    const weeklyTotalKg = entries
      .filter((entry) => entry.entry_date >= weekStart)
      .reduce((sum, entry) => sum + Number(entry.kg_co2e ?? 0), 0);

    const totalLoggedKg = entries.reduce(
      (sum: number, entry: EntryRow) => sum + Number(entry.kg_co2e ?? 0),
      0
    );
    const activeDays = new Set(entries.map((entry: EntryRow) => entry.entry_date)).size;

    return apiSuccess({
      profile: {
        id: user.id,
        display_name:
          profileResult.data?.display_name ??
          user.email?.split("@")[0] ??
          "GreenStep user",
        city: profileResult.data?.city ?? "Haridwar",
        state: profileResult.data?.state ?? "Uttarakhand",
        diet_type: profileResult.data?.diet_type ?? "vegetarian"
      },
      todayKg: Number((byDate.get(today) ?? 0).toFixed(2)),
      yesterdayKg: Number((byDate.get(yesterday) ?? 0).toFixed(2)),
      weeklyTotalKg: Number(weeklyTotalKg.toFixed(2)),
      indiaDailyAverageKg: INDIA_DAILY_AVERAGE_KG,
      streak: streakResult.data?.current_streak ?? 0,
      longestStreak: streakResult.data?.longest_streak ?? 0,
      coins: coinsResult.data?.total_coins ?? 0,
      topCategory,
      dailySeries,
      totalLoggedKg: Number(totalLoggedKg.toFixed(2)),
      totalSavedKg: Number(
        Math.max(0, activeDays * INDIA_DAILY_AVERAGE_KG - totalLoggedKg).toFixed(2)
      )
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return apiError("Authentication required", 401);
    }
    return apiError("Unable to load dashboard", 500);
  }
}
