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

      const {
        data: { user },
        error: userError,
      } = await supabase.auth.getUser();

      if (userError || !user) {
        throw userError ?? new Error("Unable to load authenticated user.");
      }

      const displayName =
        user.user_metadata?.full_name ||
        user.user_metadata?.name ||
        user.user_metadata?.display_name ||
        user.email?.split("@")[0] ||
        "Eco User";

      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("id, onboarding_completed")
        .eq("id", user.id)
        .maybeSingle();

      if (profileError) {
        throw profileError;
      }

      if (!profile) {
        const { error: insertError } = await supabase.from("profiles").insert({
          id: user.id,
          display_name: displayName,
          city: "Haridwar",
          state: "Uttarakhand",
          diet_type: "vegetarian",
          onboarding_completed: false,
        });

        if (insertError) {
          throw insertError;
        }

        return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
      }

      if (!profile.onboarding_completed) {
        return NextResponse.redirect(new URL("/onboarding", requestUrl.origin));
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
