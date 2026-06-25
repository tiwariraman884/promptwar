import type { NextRequest } from "next/server";
export const dynamic = "force-dynamic"; // reads request.headers
import { apiError, apiSuccess } from "@/lib/api";
import { demoChallenge } from "@/lib/demo-data";
import {
  AuthRequiredError,
  createServerSupabaseClient,
  requireCurrentUser
} from "@/lib/supabase/server";

export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser();
    const body = (await request.json()) as { challengeId?: string };

    if (!body.challengeId) {
      return apiError("challengeId is required", 422);
    }

    const supabase = createServerSupabaseClient();

    if (!supabase || user.isDemo) {
      return apiSuccess({
        challenge: demoChallenge,
        joined: true
      });
    }

    const { data, error } = await supabase
      .from("user_challenges")
      .upsert({
        user_id: user.id,
        challenge_id: body.challengeId
      })
      .select()
      .single();

    if (error) {
      return apiError(error.message, 500);
    }

    return apiSuccess({
      challenge: data,
      joined: true
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return apiError("Authentication required", 401);
    }
    return apiError("Unable to join challenge", 500);
  }
}
