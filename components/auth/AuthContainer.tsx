"use client";

import { useState } from "react";
import dynamic from "next/dynamic";
import { Skeleton } from "@/components/ui/skeleton";

type Tab = "signin" | "signup";

// Dynamically load sign-in and sign-up forms to split code out of initial bundle
const SignInForm = dynamic(() => import("@/components/auth/SignInForm"), {
  ssr: false,
  loading: () => <div className="h-[280px] w-full animate-pulse bg-white/5 rounded-2xl" />,
});

const SignUpForm = dynamic(() => import("@/components/auth/SignUpForm"), {
  ssr: false,
  loading: () => <div className="h-[360px] w-full animate-pulse bg-white/5 rounded-2xl" />,
});

export default function AuthContainer() {
  const [tab, setTab] = useState<Tab>("signin");

  return (
    <div
      className="auth-form-entrance auth-card-glow rounded-3xl border border-white/[0.08] bg-white/[0.03] backdrop-blur-2xl px-7 py-8 sm:px-9 sm:py-10 shadow-2xl shadow-black/40"
      style={{ animationDelay: "0.1s" }}
    >
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
            tab === "signin" ? "text-[#06120C]" : "text-white/60 hover:text-white/80"
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
            tab === "signup" ? "text-[#06120C]" : "text-white/60 hover:text-white/80"
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
  );
}
