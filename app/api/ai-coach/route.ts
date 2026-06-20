import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { checkRateLimit, aiLimiter } from "@/lib/rate-limit";
import { aiCoachSchema, formatZodError } from "@/lib/validations";
import {
  AuthRequiredError,
  requireCurrentUser,
} from "@/lib/supabase/server";

/**
 * POST /api/ai-coach
 * Secure server-side proxy for Google Gemini API.
 * Keeps the API key on the server (not exposed to the browser).
 */

const SYSTEM_INSTRUCTION = `You are EcoCoach — a world-class AI sustainability advisor built into "GreenStep India", a carbon footprint tracking platform.

PERSONALITY:
- Warm, knowledgeable, encouraging — never preachy or judgmental
- Use occasional emojis naturally (🌿, 🌍, ♻️, 💡, 🚲) but don't overdo it
- Speak like a brilliant friend who happens to be an environmental scientist

YOUR KNOWLEDGE DOMAIN:
- Carbon footprint calculation and reduction strategies
- India-specific sustainability: grid electricity factor ~0.82 kg CO₂/kWh, average Indian footprint ~1.9 tonnes/yr
- Transport emissions: petrol car ~192g CO₂/km, diesel ~171g, metro ~41g, bus ~89g, domestic flight ~255g/km
- Diet: beef ~27 kg CO₂/kg, chicken ~6.9 kg, vegetarian meal ~1.7 kg CO₂/day, vegan ~1.5 kg
- Energy: LPG cylinder ~41 kg CO₂, LED saves 75% vs incandescent
- Shopping: smartphone ~70 kg CO₂, laptop ~300 kg, fast fashion item ~10 kg
- Digital: 1 hour HD streaming ~36g CO₂, video call ~150g/hr
- Water, waste, pets, events — lifecycle analysis
- Paris Agreement target: 2.3 tonnes/yr per person by 2030
- Indian government schemes: PM-KUSUM solar, FAME-II EV subsidies, Swachh Bharat

RESPONSE RULES:
1. Always quantify impact with kg CO₂e numbers when giving advice
2. Keep responses concise: 3-5 sentences for simple questions, up to 8 for complex ones
3. Provide numbered lists when giving action plans
4. Suggest alternatives, not just "stop doing X"
5. Reference Indian context (₹ costs, local brands, Indian climate, festivals)
6. End responses with one natural follow-up question to keep conversation going
7. If asked about something unrelated to sustainability/environment, gently redirect back to eco topics
8. When comparing options, use a clear "Option A: X kg vs Option B: Y kg" format

PLATFORM CONTEXT:
The user is on GreenStep India, where they can:
- Log carbon entries across 10 categories (transport, energy, diet, shopping, waste, digital, food delivery, water, pets, events)
- View their dashboard with daily/weekly CO₂ tracking
- Earn eco-coins for logging entries and reducing emissions
- Browse eco-friendly products in the Eco Store
- Join community groups and challenges
`;

export async function POST(req: NextRequest) {
  try {
    // Auth check — blocks anonymous requests
    const user = await requireCurrentUser();

    // Rate limit — 10 requests per minute per user (Redis-backed)
    const rateLimited = await checkRateLimit(req, aiLimiter, user.id);
    if (rateLimited) return rateLimited;

    // Validate request body
    const body = await req.json();
    const parsed = aiCoachSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(`Invalid request: ${formatZodError(parsed.error)}`, 422);
    }

    const { messages, userContext } = parsed.data;

    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return apiError(
        "Gemini API key not configured. Add GEMINI_API_KEY to environment variables.",
        500
      );
    }

    // Build conversation history for Gemini
    const geminiMessages = messages.map((msg) => ({
      role: msg.role === "user" ? "user" : "model",
      parts: [{ text: msg.content }],
    }));

    // Enhance system instruction with user context if available
    let enhancedSystem = SYSTEM_INSTRUCTION;
    if (userContext) {
      enhancedSystem += `\n\nUSER CONTEXT:\n- Annual footprint: ${userContext.footprint || 1900} kg CO₂/yr\n- Name: ${userContext.name || "User"}\n- Location: ${userContext.city || "India"}`;
    }

    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          system_instruction: {
            parts: [{ text: enhancedSystem }],
          },
          contents: geminiMessages,
          generationConfig: {
            temperature: 0.8,
            topP: 0.95,
            topK: 40,
            maxOutputTokens: 1024,
          },
          safetySettings: [
            { category: "HARM_CATEGORY_HARASSMENT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_HATE_SPEECH", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_SEXUALLY_EXPLICIT", threshold: "BLOCK_ONLY_HIGH" },
            { category: "HARM_CATEGORY_DANGEROUS_CONTENT", threshold: "BLOCK_ONLY_HIGH" },
          ],
        }),
      }
    );

    if (!response.ok) {
      console.error("Gemini API error:", response.status);
      return apiError("AI service temporarily unavailable", 502);
    }

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      "I'm having trouble generating a response right now. Please try again!";

    return apiSuccess({ text });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return apiError("Authentication required", 401);
    }
    console.error("AI Coach API error:", error);
    return apiError("Failed to connect to AI service", 500);
  }
}
