import { NextResponse, type NextRequest } from "next/server";

/* ═══════════════════════════════════════════════════════════════
   POST /api/carbon-analyze
   Carbon Intelligence Engine — Anthropic Claude API integration
   ═══════════════════════════════════════════════════════════════ */

/* ── Input types ── */

interface DietInput {
  type: string;
  meatFrequency: number;
  dairyDaily: boolean;
  localProducePercent: number;
}

interface TravelInput {
  commuteMode: string;
  weeklyKm: number;
  flightsPerYear: number;
  vehicleType: string;
}

interface ElectricityInput {
  monthlyKwh: number;
  source: string;
  acUsageHoursPerDay: number;
}

interface ShoppingInput {
  monthlySpendINR: number;
  fastFashionPercent: number;
  electronicsPerYear: number;
}

interface WasteInput {
  weeklyWasteKg: number;
  recyclingHabit: string;
  composting: boolean;
  plasticBagsPerWeek: number;
}

interface CarbonAnalyzeBody {
  diet: DietInput;
  travel: TravelInput;
  electricity: ElectricityInput;
  shopping: ShoppingInput;
  waste: WasteInput;
  city: string;
  householdSize: number;
}

/* ── Anthropic response types ── */

interface AnthropicContentBlock {
  type: string;
  text: string;
}

interface AnthropicResponse {
  content: AnthropicContentBlock[];
}

/* ── System prompt ── */

const SYSTEM_PROMPT =
  "You are the Carbon Intelligence Engine for GreenStep India. Analyze the user's lifestyle data and respond ONLY in valid JSON (no markdown, no explanation) with this structure: { carbon_risk_score: { overall: number, risk_tier: Low|Moderate|High|Critical, category_breakdown: { diet, travel, electricity, shopping, waste — each 0-100 }, india_comparison: string }, monthly_forecast: { month_1_kg, month_2_kg, month_3_kg: numbers, trend: Improving|Stable|Worsening, seasonal_note: string }, reduction_roadmap: [ { rank, action_title, estimated_monthly_reduction_kg, effort_level: Easy|Medium|Hard, india_tip: string } ] (5 items), predicted_emissions_timeline: { business_as_usual: number[6], optimized_path: number[6], total_annual_savings_kg: number } }. Use India's average 1.9 tonnes CO2e/year as benchmark. Reference Indian schemes (PM-KUSUM, FAME II, Green Railways) in tips.";

/* ── Helpers ── */

function buildUserMessage(body: CarbonAnalyzeBody): string {
  return `Analyze this Indian user's lifestyle data and generate carbon insights:

City: ${body.city}
Household Size: ${body.householdSize}

DIET:
- Type: ${body.diet.type}
- Meat frequency (meals/week): ${body.diet.meatFrequency}
- Daily dairy: ${body.diet.dairyDaily ? "Yes" : "No"}
- Local produce: ${body.diet.localProducePercent}%

TRAVEL:
- Commute mode: ${body.travel.commuteMode}
- Weekly km: ${body.travel.weeklyKm}
- Flights per year: ${body.travel.flightsPerYear}
- Vehicle type: ${body.travel.vehicleType}

ELECTRICITY:
- Monthly consumption: ${body.electricity.monthlyKwh} kWh
- Energy source: ${body.electricity.source}
- AC usage: ${body.electricity.acUsageHoursPerDay} hours/day

SHOPPING:
- Monthly spend: ₹${body.shopping.monthlySpendINR}
- Fast fashion: ${body.shopping.fastFashionPercent}%
- Electronics per year: ${body.shopping.electronicsPerYear}

WASTE:
- Weekly waste: ${body.waste.weeklyWasteKg} kg
- Recycling habit: ${body.waste.recyclingHabit}
- Composting: ${body.waste.composting ? "Yes" : "No"}
- Plastic bags/week: ${body.waste.plasticBagsPerWeek}

Current month: ${new Date().toLocaleString("en-IN", { month: "long", year: "numeric" })}`;
}

function stripMarkdownFences(text: string): string {
  // Remove ```json ... ``` or ``` ... ``` wrapping
  const stripped = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?\s*```\s*$/i, "");
  return stripped.trim();
}

/* ── Route handler ── */

export async function POST(req: NextRequest) {
  // 1. Parse and validate request body
  let body: CarbonAnalyzeBody;
  try {
    body = (await req.json()) as CarbonAnalyzeBody;
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON in request body" },
      { status: 400 }
    );
  }

  const requiredCategories: (keyof Pick<CarbonAnalyzeBody, "diet" | "travel" | "electricity" | "shopping" | "waste">)[] = [
    "diet", "travel", "electricity", "shopping", "waste",
  ];

  for (const category of requiredCategories) {
    if (!body[category] || typeof body[category] !== "object") {
      return NextResponse.json(
        { error: `Missing required category: "${category}"` },
        { status: 400 }
      );
    }
  }

  // 2. Check for Anthropic API key
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server" },
      { status: 500 }
    );
  }

  // 3. Call Anthropic API with 30s timeout
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 30_000);

  let rawText: string;

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
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: buildUserMessage(body) }],
        temperature: 0.3,
      }),
      signal: controller.signal,
    });

    clearTimeout(timeout);

    if (!response.ok) {
      const errorBody = await response.text();
      console.error(`Anthropic API error [${response.status}]:`, errorBody);
      return NextResponse.json(
        { error: "Anthropic API returned an error", status: response.status, detail: errorBody },
        { status: 503 }
      );
    }

    const data: AnthropicResponse = await response.json();

    // 4. Extract text from response
    const contentBlock = data.content?.[0];
    if (!contentBlock || contentBlock.type !== "text" || !contentBlock.text) {
      return NextResponse.json(
        { error: "Empty or unexpected response from Anthropic API" },
        { status: 503 }
      );
    }

    rawText = contentBlock.text;
  } catch (err: unknown) {
    clearTimeout(timeout);

    // Network / abort errors → 503
    const message = err instanceof Error ? err.message : "Unknown network error";
    const isAbort = err instanceof Error && err.name === "AbortError";

    console.error("Anthropic API network error:", message);
    return NextResponse.json(
      { error: isAbort ? "Request to Anthropic API timed out (30s)" : `Network error: ${message}` },
      { status: 503 }
    );
  }

  // 5. Strip markdown fences and parse JSON
  try {
    const cleaned = stripMarkdownFences(rawText);
    const parsed: unknown = JSON.parse(cleaned);

    // 6. Return parsed result
    return NextResponse.json(parsed, { status: 200 });
  } catch {
    // 7. AI parse error → 422 with raw text
    console.error("Failed to parse AI response as JSON. Raw text:", rawText);
    return NextResponse.json(
      { error: "AI response was not valid JSON", rawText },
      { status: 422 }
    );
  }
}
