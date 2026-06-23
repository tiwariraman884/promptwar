import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { checkRateLimit, standardLimiter } from "@/lib/rate-limit";
import { carbonIntelligenceSchema, formatZodError } from "@/lib/validations";
import { analyzeCarbon } from "@/lib/carbon-intelligence";
import {
  AuthRequiredError,
  requireCurrentUser,
} from "@/lib/supabase/server";

/**
 * POST /api/carbon-intelligence
 *
 * Accepts structured lifestyle data across 5 categories and returns
 * a comprehensive carbon footprint analysis:
 *   - Personal Carbon Risk Score (0–100)
 *   - Monthly Carbon Forecast (next 3 months)
 *   - Reduction Roadmap (5 prioritised India-specific actions)
 *   - Predicted Emissions Timeline (6-month BAU vs optimised)
 *
 * All computation is deterministic (pure TypeScript) — no external AI calls.
 */
export async function POST(req: NextRequest) {
  try {
    // Auth check — blocks anonymous requests
    const user = await requireCurrentUser();

    // Rate limit — standard limiter (no external API calls, so no AI tier needed)
    const rateLimited = await checkRateLimit(req, standardLimiter, user.id);
    if (rateLimited) return rateLimited;

    // Validate request body
    const body = await req.json();
    const parsed = carbonIntelligenceSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(`Invalid request: ${formatZodError(parsed.error)}`, 422);
    }

    // Run the Carbon Intelligence Engine
    const result = analyzeCarbon(parsed.data);

    return apiSuccess(result);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return apiError("Authentication required", 401);
    }
    console.error("Carbon Intelligence API error:", error);
    return apiError("Failed to analyze carbon data", 500);
  }
}
