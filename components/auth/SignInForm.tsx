"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import SocialButtons from "./SocialButtons";

export default function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!email.trim()) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
    if (!password) return setError("Password is required.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");

    setLoading(true);
    setTimeout(() => {
      const name = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      localStorage.setItem("eco_user", JSON.stringify({ name, email }));
      if (remember) localStorage.setItem("eco_remember", "true");
      router.push("/dashboard");
    }, 800);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {error}
        </div>
      )}

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 text-sm text-white placeholder-white/25 transition-all focus:border-[#00E676]/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#00E676]/20"
        />
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-xs font-semibold text-white/60 uppercase tracking-wider">
            Password
          </label>
          <Link href="/auth/forgot" className="text-[11px] font-medium text-[#00E676]/70 hover:text-[#00E676] transition">
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            autoComplete="current-password"
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-3 pr-11 text-sm text-white placeholder-white/25 transition-all focus:border-[#00E676]/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#00E676]/20"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              {showPw ? (
                <>
                  <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94"/>
                  <path d="M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19"/>
                  <line x1="1" y1="1" x2="23" y2="23"/>
                </>
              ) : (
                <>
                  <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                  <circle cx="12" cy="12" r="3"/>
                </>
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Remember Me */}
      <label className="flex items-center gap-2 cursor-pointer group">
        <div className="relative">
          <input
            type="checkbox"
            checked={remember}
            onChange={() => setRemember(!remember)}
            className="sr-only peer"
          />
          <div className="h-4 w-4 rounded border border-white/20 bg-white/[0.05] transition-all peer-checked:border-[#00E676] peer-checked:bg-[#00E676] flex items-center justify-center">
            {remember && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#06120C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </div>
        </div>
        <span className="text-xs text-white/50 group-hover:text-white/70 transition">Remember me</span>
      </label>

      {/* Submit */}
      <button
        type="submit"
        disabled={loading}
        className="w-full rounded-xl bg-gradient-to-r from-[#00E676] to-[#00C853] py-3.5 text-sm font-bold text-[#06120C] transition-all duration-200 hover:shadow-lg hover:shadow-[#00E676]/20 hover:-translate-y-0.5 active:translate-y-0 disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-2"
      >
        {loading ? (
          <>
            <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#06120C]/30 border-t-[#06120C]" />
            Signing in…
          </>
        ) : (
          "Continue"
        )}
      </button>

      <SocialButtons mode="signin" />
    </form>
  );
}
