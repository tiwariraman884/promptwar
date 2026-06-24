/**
 * Request ID Generator
 *
 * Generates unique request IDs for tracing API requests through the system.
 * Uses crypto.randomUUID() when available, falls back to a timestamp-based ID.
 *
 * Format: "req_<uuid>" e.g. "req_a1b2c3d4-e5f6-7890-abcd-ef1234567890"
 */

const REQUEST_ID_PREFIX = "req_";

/**
 * Generate a unique request ID.
 * Safe for both Edge and Node.js runtimes.
 */
export function generateRequestId(): string {
  if (typeof crypto !== "undefined" && typeof crypto.randomUUID === "function") {
    return `${REQUEST_ID_PREFIX}${crypto.randomUUID()}`;
  }
  // Fallback: timestamp + random hex
  const ts = Date.now().toString(36);
  const rand = Math.random().toString(36).slice(2, 10);
  return `${REQUEST_ID_PREFIX}${ts}-${rand}`;
}

/**
 * Extract request ID from headers.
 * Returns existing ID if present, generates new one otherwise.
 */
export function getOrCreateRequestId(headers: Headers): string {
  const existing = headers.get("x-request-id");
  if (existing && existing.startsWith(REQUEST_ID_PREFIX)) {
    return existing;
  }
  return generateRequestId();
}
