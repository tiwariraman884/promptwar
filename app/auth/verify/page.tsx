"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Logo from "@/components/Logo";

export default function VerifyEmailPage() {
  const [countdown, setCountdown] = useState(60);
  const [resent, setResent] = useState(false);
  const [verified, setVerified] = useState(false);
  const router = useRouter();

  // Get email from localStorage
  const [email, setEmail] = useState("");
  useEffect(() => {
    const raw = localStorage.getItem("eco_user");
    if (raw) {
      try {
        setEmail(JSON.parse(raw).email || "");
      } catch { /* ignore */ }
    }
  }, []);

  // Countdown timer
  useEffect(() => {
    if (countdown <= 0 || resent) return;
    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [countdown, resent]);

  function handleResend() {
    setCountdown(60);
    setResent(true);
    setTimeout(() => setResent(false), 2000);
  }

  function handleVerify() {
    setVerified(true);
    setTimeout(() => router.push("/dashboard?welcome=1"), 2000);
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06120C] px-5 py-10">
      <div className="w-full max-w-[420px] text-center">
        <Logo size="lg" variant="full" />

        <div className="mt-10 rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl px-8 py-10 shadow-2xl shadow-black/40">
          {!verified ? (
            <>
              {/* Mail icon */}
              <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-[#00E676]/10 flex items-center justify-center">
                <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="4" width="20" height="16" rx="2"/>
                  <polyline points="22,4 12,13 2,4"/>
                </svg>
              </div>

              <h1 className="text-2xl font-extrabold text-white mb-2">Check your inbox</h1>
              <p className="text-sm text-white/50 mb-6 leading-relaxed">
                We&apos;ve sent a verification link to<br />
                <span className="font-semibold text-[#00E676]">{email || "your email"}</span>
              </p>

              {/* Mock verify button (in real app, this would be done via email link) */}
              <button
                onClick={handleVerify}
                className="w-full rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] py-3.5 text-sm font-bold text-[#06120C] transition-all hover:shadow-lg hover:shadow-[#00E676]/20 hover:-translate-y-0.5 active:translate-y-0 mb-4"
              >
                Verify Email (Demo)
              </button>

              <div className="h-px bg-white/[0.06] my-5" />

              <p className="text-xs text-white/30 mb-2">Didn&apos;t receive the email?</p>

              {resent ? (
                <p className="text-xs text-[#00E676] font-semibold flex items-center justify-center gap-1">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
                  Email resent!
                </p>
              ) : countdown > 0 ? (
                <p className="text-xs text-white/30">
                  Resend in <span className="font-bold text-white/50">{countdown}s</span>
                </p>
              ) : (
                <button
                  onClick={handleResend}
                  className="text-xs font-semibold text-[#00E676] hover:underline transition"
                >
                  Resend verification email
                </button>
              )}
            </>
          ) : (
            <>
              {/* Success */}
              <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-[#00E676]/10 flex items-center justify-center">
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="20 6 9 17 4 12"/>
                </svg>
              </div>
              <h1 className="text-2xl font-extrabold text-white mb-2">Email Verified!</h1>
              <p className="text-sm text-white/50">Redirecting to your dashboard…</p>
              <div className="mt-6 flex justify-center">
                <span className="h-5 w-5 animate-spin rounded-full border-2 border-[#00E676]/30 border-t-[#00E676]" />
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
