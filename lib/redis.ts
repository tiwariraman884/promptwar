/**
 * Singleton Upstash Redis client.
 *
 * Uses HTTP-based @upstash/redis — works natively in Vercel serverless
 * functions (no persistent TCP connection required).
 *
 * Returns `null` if environment variables are not configured, allowing
 * the app to fall back to in-memory rate limiting in local development.
 */

import { Redis } from "@upstash/redis";

let redis: Redis | null = null;
let warnedOnce = false;

export function getRedis(): Redis | null {
  if (redis) return redis;

  const url = process.env.UPSTASH_REDIS_REST_URL;
  const token = process.env.UPSTASH_REDIS_REST_TOKEN;

  if (!url || !token) {
    if (!warnedOnce) {
      console.warn(
        "[redis] UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN not set. " +
          "Falling back to in-memory rate limiting."
      );
      warnedOnce = true;
    }
    return null;
  }

  redis = new Redis({ url, token });
  return redis;
}
