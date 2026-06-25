import type { NextRequest } from "next/server";
export const dynamic = "force-dynamic"; // reads request.headers
import { apiError, apiSuccess } from "@/lib/api";
import { ECO_COIN_REWARDS } from "@/lib/gamification";
import { awardCoins } from "@/lib/gamification-server";
import {
  AuthRequiredError,
  createServerSupabaseClient,
  requireCurrentUser
} from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const body = (await request.json()) as { tipId?: string };

    if (!body.tipId) {
      return apiError("tipId is required", 422);
    }

    const supabase = createServerSupabaseClient();

    if (!supabase || user.isDemo) {
      return apiSuccess({
        tipId: body.tipId,
        coinsEarned: ECO_COIN_REWARDS.tipCompleted,
        totalCoins: null
      });
    }

    const { data: existing } = await supabase
      .from("completed_tips")
      .select("tip_id")
      .eq("user_id", user.id)
      .eq("tip_id", body.tipId)
      .maybeSingle();

    if (existing) {
      return apiSuccess({
        tipId: body.tipId,
        coinsEarned: 0,
        totalCoins: null
      });
    }

    const { error } = await supabase.from("completed_tips").insert({
      user_id: user.id,
      tip_id: body.tipId
    });

    if (error) {
      return apiError(error.message, 500);
    }

    const totalCoins = await awardCoins(
      supabase,
      user.id,
      ECO_COIN_REWARDS.tipCompleted
    );

    return apiSuccess({
      tipId: body.tipId,
      coinsEarned: ECO_COIN_REWARDS.tipCompleted,
      totalCoins
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return apiError("Authentication required", 401);
    }
    return apiError("Unable to complete tip", 500);
  }
}
