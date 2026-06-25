import type { NextRequest } from "next/server";
export const dynamic = "force-dynamic"; // reads request.headers
import { apiError, apiSuccess } from "@/lib/api";
import { checkRateLimit, aiLimiter } from "@/lib/rate-limit";
import { scannerSchema, formatZodError } from "@/lib/validations";
import {
  AuthRequiredError,
  requireCurrentUser,
} from "@/lib/supabase/server";

/**
 * POST /api/scanner
 * Analyzes products for carbon footprint using Gemini AI.
 * Supports: product name search, barcode lookup, image analysis.
 */

const SYSTEM_INSTRUCTION = `You are a product sustainability and carbon footprint analyst for the GreenStep India platform.

When given a product name, barcode, or description, analyze it and respond ONLY with valid JSON (no markdown, no explanation outside JSON):

{
  "product": "<product name>",
  "brand": "<brand name or 'Generic'>",
  "category": "<category like Electronics, Food, Clothing, etc.>",
  "footprint_kg": <number: total lifecycle CO2e in kg>,
  "rating": "<A+ | A | B | C | D | F>",
  "rating_label": "<Very Low | Low | Moderate | High | Very High | Extreme>",
  "breakdown": {
    "production": <number: kg CO2e>,
    "transport": <number: kg CO2e>,
    "use_phase": <number: kg CO2e>,
    "disposal": <number: kg CO2e>
  },
  "packaging": {
    "type": "<Plastic | Cardboard | Glass | Metal | Mixed | None>",
    "recyclable": <true | false>,
    "biodegradable": <true | false>
  },
  "sustainability_score": <number 1-100>,
  "comparison": "<one sentence comparing to a familiar reference>",
  "greener_alternative": "<name of a lower-carbon alternative product>",
  "alternative_footprint_kg": <number>,
  "tip": "<one actionable sentence for reducing impact>",
  "eco_facts": [
    "<fact 1 about this product's environmental impact>",
    "<fact 2>"
  ]
}

RULES:
- Use IPCC AR6 lifecycle emission data where available
- For Indian products, use India-specific emission factors
- For barcodes starting with 890 (India GS1 prefix), identify as Indian product
- For unknown products, make a well-reasoned estimate
- Always return valid JSON, never markdown
- sustainability_score: 80-100 = A+/A, 60-79 = B, 40-59 = C, 20-39 = D, 0-19 = F`;

// Built-in product database for instant results (no API call needed)
const PRODUCT_DB: Record<string, Record<string, unknown>> = {
  // Common Indian grocery barcodes
  "8901030899999": {
    product: "Amul Butter 500g", brand: "Amul", category: "Dairy",
    footprint_kg: 4.2, rating: "C", rating_label: "Moderate", sustainability_score: 45,
    breakdown: { production: 3.1, transport: 0.4, use_phase: 0.2, disposal: 0.5 },
    packaging: { type: "Mixed", recyclable: true, biodegradable: false },
    comparison: "Equivalent to driving 18 km in a petrol car",
    greener_alternative: "Plant-based butter spread", alternative_footprint_kg: 1.1,
    tip: "Consider switching to plant-based alternatives for lower emissions",
    eco_facts: ["Dairy production accounts for ~3% of global GHG emissions", "Refrigeration adds to the total carbon footprint"]
  },
  "8901725133541": {
    product: "Parle-G Biscuits 800g", brand: "Parle", category: "Snacks",
    footprint_kg: 1.3, rating: "B", rating_label: "Low", sustainability_score: 68,
    breakdown: { production: 0.7, transport: 0.2, use_phase: 0.0, disposal: 0.4 },
    packaging: { type: "Plastic", recyclable: false, biodegradable: false },
    comparison: "Equivalent to charging your phone 158 times",
    greener_alternative: "Locally baked whole wheat biscuits", alternative_footprint_kg: 0.6,
    tip: "Choose biscuits in paper packaging to reduce plastic waste",
    eco_facts: ["Parle-G is the world's largest selling biscuit brand", "Wheat-based products have lower carbon than rice-based"]
  },
  "8901063070226": {
    product: "Tata Tea Gold 500g", brand: "Tata", category: "Beverages",
    footprint_kg: 2.1, rating: "B", rating_label: "Low", sustainability_score: 62,
    breakdown: { production: 1.2, transport: 0.3, use_phase: 0.4, disposal: 0.2 },
    packaging: { type: "Cardboard", recyclable: true, biodegradable: true },
    comparison: "Equivalent to 1 hour of AC usage",
    greener_alternative: "Locally grown herbal tea", alternative_footprint_kg: 0.8,
    tip: "Boil only the water you need â€” heating excess water wastes energy",
    eco_facts: ["Tea has ~50% lower footprint than coffee", "Cardboard packaging is easier to recycle"]
  },
};

// Common product name mappings
const PRODUCT_NAME_DB: Record<string, Record<string, unknown>> = {
  "iphone": {
    product: "iPhone 15", brand: "Apple", category: "Electronics",
    footprint_kg: 70, rating: "D", rating_label: "High", sustainability_score: 28,
    breakdown: { production: 56, transport: 5, use_phase: 6, disposal: 3 },
    packaging: { type: "Cardboard", recyclable: true, biodegradable: false },
    comparison: "Equivalent to driving 300 km or 3 domestic flights within India",
    greener_alternative: "Refurbished iPhone or Fairphone", alternative_footprint_kg: 14,
    tip: "Keep your phone for 4+ years to halve its annual carbon impact",
    eco_facts: ["80% of a phone's emissions come from manufacturing", "Rare earth mining causes significant environmental damage"]
  },
  "laptop": {
    product: "Laptop Computer", brand: "Generic", category: "Electronics",
    footprint_kg: 300, rating: "D", rating_label: "High", sustainability_score: 25,
    breakdown: { production: 210, transport: 20, use_phase: 55, disposal: 15 },
    packaging: { type: "Cardboard", recyclable: true, biodegradable: false },
    comparison: "Equivalent to 5 months of an average Indian's total footprint",
    greener_alternative: "Refurbished laptop", alternative_footprint_kg: 60,
    tip: "A refurbished laptop saves ~80% of manufacturing emissions",
    eco_facts: ["Laptops contain over 30 different metals", "E-waste is the fastest growing waste stream globally"]
  },
  "plastic water bottle": {
    product: "Plastic Water Bottle (1L)", brand: "Generic", category: "Packaging",
    footprint_kg: 0.33, rating: "C", rating_label: "Moderate", sustainability_score: 42,
    breakdown: { production: 0.16, transport: 0.05, use_phase: 0.02, disposal: 0.1 },
    packaging: { type: "Plastic", recyclable: true, biodegradable: false },
    comparison: "100 bottles = driving 14 km in a car",
    greener_alternative: "Reusable steel water bottle", alternative_footprint_kg: 0.002,
    tip: "A reusable bottle pays back its carbon cost in ~50 uses",
    eco_facts: ["India generates 3.5 million tonnes of plastic waste annually", "Only 30% of PET bottles are recycled in India"]
  },
  "cotton t-shirt": {
    product: "Cotton T-Shirt", brand: "Generic", category: "Clothing",
    footprint_kg: 8.0, rating: "C", rating_label: "Moderate", sustainability_score: 40,
    breakdown: { production: 5.5, transport: 1.0, use_phase: 1.2, disposal: 0.3 },
    packaging: { type: "Plastic", recyclable: false, biodegradable: false },
    comparison: "Equivalent to 34 km of car driving",
    greener_alternative: "Organic cotton or linen T-shirt", alternative_footprint_kg: 3.5,
    tip: "Wash clothes in cold water â€” heating accounts for 80% of laundry energy",
    eco_facts: ["Cotton uses 10,000 litres of water per kg", "Fast fashion is responsible for 10% of global carbon emissions"]
  },
  "rice": {
    product: "Basmati Rice (1kg)", brand: "Generic", category: "Food",
    footprint_kg: 3.9, rating: "C", rating_label: "Moderate", sustainability_score: 44,
    breakdown: { production: 3.2, transport: 0.3, use_phase: 0.2, disposal: 0.2 },
    packaging: { type: "Plastic", recyclable: false, biodegradable: false },
    comparison: "Equivalent to 1.5 hours of running an AC",
    greener_alternative: "Millets (bajra, jowar, ragi)", alternative_footprint_kg: 0.7,
    tip: "Switch to millets 2x per week â€” 80% lower water and carbon footprint",
    eco_facts: ["Rice paddies produce methane â€” a GHG 80x more potent than COâ‚‚", "India is the 2nd largest rice producer globally"]
  },
  "oat milk": {
    product: "Oat Milk (1L)", brand: "Generic", category: "Beverages",
    footprint_kg: 0.9, rating: "A", rating_label: "Low", sustainability_score: 82,
    breakdown: { production: 0.5, transport: 0.15, use_phase: 0.05, disposal: 0.2 },
    packaging: { type: "Cardboard", recyclable: true, biodegradable: false },
    comparison: "3x lower than cow's milk",
    greener_alternative: "Homemade oat milk", alternative_footprint_kg: 0.3,
    tip: "Making oat milk at home eliminates packaging and transport emissions",
    eco_facts: ["Oat milk uses 80% less land than cow's milk", "Tetra packs are recyclable but often not recycled in India"]
  },
  "led bulb": {
    product: "LED Light Bulb (9W)", brand: "Generic", category: "Home",
    footprint_kg: 2.5, rating: "A", rating_label: "Low", sustainability_score: 85,
    breakdown: { production: 1.8, transport: 0.2, use_phase: 0.3, disposal: 0.2 },
    packaging: { type: "Cardboard", recyclable: true, biodegradable: true },
    comparison: "Over its lifetime, an LED saves 200 kg COâ‚‚ vs incandescent",
    greener_alternative: "Solar-powered outdoor LED", alternative_footprint_kg: 1.0,
    tip: "LEDs last 25x longer than incandescent â€” always worth the switch",
    eco_facts: ["Switching 1 bulb to LED saves â‚¹1,000/year in electricity", "India's UJALA scheme distributed 360M+ LED bulbs"]
  },
  "beef burger": {
    product: "Beef Burger (200g patty)", brand: "Generic", category: "Food",
    footprint_kg: 5.4, rating: "D", rating_label: "High", sustainability_score: 22,
    breakdown: { production: 4.5, transport: 0.3, use_phase: 0.2, disposal: 0.4 },
    packaging: { type: "Mixed", recyclable: false, biodegradable: false },
    comparison: "Equivalent to driving 23 km or charging phone 657 times",
    greener_alternative: "Plant-based burger patty", alternative_footprint_kg: 0.9,
    tip: "Replacing 1 beef meal/week with plant-based saves 200 kg COâ‚‚/year",
    eco_facts: ["Beef uses 20x more land than plant proteins", "Cattle farming is the #1 cause of deforestation"]
  },
};

function lookupByBarcode(barcode: string) {
  return PRODUCT_DB[barcode] || null;
}

function lookupByName(name: string) {
  const normalized = name.toLowerCase().trim();
  // Exact match
  if (PRODUCT_NAME_DB[normalized]) return PRODUCT_NAME_DB[normalized];
  // Fuzzy match
  for (const [key, value] of Object.entries(PRODUCT_NAME_DB)) {
    if (normalized.includes(key) || key.includes(normalized)) return value;
  }
  return null;
}

async function analyzeWithGemini(query: string, apiKey: string) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        system_instruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: "user", parts: [{ text: `Analyze this product: "${query}"` }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
      }),
    }
  );

  if (!response.ok) throw new Error(`Gemini API error: ${response.status}`);

  const data = await response.json();

  // Gemini 2.5 may return multiple parts (thought + text). Extract all text parts.
  const parts = data?.candidates?.[0]?.content?.parts || [];
  let text = "";
  for (const part of parts) {
    // Skip "thought" parts â€” they don't contain the answer
    if (part.thought) continue;
    if (part.text) text += part.text;
  }

  if (!text) throw new Error("Empty response from Gemini");

  // Strip markdown code fences if present
  const stripped = text.replace(/```json\s*/gi, "").replace(/```\s*/g, "").trim();

  // Extract JSON object from response
  const jsonMatch = stripped.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("Could not parse AI response");

  return JSON.parse(jsonMatch[0]);
}

async function lookupOpenFoodFacts(barcode: string) {
  try {
    const res = await fetch(`https://world.openfoodfacts.org/api/v2/product/${barcode}.json`, {
      headers: { "User-Agent": "GreenStepIndia/1.0" },
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.status !== 1) return null;
    const p = data.product;
    return {
      product: p.product_name || "Unknown Product",
      brand: p.brands || "Unknown",
      category: p.categories?.split(",")[0]?.trim() || "Food",
      image: p.image_front_url || null,
      nutriscore: p.nutriscore_grade || null,
      ecoscore: p.ecoscore_grade || null,
      packaging: p.packaging || null,
    };
  } catch {
    return null;
  }
}

export async function POST(req: NextRequest) {
  try {
    // Auth check â€” blocks anonymous requests
    const user = await requireCurrentUser();

    // Rate limit â€” 10 requests per minute per user (Redis-backed)
    const rateLimited = await checkRateLimit(req, aiLimiter, user.id);
    if (rateLimited) return rateLimited;

    // Validate request body
    const body = await req.json();
    const parsed = scannerSchema.safeParse(body);
    if (!parsed.success) {
      return apiError(`Invalid request: ${formatZodError(parsed.error)}`, 422);
    }

    const { query, type } = parsed.data;
    const isBarcode = type === "barcode" || /^\d{8,14}$/.test(query.trim());
    const cleanQuery = query.trim();

    // Step 1: Check local database
    const result = isBarcode ? lookupByBarcode(cleanQuery) : lookupByName(cleanQuery);

    if (result) {
      return apiSuccess({ source: "local_db", ...result });
    }

    // Step 2: For barcodes, try OpenFoodFacts
    if (isBarcode) {
      const offData = await lookupOpenFoodFacts(cleanQuery);
      if (offData) {
        // Use Gemini to analyze the product found in OpenFoodFacts
        const apiKey = process.env.GEMINI_API_KEY;
        if (apiKey) {
          try {
            const aiResult = await analyzeWithGemini(
              `${offData.product} by ${offData.brand}, category: ${offData.category}`,
              apiKey
            );
            return apiSuccess({
              source: "openfoodfacts+ai",
              ...aiResult,
              image: offData.image,
            });
          } catch {
            // Fall through to basic result
          }
        }
        return apiSuccess({
          source: "openfoodfacts",
          product: offData.product, brand: offData.brand, category: offData.category,
          image: offData.image, footprint_kg: 0, rating: "?", rating_label: "Unknown",
          sustainability_score: 0,
          breakdown: { production: 0, transport: 0, use_phase: 0, disposal: 0 },
          packaging: { type: offData.packaging || "Unknown", recyclable: false, biodegradable: false },
          comparison: "Carbon data unavailable â€” add Gemini API key for full analysis",
          greener_alternative: "N/A", alternative_footprint_kg: 0,
          tip: "Add GEMINI_API_KEY to get full carbon analysis",
          eco_facts: ["Product found in OpenFoodFacts database"],
        });
      }
    }

    // Step 3: Use Gemini AI for analysis
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      return apiError(
        "Product not found in local database. Add GEMINI_API_KEY for AI-powered analysis.",
        404
      );
    }

    const aiResult = await analyzeWithGemini(cleanQuery, apiKey);
    return apiSuccess({ source: "ai", ...aiResult });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return apiError("Authentication required", 401);
    }
    console.error("Scanner API error:", error);
    return apiError("Failed to analyze product", 500);
  }
}
