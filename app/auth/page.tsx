import dynamic from "next/dynamic";
import AuthContainer from "@/components/auth/AuthContainer";
import Logo from "@/components/Logo";

// Load AuthHero dynamically with no SSR. It contains canvas/testimonial slider
// and is hidden on mobile, so we avoid downloading and running this JS on mobile devices.
const AuthHero = dynamic(() => import("@/components/auth/AuthHero"), {
  ssr: false,
  loading: () => <div className="hidden lg:block animate-pulse bg-gradient-to-br from-[#04100a] to-[#0a2418] h-full" />,
});

export default function AuthPage() {
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

          {/* Interactive forms wrapper */}
          <AuthContainer />

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
