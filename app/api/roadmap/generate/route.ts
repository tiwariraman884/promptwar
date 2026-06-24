import { NextRequest, NextResponse } from "next/server";
import type { EmissionBreakdown, CarbonTwinProfile, AIRoadmap } from "@/lib/types/carbon-twin-types";
import { INDIA_MONTHLY_BASELINE } from "@/lib/emission-factors-v2";

interface RequestBody {
  userId: string;
  breakdown: EmissionBreakdown;
  twinProfile: CarbonTwinProfile;
}

export async function POST(request: NextRequest): Promise<NextResponse> {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json({ error: "ANTHROPIC_API_KEY not configured" }, { status: 500 });
  }

  let body: RequestBody;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const { userId, breakdown, twinProfile } = body;
  if (!userId || !breakdown || !twinProfile) {
    return NextResponse.json({ error: "Missing userId, breakdown, or twinProfile" }, { status: 400 });
  }

  const getCatKg = (cat: string): number =>
    breakdown.byCategory.find((c) => c.category === cat)?.monthlyCO2Kg ?? 0;
  const getCatPct = (cat: string): number =>
    breakdown.byCategory.find((c) => c.category === cat)?.percentOfTotal ?? 0;

  const aboveBelow = breakdown.totalMonthlyCO2Kg > INDIA_MONTHLY_BASELINE ? "above" : "below";

  const prompt = `You are a carbon reduction coach for Indian users. The user lives in India.
Generate a practical 8-week reduction roadmap personalized to their profile.

USER'S CURRENT MONTHLY FOOTPRINT:
Total: ${breakdown.totalMonthlyCO2Kg} kg CO₂/month
- Diet: ${getCatKg("diet")} kg (${getCatPct("diet")}%)
- Travel: ${getCatKg("travel")} kg (${getCatPct("travel")}%)
- Energy: ${getCatKg("energy")} kg (${getCatPct("energy")}%)
- Shopping: ${getCatKg("shopping")} kg (${getCatPct("shopping")}%)
- Waste: ${getCatKg("waste")} kg (${getCatPct("waste")}%)

USER CONTEXT:
- Primary vehicle: ${twinProfile.travel.primaryVehicle}
- Daily commute: ${twinProfile.travel.dailyCommuteKm} km
- Cooking fuel: ${twinProfile.energy.cookingFuel}
- AC units: ${twinProfile.energy.acUnits}, used ${twinProfile.energy.acHoursPerDay} hrs/day
- Vegetarian: ${twinProfile.diet.vegetarian}
- Has solar: ${twinProfile.energy.hasSolar}
- India average: ${INDIA_MONTHLY_BASELINE} kg/month. User is ${aboveBelow} average.

RULES FOR YOUR ROADMAP:
- 8 weeks total, one action per week.
- Start with the highest-emission category.
- Week 1–2: Easy changes, no cost, immediate impact.
- Week 3–5: Medium difficulty, small investment possible.
- Week 6–8: Structural changes (e.g., buy EV, install solar, change diet permanently).
- Every action must be possible in India (no advice specific to Western countries).
- Every action must include a specific kg CO₂ saving estimate per month.
- Use India-specific alternatives: metro/local train, CNG, induction cooking, LED, composting municipal programs, etc.

Respond ONLY in this exact JSON format, no preamble, no markdown:
{
  "totalWeeks": 8,
  "totalProjectedSavingKg": <number>,
  "weeks": [
    {
      "weekNumber": 1,
      "action": "<English action description>",
      "actionHindi": "<Same action in Hindi>",
      "category": "<diet|travel|energy|shopping|waste>",
      "estimatedSavingKg": <number per month>,
      "difficulty": "<easy|medium|hard>"
    }
  ]
}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1500,
        messages: [{ role: "user", content: prompt }],
      }),
    });

    if (!response.ok) {
      const errText = await response.text();
      return NextResponse.json({ error: `Anthropic API error: ${errText}` }, { status: 502 });
    }

    const data = await response.json();
    const textBlock = data.content?.[0]?.text ?? "";
    const cleanJson = textBlock.replace(/^[\s`]*json|[\s`]*$/gi, "").trim();
    const parsed = JSON.parse(cleanJson);

    const roadmap: AIRoadmap = {
      userId,
      generatedAt: new Date().toISOString(),
      totalWeeks: parsed.totalWeeks ?? 8,
      totalProjectedSavingKg: parsed.totalProjectedSavingKg ?? 0,
      weeks: (parsed.weeks ?? []).map((w: Record<string, unknown>) => ({
        ...w,
        isCompleted: false,
      })),
    };

    return NextResponse.json({ success: true, data: roadmap });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Roadmap generation failed: ${message}` }, { status: 500 });
  }
}
