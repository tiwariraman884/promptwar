"use client";

import { useEffect, useState } from "react";
import Logo from "@/components/Logo";

const STATS = [
  { emoji: "🌍", value: "25,000+", label: "Carbon Entries Logged" },
  { emoji: "🌱", value: "10,000+", label: "Trees Sponsored" },
  { emoji: "🏆", value: "50,000+", label: "Eco Challenges Completed" },
];

const TESTIMONIALS = [
  {
    quote: "GreenStep transformed how I think about my daily impact. Down 40% in 3 months!",
    name: "Priya Sharma",
    role: "Mumbai, India",
  },
  {
    quote: "The community challenges keep me motivated. Best eco-app I've used.",
    name: "Arjun Patel",
    role: "Bengaluru, India",
  },
  {
    quote: "Finally, a carbon tracker designed for Indian lifestyles. The AI coach is incredible.",
    name: "Deepa Nair",
    role: "Delhi, India",
  },
];

/* Floating eco icons */
function FloatingIcon({ emoji, delay, x, y, size }: { emoji: string; delay: number; x: number; y: number; size: number }) {
  return (
    <div
      className="absolute pointer-events-none select-none animate-float"
      style={{
        left: `${x}%`,
        top: `${y}%`,
        fontSize: `${size}px`,
        animationDelay: `${delay}s`,
        opacity: 0.15,
      }}
    >
      {emoji}
    </div>
  );
}

export default function AuthHero() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const t = TESTIMONIALS[testimonialIdx];

  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#06120C] via-[#0B1F17] to-[#0d2b1e] p-10 xl:p-14">
      {/* Animated gradient overlay */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(0,230,118,0.08)_0%,transparent_70%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_80%,rgba(0,200,83,0.06)_0%,transparent_60%)]" />

      {/* Floating eco icons */}
      <FloatingIcon emoji="🍃" delay={0} x={10} y={15} size={28} />
      <FloatingIcon emoji="🌍" delay={1.5} x={75} y={8} size={32} />
      <FloatingIcon emoji="⚡" delay={3} x={85} y={55} size={24} />
      <FloatingIcon emoji="💧" delay={2} x={15} y={70} size={22} />
      <FloatingIcon emoji="🌿" delay={4} x={65} y={80} size={26} />
      <FloatingIcon emoji="☀️" delay={0.5} x={45} y={12} size={20} />
      <FloatingIcon emoji="♻️" delay={3.5} x={30} y={85} size={24} />

      {/* Top: Logo + Tagline */}
      <div className="relative z-10">
        <Logo size="lg" variant="full" />
        <h2 className="mt-8 text-3xl font-extrabold leading-tight text-white xl:text-4xl">
          Track Your Carbon
          <br />
          Footprint.{" "}
          <span className="bg-gradient-to-r from-[#00E676] to-[#00C853] bg-clip-text text-transparent">
            Build a Sustainable Future.
          </span>
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
          Join thousands of conscious Indians measuring, reducing, and offsetting their environmental impact every day.
        </p>
      </div>

      {/* Middle: Stats */}
      <div className="relative z-10 mt-10 grid grid-cols-3 gap-3">
        {STATS.map((s) => (
          <div
            key={s.label}
            className="rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 backdrop-blur-sm"
          >
            <span className="text-lg">{s.emoji}</span>
            <p className="mt-1 text-xl font-extrabold text-white">{s.value}</p>
            <p className="mt-0.5 text-[11px] font-medium text-white/40 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bottom: Testimonials */}
      <div className="relative z-10 mt-10">
        <div className="rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm min-h-[120px]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#00E676]/30 mb-2">
            <path d="M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7c0 2.21-1.79 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M20 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7c0 2.21-1.79 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <p className="text-sm text-white/70 leading-relaxed italic">
            &ldquo;{t.quote}&rdquo;
          </p>
          <div className="mt-3 flex items-center gap-2">
            <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00E676] to-[#00C853] flex items-center justify-center text-xs font-bold text-[#06120C]">
              {t.name.split(" ").map((n) => n[0]).join("")}
            </div>
            <div>
              <p className="text-xs font-bold text-white">{t.name}</p>
              <p className="text-[10px] text-white/40">{t.role}</p>
            </div>
          </div>
        </div>
        {/* Dots */}
        <div className="mt-3 flex justify-center gap-1.5">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setTestimonialIdx(i)}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === testimonialIdx ? "w-6 bg-[#00E676]" : "w-1.5 bg-white/20"
              }`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
