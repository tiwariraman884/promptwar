"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import Logo from "@/components/Logo";
import { createClient, isSupabaseConfigured } from "@/lib/supabase/client";

export default function VerifyEmailPage() {
  const searchParams = useSearchParams();
  const email = searchParams.get("email") || "your email";
  const nextUrl = useMemo(() => searchParams.get("next") || "/dashboard", [searchParams]);
  const [resent, setResent] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!resent) return;
    const timer = setTimeout(() => setResent(false), 3000);
    return () => clearTimeout(timer);
  }, [resent]);

  async function handleResend() {
    setMessage("");

    if (!isSupabaseConfigured()) {
      setMessage("Supabase is not configured in this environment.");
      return;
    }

    setLoading(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.resend({
        type: "signup",
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?next=${encodeURIComponent(nextUrl)}`,
        },
      });

      if (error) {
        setMessage(error.message);
      } else {
        setResent(true);
        setMessage("Verification email sent again.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06120C] px-5 py-10">
      <div className="w-full max-w-[420px] text-center">
        <Logo size="lg" variant="full" />

        <div className="mt-10 rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl px-8 py-10 shadow-2xl shadow-black/40">
          <>
            <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-[#00E676]/10 flex items-center justify-center">
              <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="4" width="20" height="16" rx="2"/>
                <polyline points="22,4 12,13 2,4"/>
              </svg>
            </div>

            <h1 className="text-2xl font-extrabold text-white mb-2">Check your inbox</h1>
            <p className="text-sm text-white/50 mb-6 leading-relaxed">
              We&apos;ve sent a verification link to<br />
              <span className="font-semibold text-[#00E676]">{email}</span>
            </p>

            <p className="text-xs text-white/40 leading-relaxed mb-5">
              Click the link in your email to finish creating your account, then you&apos;ll be sent to your intended page.
            </p>

            {message && (
              <div role="status" className="mb-4 rounded-xl border border-white/10 bg-white/[0.04] px-4 py-3 text-left text-xs text-white/70">
                {message}
              </div>
            )}

            <button
              onClick={handleResend}
              disabled={loading}
              className="w-full rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] py-3.5 text-sm font-bold text-[#06120C] transition-all hover:shadow-lg hover:shadow-[#00E676]/20 hover:-translate-y-0.5 active:translate-y-0 mb-4 disabled:opacity-60 disabled:hover:translate-y-0"
            >
              {loading ? "Sending…" : resent ? "Verification email sent" : "Resend verification email"}
            </button>

            <div className="h-px bg-white/[0.06] my-5" />

            <Link
              href="/auth"
              className="text-xs font-semibold text-[#00E676] hover:underline transition"
            >
              Back to sign in
            </Link>
          </>
        </div>
      </div>
    </div>
  );
}
