import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { demoChallenge } from "@/lib/demo-data";
import {
  AuthRequiredError,
  createServerSupabaseClient,
  requireCurrentUser
} from "@/lib/supabase/server";

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

export async function GET(_request: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const supabase = createServerSupabaseClient();

    if (!supabase || user.isDemo) {
      return apiSuccess([demoChallenge]);
    }

    const { data, error } = await supabase
      .from("challenges")
      .select("*, user_challenges(progress_kg, completed)")
      .lte("starts_at", todayIso())
      .gte("ends_at", todayIso())
      .order("starts_at", { ascending: false });

    if (error) {
      return apiError(error.message, 500);
    }

    type ChallengeRow = {
      id: string;
      title: string | null;
      description: string | null;
      target_kg: number | null;
      duration_days: number | null;
      ends_at: string;
      user_challenges?: Array<{
        progress_kg: number | null;
        completed: boolean | null;
      }>;
    };

    const challengeRows = (data ?? []) as ChallengeRow[];

    return apiSuccess(
      challengeRows.map((challenge: ChallengeRow) => {
        const endsAt = new Date(`${challenge.ends_at}T12:00:00`);
        const now = new Date();
        const daysRemaining = Math.max(
          0,
          Math.ceil((endsAt.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        );
        const progress = Array.isArray(challenge.user_challenges)
          ? challenge.user_challenges[0]
          : null;

        return {
          id: challenge.id,
          title: challenge.title,
          description: challenge.description,
          targetKg: Number(challenge.target_kg ?? 0),
          progressKg: Number(progress?.progress_kg ?? 0),
          durationDays: challenge.duration_days,
          participants: 0,
          daysRemaining,
          completed: Boolean(progress?.completed),
          rewardCoins: 50
        };
      })
    );
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return apiError("Authentication required", 401);
    }
    return apiError("Unable to load challenges", 500);
  }
}
