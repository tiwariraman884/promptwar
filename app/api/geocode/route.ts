import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";
import { checkRateLimit, generalRateLimit } from "@/lib/rate-limit";
import { geocodeSchema, formatZodError } from "@/lib/validations";
import {
  AuthRequiredError,
  requireCurrentUser,
} from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  try {
    // Auth check — blocks anonymous requests
    await requireCurrentUser();

    // Rate limit — 60 requests per minute
    const rateLimited = checkRateLimit(request, generalRateLimit);
    if (rateLimited) return rateLimited;

    // Validate query params
    const { searchParams } = new URL(request.url);
    const parsed = geocodeSchema.safeParse({
      address: searchParams.get("address") ?? "",
    });

    if (!parsed.success) {
      return apiError(`Invalid request: ${formatZodError(parsed.error)}`, 422);
    }

    const { address } = parsed.data;

    const apiKey = process.env.GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      return apiError("Google Maps API key not configured", 500);
    }

    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    const res = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60s
    });

    const data = await res.json();

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0];
      return apiSuccess(
        {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address,
        }
      );
    }

    if (data.status === "ZERO_RESULTS") {
      return apiError("No results found for that address", 404);
    }

    return apiError(`Geocoding failed: ${data.status}`, 502);
  } catch (error) {
    if (error instanceof AuthRequiredError) {
      return apiError("Authentication required", 401);
    }
    console.error("Geocoding error:", error);
    return apiError("Internal geocoding error", 500);
  }
}
