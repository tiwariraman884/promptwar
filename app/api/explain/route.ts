import { NextRequest, NextResponse } from "next/server";
import type { RoadmapWeek, EmissionBreakdown } from "@/lib/types/carbon-twin-types";
import { INDIA_MONTHLY_BASELINE } from "@/lib/emission-factors-v2";

interface RequestBody {
  weekAction: RoadmapWeek;
  breakdown: EmissionBreakdown;
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

  const { weekAction, breakdown } = body;
  if (!weekAction || !breakdown) {
    return NextResponse.json({ error: "Missing weekAction or breakdown" }, { status: 400 });
  }

  const categoryKg = breakdown.byCategory.find(c => c.category === weekAction.category)?.monthlyCO2Kg ?? 0;
  const baseline = Math.round(INDIA_MONTHLY_BASELINE * 0.2); // rough category baseline

  const prompt = `You are explaining a carbon reduction recommendation to an Indian user.
Keep it simple, specific, and motivating. Max 3 sentences.

The recommendation was: "${weekAction.action}"
User's ${weekAction.category} footprint: ${categoryKg} kg/month
India average for this category: ~${baseline} kg/month

Explain in this JSON format ONLY, no markdown:
{
  "headline": "<one short line explaining the recommendation>",
  "headlineHindi": "<same in Hindi>",
  "summary": "<2-3 sentences: why this action, what happens, India context>",
  "factors": [
    { "name": "<factor 1>", "nameHindi": "<Hindi>", "contribution": <kg>, "percentOfTotal": <number>, "direction": "<positive|negative>", "detail": "<one line>" }
  ],
  "recommendation": "<the single most important next step>",
  "recommendationHindi": "<same in Hindi>",
  "sourceLabel": "Claude AI · CEA India data"
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

    return NextResponse.json({ success: true, data: parsed });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: `Explanation failed: ${message}` }, { status: 500 });
  }
}
