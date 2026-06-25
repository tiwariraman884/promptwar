import type { NextRequest } from "next/server";
export const dynamic = "force-dynamic"; // reads request.headers
import { apiError, apiPaginated, apiSuccess } from "@/lib/api";
import { checkRateLimit, authLimiter } from "@/lib/rate-limit";
import { entryBodySchema, paginationSchema, formatZodError } from "@/lib/validations";
import {
  calculateEntry,
  type EntryInput
} from "@/lib/calculator-engine";
import {
  CATEGORY_ORDER,
  type EmissionCategory
} from "@/lib/emission-factors";
import { demoEntries } from "@/lib/demo-data";
import { estimateWithExternalProviders } from "@/lib/emissions/external-providers";
import { updateGamificationAfterEntry } from "@/lib/gamification-server";
import {
  AuthRequiredError,
  createServerSupabaseClient,
  requireCurrentUser
} from "@/lib/supabase/server";

type EntryBody = {
  category: EmissionCategory;
  input: EntryInput["input"];
  entry_date?: string;
  sub_type?: string;
  quantity?: number;
  unit?: string;
  notes?: string;
  externalActivityId?: string;
  externalParameters?: Record<string, unknown>;
  externalRegion?: string;
};

function todayIso() {
  return new Date().toISOString().slice(0, 10);
}

function inferSubType(body: EntryBody) {
  if (body.sub_type) return body.sub_type;

  if (body.category === "transport" && "mode" in body.input) {
    return body.input.mode;
  }
  if (body.category === "diet" && "dietType" in body.input) {
    return body.input.dietType;
  }

  return body.category;
}

function inferQuantity(body: EntryBody) {
  if (typeof body.quantity === "number") return body.quantity;

  if (body.category === "transport" && "distanceKm" in body.input) {
    return body.input.distanceKm * (body.input.frequency ?? 1);
  }
  if (body.category === "waste" && "totalKgPerWeek" in body.input) {
    return body.input.totalKgPerWeek;
  }

  return 1;
}

function inferUnit(body: EntryBody) {
  if (body.unit) return body.unit;
  if (body.category === "transport") return "km";
  if (body.category === "energy") return "kWh/cylinders";
  if (body.category === "waste") return "kg/week";
  if (body.category === "digital") return "hours";
  if (body.category === "diet") return "days";
  return "items";
}

export async function POST(request: NextRequest) {
  try {
    const user = await requireCurrentUser();

    // Rate limit â€” 100 req/min per user (Redis-backed)
    const rateLimited = await checkRateLimit(request, authLimiter, user.id);
    if (rateLimited) return rateLimited;

    // Validate request body
    const rawBody = await request.json();
    const parsed = entryBodySchema.safeParse(rawBody);
    if (!parsed.success) {
      return apiError(`Invalid entry: ${formatZodError(parsed.error)}`, 422);
    }

    const body = parsed.data as EntryBody;

    if (!CATEGORY_ORDER.includes(body.category)) {
      return apiError("Invalid emission category", 422);
    }

    const offlineCalculation = calculateEntry({
      category: body.category,
      input: body.input
    } as EntryInput);
    const externalEstimate =
      body.externalActivityId && body.externalParameters
        ? await estimateWithExternalProviders({
            activityId: body.externalActivityId,
            parameters: body.externalParameters,
            region: body.externalRegion
          })
        : null;
    const calculation = externalEstimate
      ? {
          ...offlineCalculation,
          kgCo2e: Number(externalEstimate.kgCo2e.toFixed(2))
        }
      : offlineCalculation;
    const entryDate = body.entry_date ?? todayIso();
    const entry = {
      user_id: user.id,
      entry_date: entryDate,
      category: body.category,
      sub_type: inferSubType(body),
      quantity: inferQuantity(body),
      unit: inferUnit(body),
      kg_co2e: calculation.kgCo2e,
      notes: body.notes ?? null
    };

    const supabase = createServerSupabaseClient();

    if (!supabase || user.isDemo) {
      return apiSuccess(
        {
          entry: {
            id: `demo-${Date.now()}`,
            ...entry,
            created_at: new Date().toISOString()
          },
          calculation,
          externalProvider: externalEstimate?.provider ?? "india_offline_cache",
          gamification: {
            coinsEarned: 10,
            badges: []
          }
        },
        201
      );
    }

    const { data, error } = await supabase
      .from("emission_entries")
      .insert(entry)
      .select()
      .single();

    if (error) {
      return apiError(error.message, 500);
    }

    const gamification = await updateGamificationAfterEntry(
      supabase,
      user.id,
      entryDate
    );

    return apiSuccess(
      {
        entry: data,
        calculation,
        externalProvider: externalEstimate?.provider ?? "india_offline_cache",
        gamification
      },
      201
    );
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return apiError("Authentication required", 401);
    }
    return apiError(error instanceof Error ? error.message : "Unable to save entry", 500);
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await requireCurrentUser();

    // Rate limit â€” 100 req/min per user (Redis-backed)
    const rateLimited = await checkRateLimit(request, authLimiter, user.id);
    if (rateLimited) return rateLimited;

    const { searchParams } = new URL(request.url);
    const date = searchParams.get("date");
    const from = searchParams.get("from");
    const to = searchParams.get("to");

    // Pagination
    const pageParsed = paginationSchema.safeParse({
      page: searchParams.get("page") ?? 1,
      limit: searchParams.get("limit") ?? 20,
    });
    const { page, limit } = pageParsed.success
      ? pageParsed.data
      : { page: 1, limit: 20 };

    if (user.isDemo) {
      const filtered = demoEntries.filter((entry) => {
        if (date) return entry.entry_date === date;
        if (from && entry.entry_date < from) return false;
        if (to && entry.entry_date > to) return false;
        return true;
      });
      const total = filtered.length;
      const paged = filtered.slice((page - 1) * limit, page * limit);
      return apiPaginated(paged, { page, limit, total });
    }

    const supabase = createServerSupabaseClient();
    let query = supabase!
      .from("emission_entries")
      .select("*", { count: "exact" })
      .eq("user_id", user.id)
      .order("entry_date", { ascending: false });

    if (date) query = query.eq("entry_date", date);
    if (from) query = query.gte("entry_date", from);
    if (to) query = query.lte("entry_date", to);

    // Pagination range
    const rangeStart = (page - 1) * limit;
    const rangeEnd = rangeStart + limit - 1;
    query = query.range(rangeStart, rangeEnd);

    const { data, error, count } = await query;

    if (error) {
      return apiError(error.message, 500);
    }

    return apiPaginated(data ?? [], {
      page,
      limit,
      total: count ?? 0,
    });
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return apiError("Authentication required", 401);
    }
    return apiError("Unable to fetch entries", 500);
  }
}
