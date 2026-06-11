import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { demoBadges } from "@/lib/demo-data";
import { BADGES } from "@/lib/gamification";
import {
  AuthRequiredError,
  createServerSupabaseClient,
  requireCurrentUser
} from "@/lib/supabase/server";

export async function GET(_request: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const supabase = createServerSupabaseClient();

    if (!supabase || user.isDemo) {
      return apiSuccess(demoBadges);
    }

    const { data, error } = await supabase
      .from("user_badges")
      .select("badge_slug")
      .eq("user_id", user.id);

    if (error) {
      return apiError(error.message, 500);
    }

    type BadgeRow = { badge_slug: string };
    const earned = new Set(
      ((data ?? []) as BadgeRow[]).map((badge: BadgeRow) => badge.badge_slug)
    );

    return apiSuccess(
      BADGES.map((badge) => ({
        ...badge,
        earned: earned.has(badge.slug)
      }))
    );
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return apiError("Authentication required", 401);
    }
    return apiError("Unable to load badges", 500);
  }
}
