import type { SupabaseClient } from "@supabase/supabase-js";
import { INDIA_DAILY_AVERAGE_KG } from "@/lib/emission-factors";
import {
  ECO_COIN_REWARDS,
  evaluateBadgeAwards,
  type BadgeSlug
} from "@/lib/gamification";

const sustainableTransport = [
  "two_wheeler_ev",
  "bus_diesel",
  "metro_rail",
  "train_ir"
];

function previousDate(date: string) {
  const current = new Date(`${date}T12:00:00`);
  current.setDate(current.getDate() - 1);
  return current.toISOString().slice(0, 10);
}

export async function awardCoins(
  supabase: SupabaseClient,
  userId: string,
  amount: number
) {
  const { data } = await supabase
    .from("eco_coins")
    .select("total_coins")
    .eq("user_id", userId)
    .maybeSingle();

  const total = (data?.total_coins ?? 0) + amount;

  await supabase.from("eco_coins").upsert({
    user_id: userId,
    total_coins: total
  });

  return total;
}

export async function updateStreak(
  supabase: SupabaseClient,
  userId: string,
  entryDate: string
) {
  const { data } = await supabase
    .from("user_streaks")
    .select("current_streak, longest_streak, last_entry_date")
    .eq("user_id", userId)
    .maybeSingle();

  const lastEntryDate = data?.last_entry_date as string | null | undefined;
  const currentStreak = data?.current_streak ?? 0;
  let nextStreak = 1;

  if (lastEntryDate === entryDate) {
    nextStreak = currentStreak || 1;
  } else if (lastEntryDate === previousDate(entryDate)) {
    nextStreak = currentStreak + 1;
  }

  const longestStreak = Math.max(data?.longest_streak ?? 0, nextStreak);

  await supabase.from("user_streaks").upsert({
    user_id: userId,
    current_streak: nextStreak,
    longest_streak: longestStreak,
    last_entry_date: entryDate
  });

  return {
    currentStreak: nextStreak,
    longestStreak
  };
}

export async function checkAndAwardBadges(
  supabase: SupabaseClient,
  userId: string,
  currentStreak: number
) {
  type EntryRow = { entry_date: string; kg_co2e: number | string };
  type BadgeRow = { badge_slug: string };

  const [{ count: totalEntries }, { count: sustainableCount }, existing, entries] =
    await Promise.all([
      supabase
        .from("emission_entries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId),
      supabase
        .from("emission_entries")
        .select("id", { count: "exact", head: true })
        .eq("user_id", userId)
        .eq("category", "transport")
        .in("sub_type", sustainableTransport),
      supabase
        .from("user_badges")
        .select("badge_slug")
        .eq("user_id", userId),
      supabase
        .from("emission_entries")
        .select("entry_date, kg_co2e")
        .eq("user_id", userId)
    ]);

  const entryRows = (entries.data ?? []) as EntryRow[];
  const existingRows = (existing.data ?? []) as BadgeRow[];

  const days = new Set(entryRows.map((entry: EntryRow) => entry.entry_date)).size;
  const totalKg = entryRows.reduce(
    (sum: number, entry: EntryRow) => sum + Number(entry.kg_co2e ?? 0),
    0
  );
  const totalSavedKg = Math.max(0, days * INDIA_DAILY_AVERAGE_KG - totalKg);
  const existingBadges = existingRows.map((badge: BadgeRow) => badge.badge_slug);

  const awards = evaluateBadgeAwards({
    totalEntries: totalEntries ?? 0,
    currentStreak,
    totalSavedKg,
    sustainableTransportCount: sustainableCount ?? 0,
    existingBadges
  });

  if (awards.length > 0) {
    await supabase.from("user_badges").insert(
      awards.map((badgeSlug: BadgeSlug) => ({
        user_id: userId,
        badge_slug: badgeSlug
      }))
    );
    await awardCoins(
      supabase,
      userId,
      awards.length * ECO_COIN_REWARDS.badgeUnlocked
    );
  }

  return awards;
}

export async function updateGamificationAfterEntry(
  supabase: SupabaseClient,
  userId: string,
  entryDate: string
) {
  const streak = await updateStreak(supabase, userId, entryDate);
  const totalCoins = await awardCoins(
    supabase,
    userId,
    ECO_COIN_REWARDS.dailyEntry
  );
  const badges = await checkAndAwardBadges(
    supabase,
    userId,
    streak.currentStreak
  );

  return {
    streak,
    totalCoins,
    badges,
    coinsEarned:
      ECO_COIN_REWARDS.dailyEntry +
      badges.length * ECO_COIN_REWARDS.badgeUnlocked
  };
}
