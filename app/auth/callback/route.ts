import { NextResponse, type NextRequest } from "next/server";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url);
  const code = requestUrl.searchParams.get("code");
  const next = requestUrl.searchParams.get("next") ?? "/dashboard";
  const error = requestUrl.searchParams.get("error");
  const errorDescription = requestUrl.searchParams.get("error_description");

  if (error) {
    const redirectUrl = new URL("/auth", requestUrl.origin);
    redirectUrl.searchParams.set("error", "oauth_denied");
    redirectUrl.searchParams.set("message", errorDescription || "Google sign-in was not completed.");
    return NextResponse.redirect(redirectUrl);
  }

  if (code) {
    try {
      const supabase = createServerSupabaseClient();

      if (!supabase) {
        throw new Error("Supabase is not configured on the server.");
      }

      const { error: exchangeError } = await supabase.auth.exchangeCodeForSession(code);

      if (exchangeError) {
        throw exchangeError;
      }
    } catch (exchangeError) {
      const redirectUrl = new URL("/auth", requestUrl.origin);
      redirectUrl.searchParams.set("error", "oauth_callback_failed");
      redirectUrl.searchParams.set(
        "message",
        exchangeError instanceof Error ? exchangeError.message : "Google sign-in could not be completed."
      );
      return NextResponse.redirect(redirectUrl);
    }
  }

  return NextResponse.redirect(new URL(next, requestUrl.origin));
}
