"use client";

import { createBrowserClient } from "@supabase/ssr";

export function isSupabaseConfigured() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!url || !key) return false;
  if (
    url.includes("your-supabase") ||
    url.includes("your-project") ||
    url.includes("example.com") ||
    url.includes("placeholder") ||
    key.includes("your-anon-key") ||
    key.includes("placeholder")
  ) {
    return false;
  }

  try {
    const parsed = new URL(url);
    return parsed.protocol === "http:" || parsed.protocol === "https:";
  } catch {
    return false;
  }
}

/* ── Singleton: reuse the same client instance across all components ── */
let cachedClient: ReturnType<typeof createBrowserClient> | null = null;

export function createClient() {
  if (cachedClient) return cachedClient;

  if (!isSupabaseConfigured()) {
    throw new Error("Supabase environment variables are not configured.");
  }

  cachedClient = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  return cachedClient;
}
