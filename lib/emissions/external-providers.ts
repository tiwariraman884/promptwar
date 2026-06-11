type ExternalEmissionRequest = {
  activityId: string;
  parameters: Record<string, unknown>;
  region?: string;
};

type ExternalEmissionResult = {
  kgCo2e: number;
  provider: "climatiq" | "emissions.dev";
  raw: unknown;
};

function normalizeKg(value: unknown, unit?: unknown) {
  const numeric = Number(value);
  if (!Number.isFinite(numeric)) return null;

  if (unit === "g" || unit === "gCO2e") return numeric / 1000;
  if (unit === "t" || unit === "tCO2e") return numeric * 1000;
  if (unit === "lb" || unit === "lbCO2e") return numeric * 0.45359237;
  return numeric;
}

export async function estimateWithClimatiq(
  request: ExternalEmissionRequest
): Promise<ExternalEmissionResult | null> {
  if (!process.env.CLIMATIQ_API_KEY) return null;

  const response = await fetch("https://api.climatiq.io/data/v1/estimate", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${process.env.CLIMATIQ_API_KEY}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      emission_factor: {
        activity_id: request.activityId,
        region: request.region ?? "IN"
      },
      parameters: request.parameters
    }),
    next: { revalidate: 60 * 60 * 24 }
  });

  if (!response.ok) return null;

  const raw = await response.json();
  const kgCo2e = normalizeKg(raw.co2e, raw.co2e_unit);

  if (kgCo2e === null) return null;

  return {
    kgCo2e,
    provider: "climatiq",
    raw
  };
}

export async function estimateWithEmissionsDev(
  request: ExternalEmissionRequest
): Promise<ExternalEmissionResult | null> {
  const endpoint =
    process.env.EMISSIONS_DEV_API_URL || "https://api.emissions.dev/v1/estimate";

  const response = await fetch(endpoint, {
    method: "POST",
    headers: {
      "Content-Type": "application/json"
    },
    body: JSON.stringify({
      activity_id: request.activityId,
      region: request.region ?? "IN",
      parameters: request.parameters
    }),
    next: { revalidate: 60 * 60 * 24 }
  });

  if (!response.ok) return null;

  const raw = await response.json();
  const kgCo2e =
    normalizeKg(raw.kgCO2e, "kgCO2e") ??
    normalizeKg(raw.kg_co2e, "kgCO2e") ??
    normalizeKg(raw.co2e, raw.co2e_unit);

  if (kgCo2e === null) return null;

  return {
    kgCo2e,
    provider: "emissions.dev",
    raw
  };
}

export async function estimateWithExternalProviders(
  request: ExternalEmissionRequest
) {
  return (
    (await estimateWithClimatiq(request)) ??
    (await estimateWithEmissionsDev(request))
  );
}
