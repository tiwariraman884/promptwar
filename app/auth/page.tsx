"use client";

import { useState } from "react";
import AuthHero from "@/components/auth/AuthHero";
import SignInForm from "@/components/auth/SignInForm";
import SignUpForm from "@/components/auth/SignUpForm";
import Logo from "@/components/Logo";

type Tab = "signin" | "signup";

export default function AuthPage() {
  const [tab, setTab] = useState<Tab>("signin");

  return (
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#04100a]">
      {/* Left — Hero (hidden on mobile) */}
      <AuthHero />

      {/* Right — Auth Card */}
      <div className="relative flex items-center justify-center px-5 py-10 sm:px-8 overflow-hidden">
        {/* Subtle animated background glow */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[500px] h-[500px] rounded-full bg-[#00E676]/[0.03] blur-[100px] auth-glow-pulse" />
          <div className="absolute bottom-0 left-0 w-[300px] h-[300px] rounded-full bg-[#00C853]/[0.02] blur-[80px]" />
        </div>

        <div className="relative z-10 w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden auth-form-entrance" style={{ animationDelay: "0s" }}>
            <Logo size="lg" variant="full" />
          </div>

          {/* Glassmorphism Card */}
          <div className="auth-form-entrance auth-card-glow rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl px-7 py-8 sm:px-9 sm:py-10 shadow-2xl shadow-black/40" style={{ animationDelay: "0.1s" }}>
            {/* Tab switcher */}
            <div role="tablist" className="relative flex rounded-xl bg-white/[0.05] p-1 mb-7">
              {/* Sliding indicator */}
              <div
                className="absolute top-1 bottom-1 rounded-lg bg-gradient-to-r from-[#00E676] to-[#00C853] shadow-lg shadow-[#00E676]/20 transition-all duration-500 ease-[cubic-bezier(0.34,1.56,0.64,1)]"
                style={{
                  left: tab === "signin" ? "4px" : "calc(50% + 0px)",
                  width: "calc(50% - 4px)",
                }}
              />
              <button
                type="button"
                role="tab"
                aria-selected={tab === "signin"}
                tabIndex={tab === "signin" ? 0 : -1}
                onClick={() => setTab("signin")}
                className={`relative z-10 flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E676] ${
                  tab === "signin"
                    ? "text-[#06120C]"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                Sign In
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={tab === "signup"}
                tabIndex={tab === "signup" ? 0 : -1}
                onClick={() => setTab("signup")}
                className={`relative z-10 flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E676] ${
                  tab === "signup"
                    ? "text-[#06120C]"
                    : "text-white/60 hover:text-white/80"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form with crossfade */}
            <div key={tab} className="auth-form-content-enter">
              {tab === "signin" ? <SignInForm /> : <SignUpForm />}
            </div>
          </div>

          {/* Bottom text */}
          <p className="auth-form-entrance mt-6 text-center text-xs text-white/40 flex items-center justify-center gap-1.5" style={{ animationDelay: "0.3s" }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-[#00E676]/50">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
              <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
            </svg>
            Protected by enterprise-grade encryption
          </p>
        </div>
      </div>
    </div>
  );
}
