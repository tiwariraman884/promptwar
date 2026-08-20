import type { NextRequest } from "next/server";
import { apiError, apiSuccess } from "@/lib/api";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const lat = searchParams.get("lat");
    const lng = searchParams.get("lng");

    if (!lat || !lng) {
      return apiError("Missing lat or lng parameter", 400);
    }

    const url = `https://nominatim.openstreetmap.org/reverse?lat=${encodeURIComponent(lat)}&lon=${encodeURIComponent(lng)}&format=json&addressdetails=1`;

    const res = await fetch(url, {
      headers: {
        "User-Agent": "GreenStepIndia/1.0 (contact@greenstep.in)",
        "Accept-Language": "en",
      },
      next: { revalidate: 300 },
    });

    if (!res.ok) {
      return apiError("Failed to fetch location address", res.status);
    }

    const data = await res.json();
    return apiSuccess({
      address: data.display_name || null,
      details: data.address || {},
    });
  } catch (error) {
    console.error("Reverse geocode error:", error);
    return apiError("Internal server error during reverse geocoding", 500);
  }
}
