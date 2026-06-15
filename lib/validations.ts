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

/* ─── Helper: format Zod errors into a readable string ─── */

export function formatZodError(error: z.ZodError): string {
  return error.issues
    .map((e) => `${e.path.join(".")}: ${e.message}`)
    .join("; ");
}
