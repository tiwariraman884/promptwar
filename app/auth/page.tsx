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
    <div className="min-h-screen grid lg:grid-cols-2 bg-[#06120C]">
      {/* Left — Hero (hidden on mobile) */}
      <AuthHero />

      {/* Right — Auth Card */}
      <div className="flex items-center justify-center px-5 py-10 sm:px-8">
        <div className="w-full max-w-[440px]">
          {/* Mobile logo */}
          <div className="flex justify-center mb-8 lg:hidden">
            <Logo size="lg" variant="full" />
          </div>

          {/* Glassmorphism Card */}
          <div className="rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl px-7 py-8 sm:px-9 sm:py-10 shadow-2xl shadow-black/40">
            {/* Tab switcher */}
            <div role="tablist" className="flex rounded-xl bg-white/[0.05] p-1 mb-7">
              <button
                type="button"
                role="tab"
                aria-selected={tab === "signin"}
                tabIndex={tab === "signin" ? 0 : -1}
                onClick={() => setTab("signin")}
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E676] ${
                  tab === "signin"
                    ? "bg-gradient-to-r from-[#00E676] to-[#00C853] text-[#06120C] shadow-lg shadow-[#00E676]/20"
                    : "text-white/75 hover:text-white/85"
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
                className={`flex-1 rounded-lg py-2.5 text-sm font-bold transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#00E676] ${
                  tab === "signup"
                    ? "bg-gradient-to-r from-[#00E676] to-[#00C853] text-[#06120C] shadow-lg shadow-[#00E676]/20"
                    : "text-white/75 hover:text-white/85"
                }`}
              >
                Create Account
              </button>
            </div>

            {/* Form */}
            {tab === "signin" ? <SignInForm /> : <SignUpForm />}
          </div>

          {/* Bottom text */}
          <p className="mt-6 text-center text-xs text-white/50">
            Protected by enterprise-grade encryption 🔒
          </p>
        </div>
      </div>
    </div>
  );
}
