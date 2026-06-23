/**
 * Zod schemas for all API request/response validation.
 */

import { z } from "zod";
import { CATEGORY_ORDER } from "@/lib/emission-factors";

/* ─── Shared ─── */

export const paginationSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/* ─── Entries ─── */

export const entryBodySchema = z.object({
  category: z.enum(CATEGORY_ORDER as unknown as [string, ...string[]]),
  input: z.record(z.string(), z.unknown()),
  entry_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  sub_type: z.string().optional(),
  quantity: z.number().optional(),
  unit: z.string().optional(),
  notes: z.string().max(500).optional(),
  externalActivityId: z.string().optional(),
  externalParameters: z.record(z.string(), z.unknown()).optional(),
  externalRegion: z.string().optional(),
});

/* ─── Tips ─── */

export const tipCompleteSchema = z.object({
  tipId: z.string().min(1, "tipId is required"),
});

/* ─── Challenges ─── */

export const challengeJoinSchema = z.object({
  challengeId: z.string().min(1, "challengeId is required"),
});

/* ─── AI Coach ─── */

const aiMessageSchema = z.object({
  role: z.enum(["user", "assistant", "model"]),
  content: z.string().min(1).max(4000),
});

export const aiCoachSchema = z.object({
  messages: z.array(aiMessageSchema).min(1).max(50),
  userContext: z
    .object({
      footprint: z.number().optional(),
      name: z.string().optional(),
      city: z.string().optional(),
    })
    .optional(),
});

/* ─── Scanner ─── */

export const scannerSchema = z.object({
  query: z.string().min(1, "Query is required").max(500),
  type: z.enum(["barcode", "name", "qr", "image"]).optional(),
});

/* ─── Geocode ─── */

export const geocodeSchema = z.object({
  address: z.string().min(1, "address is required").max(500),
});

/* ─── Leaderboard ─── */

export const leaderboardSchema = z.object({
  scope: z.enum(["city", "state"]).default("city"),
});

/* ─── Carbon Intelligence ─── */

const dietInputSchema = z.object({
  food_type: z.enum(["vegan", "vegetarian", "non_veg_chicken", "non_veg_mixed", "non_veg_beef"]),
  frequency: z.enum(["one", "two", "three"]),
  meat_dairy_level: z.enum(["none", "low", "moderate", "high"]),
  local_vs_imported: z.enum(["mostly_local", "mixed", "mostly_imported"]),
});

const travelInputSchema = z.object({
  commute_mode: z.enum(["walk_cycle", "public_transport", "two_wheeler", "car", "mixed"]),
  km_per_week: z.number().min(0).max(5000),
  flights_per_year: z.number().int().min(0).max(200),
  vehicle_type: z.enum(["petrol", "diesel", "electric", "cng"]).optional(),
});

const electricityInputSchema = z.object({
  monthly_kwh: z.number().min(0).max(10000),
  energy_source: z.enum(["grid_only", "partial_solar", "full_solar"]),
  appliance_usage: z.enum(["minimal", "moderate", "heavy"]),
});

const shoppingInputSchema = z.object({
  monthly_purchases: z.number().min(0).max(500),
  fashion_type: z.enum(["sustainable", "mixed", "fast_fashion"]),
  electronics_frequency: z.enum(["rarely", "occasionally", "frequently"]),
});

const wasteInputSchema = z.object({
  weekly_waste_kg: z.number().min(0).max(500),
  recycling_percent: z.number().min(0).max(100),
  composting: z.boolean(),
  plastic_usage: z.enum(["minimal", "moderate", "heavy"]),
});

export const carbonIntelligenceSchema = z.object({
  diet: dietInputSchema,
  travel: travelInputSchema,
  electricity: electricityInputSchema,
  shopping: shoppingInputSchema,
  waste: wasteInputSchema,
  current_month: z.number().int().min(1).max(12).optional(),
});

/* ─── Helper: format Zod errors into a readable string ─── */

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join("; ");
}
