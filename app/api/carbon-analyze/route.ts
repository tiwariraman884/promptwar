import { NextResponse, type NextRequest } from "next/server";
import type { UserInputData, CarbonAnalysisResult } from "@/types/carbon";

/**
 * POST /api/carbon-analyze
 *
 * Accepts structured lifestyle data and calls the Anthropic Claude API
 * to generate a personalised carbon footprint analysis.
 * Falls back to the local deterministic engine when ANTHROPIC_API_KEY is missing.
 */

const SYSTEM_PROMPT = `You are the Carbon Intelligence Engine for GreenStep India — an AI-powered sustainability assistant that analyzes a user's lifestyle data and generates personalized carbon footprint insights for Indian users.

Analyze the provided lifestyle data and respond ONLY in valid JSON with this exact structure:
{
  "carbon_risk_score": {
    "overall": number (0-100),
    "risk_tier": "Low" | "Moderate" | "High" | "Critical",
    "category_breakdown": {
      "diet": number,
      "travel": number,
      "electricity": number,
      "shopping": number,
      "waste": number
    },
    "india_comparison": string (e.g. "You emit 23% more than India's average of 1.9 tonnes CO2e/year")
  },
  "monthly_forecast": {
    "month_1_kg": number,
    "month_2_kg": number,
    "month_3_kg": number,
    "trend": "Improving" | "Stable" | "Worsening",
    "seasonal_note": string (India-specific seasonal factor)
  },
  "reduction_roadmap": [
    {
      "rank": number,
      "action_title": string,
      "estimated_monthly_reduction_kg": number,
      "effort_level": "Easy" | "Medium" | "Hard",
      "india_tip": string (reference Indian govt schemes like PM-KUSUM, FAME II, Green Railways where relevant)
    }
  ],
  "predicted_emissions_timeline": {
    "business_as_usual": [number, number, number, number, number, number],
    "optimized_path": [number, number, number, number, number, number],
    "total_annual_savings_kg": number
  }
}
No markdown, no explanation, only the JSON object.`;

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as UserInputData;

    // Validate essential fields
    if (!body.diet || !body.travel || !body.electricity || !body.shopping || !body.waste) {
      return NextResponse.json(
        { success: false, error: "All 5 lifestyle categories are required" },
        { status: 422 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_ANTHROPIC_API_KEY;

    // If no Anthropic key, fall back to the local deterministic engine
    if (!apiKey) {
      const { analyzeCarbon } = await import("@/lib/carbon-intelligence");
      const mapped = mapToLocalEngine(body);
      const result = analyzeCarbon(mapped);
      return NextResponse.json({ success: true, data: result });
    }

    // Build user message with lifestyle data
    const userMessage = `Analyze this Indian user's lifestyle data and generate carbon insights:

City: ${body.city || "Lucknow"}
Household Size: ${body.household_size || 1}

DIET:
- Food type: ${body.diet.food_type}
- Meat meals per week: ${body.diet.meat_meals_per_week}
- Daily dairy consumption: ${body.diet.dairy_daily ? "Yes" : "No"}
- Local produce percentage: ${body.diet.local_produce_percent}%

TRAVEL:
- Commute mode: ${body.travel.commute_mode}
- Weekly km: ${body.travel.km_per_week}
- Flights per year: ${body.travel.flights_per_year}
${body.travel.vehicle_type ? `- Vehicle type: ${body.travel.vehicle_type}` : ""}

ELECTRICITY:
- Monthly consumption: ${body.electricity.monthly_kwh} kWh
- Energy source: ${body.electricity.energy_source}
- AC hours per day: ${body.electricity.ac_hours_per_day}

SHOPPING:
- Monthly spend: ₹${body.shopping.monthly_spend_inr}
- Fast fashion percentage: ${body.shopping.fast_fashion_percent}%
- Electronics purchased per year: ${body.shopping.electronics_per_year}

WASTE:
- Weekly waste: ${body.waste.weekly_waste_kg} kg
- Recycling habit: ${body.waste.recycling_habit}
- Composting: ${body.waste.composting ? "Yes" : "No"}
- Plastic bags per week: ${body.waste.plastic_bags_per_week}

Current month: ${new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })}`;

    // Call Anthropic API
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 30000);

    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6-20250514",
        max_tokens: 2048,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userMessage }],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Anthropic API error:", response.status, errorText);

      // Fall back to local engine on API error
      const { analyzeCarbon } = await import("@/lib/carbon-intelligence");
      const mapped = mapToLocalEngine(body);
      const result = analyzeCarbon(mapped);
      return NextResponse.json({ success: true, data: result });
    }

    const data = await response.json();
    const text = data?.content?.[0]?.text;

    if (!text) {
      throw new Error("Empty response from Anthropic API");
    }

    // Parse the JSON from the response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error("No JSON found in Anthropic response");
    }

    const analysisResult: CarbonAnalysisResult = JSON.parse(jsonMatch[0]);

    return NextResponse.json({ success: true, data: analysisResult });
  } catch (error) {
    console.error("Carbon analyze API error:", error);

    // Last-resort fallback to local engine
    try {
      const body = await req.clone().json();
      const { analyzeCarbon } = await import("@/lib/carbon-intelligence");
      const mapped = mapToLocalEngine(body);
      const result = analyzeCarbon(mapped);
      return NextResponse.json({ success: true, data: result });
    } catch {
      return NextResponse.json(
        { success: false, error: "Failed to analyze carbon data" },
        { status: 500 }
      );
    }
  }
}

/* ── Map UI input types to the local engine's input types ── */

function mapToLocalEngine(input: UserInputData) {
  const foodTypeMap: Record<string, "vegan" | "vegetarian" | "non_veg_chicken" | "non_veg_mixed" | "non_veg_beef"> = {
    vegan: "vegan",
    vegetarian: "vegetarian",
    non_vegetarian: input.diet.meat_meals_per_week > 7 ? "non_veg_beef" : input.diet.meat_meals_per_week > 3 ? "non_veg_mixed" : "non_veg_chicken",
  };

  const frequencyMap = (meals: number): "one" | "two" | "three" => {
    if (meals <= 4) return "one";
    if (meals <= 9) return "two";
    return "three";
  };

  const dairyMap = (daily: boolean, meals: number): "none" | "low" | "moderate" | "high" => {
    if (!daily && meals === 0) return "none";
    if (!daily) return "low";
    if (meals <= 7) return "moderate";
    return "high";
  };

  const localMap = (pct: number): "mostly_local" | "mixed" | "mostly_imported" => {
    if (pct >= 70) return "mostly_local";
    if (pct >= 30) return "mixed";
    return "mostly_imported";
  };

  const energyMap: Record<string, "grid_only" | "partial_solar" | "full_solar"> = {
    grid: "grid_only",
    solar: "full_solar",
    mixed: "partial_solar",
  };

  const fashionMap = (pct: number): "sustainable" | "mixed" | "fast_fashion" => {
    if (pct >= 60) return "fast_fashion";
    if (pct >= 30) return "mixed";
    return "sustainable";
  };

  const electronicsMap = (count: number): "rarely" | "occasionally" | "frequently" => {
    if (count <= 1) return "rarely";
    if (count <= 3) return "occasionally";
    return "frequently";
  };

  const recyclingMap: Record<string, number> = {
    never: 5,
    sometimes: 35,
    always: 75,
  };

  return {
    diet: {
      food_type: foodTypeMap[input.diet.food_type] ?? "vegetarian",
      frequency: frequencyMap(input.diet.meat_meals_per_week),
      meat_dairy_level: dairyMap(input.diet.dairy_daily, input.diet.meat_meals_per_week),
      local_vs_imported: localMap(input.diet.local_produce_percent),
    },
    travel: {
      commute_mode: input.travel.commute_mode,
      km_per_week: input.travel.km_per_week,
      flights_per_year: input.travel.flights_per_year,
      vehicle_type: input.travel.vehicle_type,
    },
    electricity: {
      monthly_kwh: input.electricity.monthly_kwh,
      energy_source: energyMap[input.electricity.energy_source] ?? "grid_only",
      appliance_usage: input.electricity.ac_hours_per_day > 6 ? "heavy" as const : input.electricity.ac_hours_per_day > 2 ? "moderate" as const : "minimal" as const,
    },
    shopping: {
      monthly_purchases: Math.round(input.shopping.monthly_spend_inr / 1500),
      fashion_type: fashionMap(input.shopping.fast_fashion_percent),
      electronics_frequency: electronicsMap(input.shopping.electronics_per_year),
    },
    waste: {
      weekly_waste_kg: input.waste.weekly_waste_kg,
      recycling_percent: recyclingMap[input.waste.recycling_habit] ?? 20,
      composting: input.waste.composting,
      plastic_usage: input.waste.plastic_bags_per_week > 10 ? "heavy" as const : input.waste.plastic_bags_per_week > 3 ? "moderate" as const : "minimal" as const,
    },
  };
}
