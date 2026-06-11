"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import PasswordStrength from "./PasswordStrength";
import SocialButtons from "./SocialButtons";

const ROLES = ["Student", "Professional", "Organization"];
const COUNTRIES = ["India", "United States", "United Kingdom", "Canada", "Australia", "Germany", "Other"];

export default function SignUpForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPw, setConfirmPw] = useState("");
  const [country, setCountry] = useState("India");
  const [role, setRole] = useState("");
  const [agree, setAgree] = useState(false);
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    if (!name.trim()) return setError("Full name is required.");
    if (!email.trim()) return setError("Email is required.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) return setError("Enter a valid email address.");
    if (password.length < 8) return setError("Password must be at least 8 characters.");
    if (!/[A-Z]/.test(password)) return setError("Password needs an uppercase letter.");
    if (!/[0-9]/.test(password)) return setError("Password needs a number.");
    if (!/[^a-zA-Z0-9]/.test(password)) return setError("Password needs a special character.");
    if (password !== confirmPw) return setError("Passwords don't match.");
    if (!agree) return setError("You must agree to the terms.");

    setLoading(true);
    setTimeout(() => {
      localStorage.setItem("eco_user", JSON.stringify({ name, email, country, role }));
      router.push("/auth/verify");
    }, 800);
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>
          {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Full Name</label>
        <input
          type="text"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Arjun Sharma"
          autoComplete="name"
          className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-white/25 transition-all focus:border-[#00E676]/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#00E676]/20"
        />
      </div>

      {/* Email */}
      <div>
        <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Email Address</label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          autoComplete="email"
          className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-white/25 transition-all focus:border-[#00E676]/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#00E676]/20"
        />
      </div>

      {/* Password */}
      <div>
        <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Password</label>
        <div className="relative">
          <input
            type={showPw ? "text" : "password"}
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Min. 8 characters"
            autoComplete="new-password"
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-4 py-2.5 pr-11 text-sm text-white placeholder-white/25 transition-all focus:border-[#00E676]/50 focus:bg-white/[0.08] focus:outline-none focus:ring-2 focus:ring-[#00E676]/20"
          />
          <button
            type="button"
            onClick={() => setShowPw(!showPw)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-white/30 hover:text-white/60 transition"
            aria-label={showPw ? "Hide" : "Show"}
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
        <PasswordStrength password={password} />
      </div>

      {/* Confirm Password */}
      <div>
        <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Confirm Password</label>
        <input
          type="password"
          value={confirmPw}
          onChange={(e) => setConfirmPw(e.target.value)}
          placeholder="••••••••"
          autoComplete="new-password"
          className={`w-full rounded-xl border bg-white/[0.05] px-4 py-2.5 text-sm text-white placeholder-white/25 transition-all focus:outline-none focus:ring-2 focus:ring-[#00E676]/20 ${
            confirmPw && confirmPw !== password
              ? "border-red-500/50 focus:border-red-500/50"
              : "border-white/10 focus:border-[#00E676]/50"
          }`}
        />
        {confirmPw && confirmPw !== password && (
          <p className="mt-1 text-[11px] text-red-400">Passwords don&apos;t match</p>
        )}
        {confirmPw && confirmPw === password && password.length >= 8 && (
          <p className="mt-1 text-[11px] text-[#00E676] flex items-center gap-1">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
            Passwords match
          </p>
        )}
      </div>

      {/* Country + Role row */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Country</label>
          <select
            value={country}
            onChange={(e) => setCountry(e.target.value)}
            className="w-full rounded-xl border border-white/10 bg-white/[0.05] px-3 py-2.5 text-sm text-white transition-all focus:border-[#00E676]/50 focus:outline-none appearance-none"
          >
            {COUNTRIES.map((c) => (
              <option key={c} value={c} className="bg-[#0B1F17] text-white">{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label className="block text-xs font-semibold text-white/60 mb-1.5 uppercase tracking-wider">Role</label>
          <div className="flex gap-1.5">
            {ROLES.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => setRole(r === role ? "" : r)}
                className={`flex-1 rounded-lg border px-1 py-2 text-[10px] font-bold transition-all ${
                  role === r
                    ? "border-[#00E676] bg-[#00E676]/10 text-[#00E676]"
                    : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Terms */}
      <label className="flex items-start gap-2.5 cursor-pointer group">
        <div className="relative mt-0.5">
          <input
            type="checkbox"
            checked={agree}
            onChange={() => setAgree(!agree)}
            className="sr-only peer"
          />
          <div className="h-4 w-4 rounded border border-white/20 bg-white/[0.05] transition-all peer-checked:border-[#00E676] peer-checked:bg-[#00E676] flex items-center justify-center">
            {agree && (
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#06120C" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            )}
          </div>
        </div>
        <span className="text-[11px] text-white/40 leading-relaxed group-hover:text-white/60 transition">
          I agree to the <span className="text-[#00E676]/70 underline cursor-pointer">Terms of Service</span> and <span className="text-[#00E676]/70 underline cursor-pointer">Privacy Policy</span>
        </span>
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
            Creating account…
          </>
        ) : (
          "Create Account"
        )}
      </button>

      <SocialButtons mode="signup" />
    </form>
  );
}
