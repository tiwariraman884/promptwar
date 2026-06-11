"use client";

import { useState } from "react";
import Link from "next/link";
import Logo from "@/components/Logo";
import PasswordStrength from "@/components/auth/PasswordStrength";

type Step = 1 | 2 | 3 | 4;

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>(1);
  const [email, setEmail] = useState("");
  const [newPw, setNewPw] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleSendLink(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email.");
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(2); }, 1000);
  }

  function handleResetPw(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (newPw.length < 8) return setError("Password must be at least 8 characters.");
    if (!/[A-Z]/.test(newPw)) return setError("Password needs an uppercase letter.");
    if (!/[0-9]/.test(newPw)) return setError("Password needs a number.");
    if (!/[^a-zA-Z0-9]/.test(newPw)) return setError("Password needs a special character.");
    if (newPw !== confirmPw) return setError("Passwords don't match.");
    setLoading(true);
    setTimeout(() => { setLoading(false); setStep(4); }, 1000);
  }

  const stepIcons = [
    // Step 1: Enter email
    <svg key="1" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="4" width="20" height="16" rx="2"/><polyline points="22,4 12,13 2,4"/></svg>,
    // Step 2: Check inbox
    <svg key="2" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 12h-6l-2 3H10l-2-3H2"/><path d="M5.45 5.11L2 12v6a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-6l-3.45-6.89A2 2 0 0 0 16.76 4H7.24a2 2 0 0 0-1.79 1.11z"/></svg>,
    // Step 3: New password
    <svg key="3" width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/><circle cx="12" cy="16" r="1"/></svg>,
    // Step 4: Success
    <svg key="4" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#00E676" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>,
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#06120C] px-5 py-10">
      <div className="w-full max-w-[420px] text-center">
        <Logo size="lg" variant="full" />

        {/* Step indicator */}
        <div className="mt-8 flex items-center justify-center gap-2 mb-8">
          {[1, 2, 3, 4].map((s) => (
            <div key={s} className="flex items-center gap-2">
              <div className={`h-7 w-7 rounded-full flex items-center justify-center text-[11px] font-bold transition-all ${
                step >= s
                  ? "bg-[#00E676] text-[#06120C]"
                  : "bg-white/[0.05] text-white/30 border border-white/10"
              }`}>
                {step > s ? "✓" : s}
              </div>
              {s < 4 && <div className={`w-8 h-0.5 rounded transition-colors ${step > s ? "bg-[#00E676]" : "bg-white/10"}`} />}
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl px-8 py-10 shadow-2xl shadow-black/40">
          {/* Icon */}
          <div className="mx-auto mb-6 h-20 w-20 rounded-full bg-[#00E676]/10 flex items-center justify-center">
            {stepIcons[step - 1]}
          </div>

          {error && (
            <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 text-left flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
              {error}
            </div>
          )}

          {/* Step 1: Enter email */}
          {step === 1 && (
            <>
              <h1 className="text-2xl font-extrabold text-white mb-2">Forgot password?</h1>
              <p className="text-sm text-white/50 mb-6">Enter your email and we&apos;ll send a reset link.</p>
              <form onSubmit={handleSendLink} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Email Address</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@example.com"
                    autoComplete="email"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 transition-all focus:border-[#00E676]/50 focus:outline-none focus:ring-2 focus:ring-[#00E676]/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] py-3.5 text-sm font-bold text-[#06120C] transition-all hover:shadow-lg hover:shadow-[#00E676]/20 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#06120C]/30 border-t-[#06120C]" /> Sending…</>
                  ) : "Send Reset Link"}
                </button>
              </form>
            </>
          )}

          {/* Step 2: Check inbox */}
          {step === 2 && (
            <>
              <h1 className="text-2xl font-extrabold text-white mb-2">Check your inbox</h1>
              <p className="text-sm text-white/50 mb-6 leading-relaxed">
                We&apos;ve sent a reset link to<br />
                <span className="font-semibold text-[#00E676]">{email}</span>
              </p>
              <button
                onClick={() => setStep(3)}
                className="w-full rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] py-3.5 text-sm font-bold text-[#06120C] transition-all hover:shadow-lg hover:shadow-[#00E676]/20 mb-4"
              >
                Open Reset Link (Demo)
              </button>
              <p className="text-xs text-white/30">
                Didn&apos;t receive it?{" "}
                <button onClick={() => { setStep(1); setError(""); }} className="text-[#00E676] font-semibold hover:underline">Try again</button>
              </p>
            </>
          )}

          {/* Step 3: New password */}
          {step === 3 && (
            <>
              <h1 className="text-2xl font-extrabold text-white mb-2">Create new password</h1>
              <p className="text-sm text-white/50 mb-6">Choose a strong, unique password.</p>
              <form onSubmit={handleResetPw} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">New Password</label>
                  <div className="relative">
                    <input
                      type={showPw ? "text" : "password"}
                      value={newPw}
                      onChange={(e) => setNewPw(e.target.value)}
                      placeholder="Min. 8 characters"
                      className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 pr-11 text-sm text-white placeholder-white/25 transition-all focus:border-[#00E676]/50 focus:outline-none focus:ring-2 focus:ring-[#00E676]/20"
                    />
                    <button type="button" onClick={() => setShowPw(!showPw)} className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition" aria-label="Toggle">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>
                      </svg>
                    </button>
                  </div>
                  <PasswordStrength password={newPw} />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Confirm Password</label>
                  <input
                    type="password"
                    value={confirmPw}
                    onChange={(e) => setConfirmPw(e.target.value)}
                    placeholder="••••••••"
                    className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 transition-all focus:border-[#00E676]/50 focus:outline-none focus:ring-2 focus:ring-[#00E676]/20"
                  />
                </div>
                <button
                  type="submit"
                  disabled={loading}
                  className="w-full rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] py-3.5 text-sm font-bold text-[#06120C] transition-all hover:shadow-lg hover:shadow-[#00E676]/20 disabled:opacity-60 flex items-center justify-center gap-2"
                >
                  {loading ? (
                    <><span className="h-4 w-4 animate-spin rounded-full border-2 border-[#06120C]/30 border-t-[#06120C]" /> Resetting…</>
                  ) : "Reset Password"}
                </button>
              </form>
            </>
          )}

          {/* Step 4: Success */}
          {step === 4 && (
            <>
              <h1 className="text-2xl font-extrabold text-white mb-2">Password Reset!</h1>
              <p className="text-sm text-white/50 mb-6">Your password has been successfully changed.</p>
              <Link
                href="/auth"
                className="block w-full rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] py-3.5 text-sm font-bold text-[#06120C] text-center transition-all hover:shadow-lg hover:shadow-[#00E676]/20"
              >
                Back to Sign In
              </Link>
            </>
          )}
        </div>

        <Link href="/auth" className="mt-6 inline-flex items-center gap-1.5 text-xs font-medium text-white/30 hover:text-white/60 transition">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
          Back to sign in
        </Link>
      </div>
    </div>
  );
}
