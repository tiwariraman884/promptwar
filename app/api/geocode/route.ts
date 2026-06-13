import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const address = searchParams.get("address");

  if (!address || address.trim().length === 0) {
    return NextResponse.json(
      { error: "Missing 'address' query parameter" },
      { status: 400 }
    );
  }

  const apiKey = process.env.GOOGLE_MAPS_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "Google Maps API key not configured" },
      { status: 500 }
    );
  }

  try {
    const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
      address
    )}&key=${apiKey}`;

    const res = await fetch(url, {
      next: { revalidate: 60 }, // Cache for 60s
    });

    const data = await res.json();

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0];
      return NextResponse.json(
        {
          lat: result.geometry.location.lat,
          lng: result.geometry.location.lng,
          formatted_address: result.formatted_address,
        },
        {
          headers: {
            "Cache-Control": "public, max-age=60, s-maxage=60",
          },
        }
      );
    }

    if (data.status === "ZERO_RESULTS") {
      return NextResponse.json(
        { error: "No results found for that address" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: `Geocoding failed: ${data.status}` },
      { status: 502 }
    );
  } catch (err) {
    console.error("Geocoding error:", err);
    return NextResponse.json(
      { error: "Internal geocoding error" },
      { status: 500 }
    );
  }
}
