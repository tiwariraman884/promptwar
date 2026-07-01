"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import type { Route } from "next";
import { isSupabaseConfigured, createClient } from "@/lib/supabase/client";
import GoogleOAuthButton from "./GoogleOAuthButton";

function GithubIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
      <path d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0 1 12 6.844a9.59 9.59 0 0 1 2.504.337c1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.02 10.02 0 0 0 22 12.017C22 6.484 17.522 2 12 2z"/>
    </svg>
  );
}

interface SocialButtonsProps {
  mode: "signin" | "signup";
}

export default function SocialButtons({ mode }: SocialButtonsProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  // AUTH GATE (RULE 2): Read the ?next= param so social sign-in also
  // redirects users to the page they originally tried to visit.
  const searchParams = useSearchParams();
  const nextUrl = searchParams.get("next") || "/dashboard";
  const label = mode === "signin" ? "Sign in with" : "Continue with";

  async function handleGitHubLogin() {
    setError("");
    setLoading(true);

    if (isSupabaseConfigured()) {
      // Real Supabase OAuth
      const supabase = createClient();

      try {
        const { data, error: authError } = await supabase.auth.signInWithOAuth({
          provider: "github",
          options: {
            redirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
          },
        });

        if (authError) {
          throw authError;
        }

        if (!data.url) {
          throw new Error("OAuth provider did not return a redirect URL.");
        }

        window.location.assign(data.url);
      } catch (err) {
        setError(err instanceof Error ? err.message : "OAuth sign-in failed.");
        setLoading(false);
      }
    } else {
      // Demo mode — localStorage mock
      const name = "GitHub User";
      const email = "user@github.com";
      localStorage.setItem("eco_user", JSON.stringify({ name, email, provider: "github" }));
      router.push(nextUrl as Route);
    }
  }

  return (
    <div className="space-y-3">
      <GoogleOAuthButton />

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-xs text-red-300">
          {error}
        </div>
      )}

      {/* Divider */}
      <div className="flex items-center gap-3 my-1">
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <span className="text-[11px] font-medium text-white/40 uppercase tracking-wider">or</span>
        <div className="flex-1 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
      </div>

      {/* Buttons */}
      <div className="grid grid-cols-1 gap-2">
        <button
          type="button"
          onClick={handleGitHubLogin}
          disabled={loading}
          className="group flex items-center justify-center gap-2 rounded-xl border border-white/[0.08] bg-white/[0.02] px-3 py-3 text-[12px] font-medium text-white/60 transition-all duration-300 hover:bg-white/[0.06] hover:border-white/15 hover:text-white/90 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 focus:outline-none focus:ring-2 focus:ring-[#00E676]/30 active:translate-y-0 disabled:cursor-not-allowed disabled:opacity-60"
        >
          <span className="transition-transform duration-200 group-hover:scale-110">
            <GithubIcon />
          </span>
          {loading ? "Connecting…" : `${label} GitHub`}
        </button>
      </div>
    </div>
  );
}
