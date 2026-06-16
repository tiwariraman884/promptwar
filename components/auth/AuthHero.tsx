"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import Logo from "@/components/Logo";

const STATS = [
  { icon: "🌍", value: "25,000+", label: "Carbon Entries Logged" },
  { icon: "🌱", value: "10,000+", label: "Trees Sponsored" },
  { icon: "🏆", value: "50,000+", label: "Eco Challenges Completed" },
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

/* ────────────────────────────────────────────────── */
/*  Canvas-based organic particle ecosystem           */
/* ────────────────────────────────────────────────── */

interface Leaf {
  x: number;
  y: number;
  size: number;
  rotation: number;
  rotSpeed: number;
  speed: number;
  drift: number;
  driftSpeed: number;
  driftPhase: number;
  opacity: number;
  hue: number; // 90-160 green spectrum
  type: number; // 0-2 leaf shape variants
}

interface Firefly {
  x: number;
  y: number;
  size: number;
  speed: number;
  phase: number;
  phaseSpeed: number;
  opacity: number;
  drift: number;
}

function createLeaf(canvasW: number, canvasH: number, fromTop = false): Leaf {
  return {
    x: Math.random() * canvasW,
    y: fromTop ? -20 : Math.random() * canvasH,
    size: 8 + Math.random() * 14,
    rotation: Math.random() * Math.PI * 2,
    rotSpeed: (Math.random() - 0.5) * 0.02,
    speed: 0.3 + Math.random() * 0.6,
    drift: 0,
    driftSpeed: 0.5 + Math.random() * 1.5,
    driftPhase: Math.random() * Math.PI * 2,
    opacity: 0.15 + Math.random() * 0.25,
    hue: 90 + Math.random() * 70,
    type: Math.floor(Math.random() * 3),
  };
}

function createFirefly(canvasW: number, canvasH: number): Firefly {
  return {
    x: Math.random() * canvasW,
    y: canvasH + Math.random() * 40,
    size: 1.5 + Math.random() * 2.5,
    speed: 0.2 + Math.random() * 0.5,
    phase: Math.random() * Math.PI * 2,
    phaseSpeed: 0.02 + Math.random() * 0.03,
    opacity: 0,
    drift: (Math.random() - 0.5) * 0.4,
  };
}

function drawLeaf(ctx: CanvasRenderingContext2D, leaf: Leaf) {
  ctx.save();
  ctx.translate(leaf.x, leaf.y);
  ctx.rotate(leaf.rotation);
  ctx.globalAlpha = leaf.opacity;

  const s = leaf.size;
  ctx.fillStyle = `hsla(${leaf.hue}, 65%, 35%, 1)`;
  ctx.strokeStyle = `hsla(${leaf.hue}, 70%, 25%, 0.6)`;
  ctx.lineWidth = 0.5;

  ctx.beginPath();
  if (leaf.type === 0) {
    // Oval leaf
    ctx.ellipse(0, 0, s * 0.35, s * 0.65, 0, 0, Math.PI * 2);
  } else if (leaf.type === 1) {
    // Pointed leaf
    ctx.moveTo(0, -s * 0.7);
    ctx.bezierCurveTo(s * 0.4, -s * 0.3, s * 0.35, s * 0.3, 0, s * 0.7);
    ctx.bezierCurveTo(-s * 0.35, s * 0.3, -s * 0.4, -s * 0.3, 0, -s * 0.7);
  } else {
    // Round leaf
    ctx.moveTo(0, -s * 0.5);
    ctx.bezierCurveTo(s * 0.5, -s * 0.5, s * 0.5, s * 0.3, 0, s * 0.5);
    ctx.bezierCurveTo(-s * 0.5, s * 0.3, -s * 0.5, -s * 0.5, 0, -s * 0.5);
  }
  ctx.fill();
  ctx.stroke();

  // Vein
  ctx.beginPath();
  ctx.strokeStyle = `hsla(${leaf.hue}, 50%, 45%, 0.4)`;
  ctx.lineWidth = 0.4;
  ctx.moveTo(0, -s * 0.5);
  ctx.lineTo(0, s * 0.5);
  ctx.stroke();

  ctx.restore();
}

function CanvasEcosystem() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef<number>(0);
  const leavesRef = useRef<Leaf[]>([]);
  const firefliesRef = useRef<Firefly[]>([]);
  const timeRef = useRef(0);

  const animate = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const w = canvas.width;
    const h = canvas.height;
    timeRef.current += 1;

    ctx.clearRect(0, 0, w, h);

    // Update & draw leaves
    for (let i = leavesRef.current.length - 1; i >= 0; i--) {
      const leaf = leavesRef.current[i];
      leaf.y += leaf.speed;
      leaf.driftPhase += 0.01;
      leaf.drift = Math.sin(leaf.driftPhase * leaf.driftSpeed) * 1.2;
      leaf.x += leaf.drift;
      leaf.rotation += leaf.rotSpeed;

      if (leaf.y > h + 30 || leaf.x < -30 || leaf.x > w + 30) {
        leavesRef.current[i] = createLeaf(w, h, true);
      }

      drawLeaf(ctx, leaf);
    }

    // Update & draw fireflies
    for (let i = firefliesRef.current.length - 1; i >= 0; i--) {
      const ff = firefliesRef.current[i];
      ff.y -= ff.speed;
      ff.x += ff.drift + Math.sin(ff.phase) * 0.3;
      ff.phase += ff.phaseSpeed;
      ff.opacity = 0.3 + Math.sin(ff.phase) * 0.3;

      if (ff.y < -20) {
        firefliesRef.current[i] = createFirefly(w, h);
      }

      ctx.save();
      ctx.globalAlpha = ff.opacity;
      const grad = ctx.createRadialGradient(ff.x, ff.y, 0, ff.x, ff.y, ff.size * 3);
      grad.addColorStop(0, "rgba(0, 230, 118, 0.8)");
      grad.addColorStop(0.5, "rgba(0, 200, 83, 0.3)");
      grad.addColorStop(1, "rgba(0, 200, 83, 0)");
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, ff.size * 3, 0, Math.PI * 2);
      ctx.fill();

      // Core dot
      ctx.fillStyle = "rgba(200, 255, 220, 0.9)";
      ctx.beginPath();
      ctx.arc(ff.x, ff.y, ff.size * 0.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }

    animRef.current = requestAnimationFrame(animate);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resize = () => {
      const rect = canvas.parentElement?.getBoundingClientRect();
      if (!rect) return;
      canvas.width = rect.width * window.devicePixelRatio;
      canvas.height = rect.height * window.devicePixelRatio;
      canvas.style.width = `${rect.width}px`;
      canvas.style.height = `${rect.height}px`;
      const ctx = canvas.getContext("2d");
      if (ctx) ctx.scale(window.devicePixelRatio, window.devicePixelRatio);

      // Re-init particles on resize
      const w = rect.width;
      const h = rect.height;
      leavesRef.current = Array.from({ length: 18 }, () => createLeaf(w, h));
      firefliesRef.current = Array.from({ length: 25 }, () => {
        const ff = createFirefly(w, h);
        ff.y = Math.random() * h; // Spread initially
        return ff;
      });
    };

    resize();
    window.addEventListener("resize", resize);
    animRef.current = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animRef.current);
    };
  }, [animate]);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 pointer-events-none"
      style={{ zIndex: 1 }}
    />
  );
}

/* ────────────────────────────────────────────────── */
/*  Animated growing tree SVG                         */
/* ────────────────────────────────────────────────── */
function GrowingTree() {
  return (
    <div className="auth-tree-container absolute bottom-0 left-1/2 -translate-x-1/2 w-[340px] h-[300px] pointer-events-none" style={{ zIndex: 2 }}>
      <svg viewBox="0 0 340 300" fill="none" className="w-full h-full">
        {/* Trunk */}
        <path
          d="M170 300 L170 180 Q165 160 155 145 Q170 150 170 150 Q170 150 185 145 Q175 160 170 180"
          fill="url(#trunkGrad)"
          className="auth-tree-trunk"
        />
        {/* Branches */}
        <path d="M170 180 Q140 160 120 140" stroke="hsl(30, 40%, 25%)" strokeWidth="3" fill="none" className="auth-tree-branch auth-tree-branch-1" />
        <path d="M170 180 Q200 155 220 135" stroke="hsl(30, 40%, 25%)" strokeWidth="3" fill="none" className="auth-tree-branch auth-tree-branch-2" />
        <path d="M170 160 Q130 130 110 110" stroke="hsl(30, 40%, 25%)" strokeWidth="2.5" fill="none" className="auth-tree-branch auth-tree-branch-3" />
        <path d="M170 160 Q210 125 235 110" stroke="hsl(30, 40%, 25%)" strokeWidth="2.5" fill="none" className="auth-tree-branch auth-tree-branch-4" />

        {/* Leaf clusters (canopy) */}
        <ellipse cx="120" cy="120" rx="40" ry="35" fill="url(#leafGrad1)" className="auth-tree-canopy auth-tree-canopy-1" />
        <ellipse cx="170" cy="90"  rx="50" ry="40" fill="url(#leafGrad2)" className="auth-tree-canopy auth-tree-canopy-2" />
        <ellipse cx="220" cy="115" rx="42" ry="35" fill="url(#leafGrad1)" className="auth-tree-canopy auth-tree-canopy-3" />
        <ellipse cx="145" cy="75"  rx="35" ry="30" fill="url(#leafGrad3)" className="auth-tree-canopy auth-tree-canopy-4" />
        <ellipse cx="195" cy="70"  rx="38" ry="32" fill="url(#leafGrad3)" className="auth-tree-canopy auth-tree-canopy-5" />
        <ellipse cx="170" cy="55"  rx="30" ry="25" fill="url(#leafGrad2)" className="auth-tree-canopy auth-tree-canopy-6" />

        {/* Ground shadow */}
        <ellipse cx="170" cy="298" rx="60" ry="6" fill="rgba(0,0,0,0.25)" className="auth-tree-shadow" />

        <defs>
          <linearGradient id="trunkGrad" x1="170" y1="300" x2="170" y2="140">
            <stop offset="0%" stopColor="hsl(30, 35%, 20%)" />
            <stop offset="100%" stopColor="hsl(30, 40%, 30%)" />
          </linearGradient>
          <radialGradient id="leafGrad1">
            <stop offset="0%" stopColor="hsla(140, 60%, 32%, 0.85)" />
            <stop offset="100%" stopColor="hsla(140, 60%, 22%, 0.3)" />
          </radialGradient>
          <radialGradient id="leafGrad2">
            <stop offset="0%" stopColor="hsla(150, 65%, 38%, 0.9)" />
            <stop offset="100%" stopColor="hsla(150, 65%, 25%, 0.3)" />
          </radialGradient>
          <radialGradient id="leafGrad3">
            <stop offset="0%" stopColor="hsla(130, 55%, 35%, 0.8)" />
            <stop offset="100%" stopColor="hsla(130, 55%, 20%, 0.25)" />
          </radialGradient>
        </defs>
      </svg>
    </div>
  );
}

/* ────────────────────────────────────────────────── */
/*  Main AuthHero component                           */
/* ────────────────────────────────────────────────── */
export default function AuthHero() {
  const [testimonialIdx, setTestimonialIdx] = useState(0);
  const [fadeClass, setFadeClass] = useState("auth-testimonial-enter");

  useEffect(() => {
    const timer = setInterval(() => {
      setFadeClass("auth-testimonial-exit");
      setTimeout(() => {
        setTestimonialIdx((i) => (i + 1) % TESTIMONIALS.length);
        setFadeClass("auth-testimonial-enter");
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  const t = TESTIMONIALS[testimonialIdx];

  return (
    <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-gradient-to-br from-[#04100a] via-[#0B1F17] to-[#0a2418] p-10 xl:p-14">
      {/* Layered gradient overlays */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_20%_50%,rgba(0,230,118,0.06)_0%,transparent_70%)] auth-glow-pulse" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_80%_20%,rgba(0,200,83,0.05)_0%,transparent_55%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_50%_90%,rgba(0,180,80,0.08)_0%,transparent_50%)]" />

      {/* Canvas particle system */}
      <CanvasEcosystem />

      {/* Growing tree */}
      <GrowingTree />

      {/* Top: Logo + Tagline */}
      <div className="relative z-10 auth-hero-entrance" style={{ animationDelay: "0.1s" }}>
        <Logo size="lg" variant="full" />
        <h2 className="mt-8 text-3xl font-extrabold leading-tight text-white xl:text-4xl">
          Track Your Carbon
          <br />
          Footprint.{" "}
          <span className="auth-gradient-text">
            Build a Sustainable Future.
          </span>
        </h2>
        <p className="mt-4 max-w-md text-sm leading-relaxed text-white/50">
          Join thousands of conscious Indians measuring, reducing, and offsetting their environmental impact every day.
        </p>
      </div>

      {/* Middle: Stats */}
      <div className="relative z-10 mt-10 grid grid-cols-3 gap-3">
        {STATS.map((s, i) => (
          <div
            key={s.label}
            className="auth-stat-card auth-hero-entrance rounded-2xl border border-white/[0.06] bg-white/[0.03] px-4 py-4 backdrop-blur-sm"
            style={{ animationDelay: `${0.3 + i * 0.15}s` }}
          >
            <span className="text-lg">{s.icon}</span>
            <p className="mt-1 text-xl font-extrabold text-white">{s.value}</p>
            <p className="mt-0.5 text-[11px] font-medium text-white/70 leading-tight">{s.label}</p>
          </div>
        ))}
      </div>

      {/* Bottom: Testimonials */}
      <div className="relative z-10 mt-10 auth-hero-entrance" style={{ animationDelay: "0.8s" }}>
        <div className="auth-testimonial-card rounded-2xl border border-white/[0.06] bg-white/[0.03] p-5 backdrop-blur-sm min-h-[120px]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="text-[#00E676]/30 mb-2">
            <path d="M10 11H6a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7c0 2.21-1.79 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
            <path d="M20 11h-4a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v7c0 2.21-1.79 4-4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
          </svg>
          <div className={fadeClass}>
            <p className="text-sm text-white/70 leading-relaxed italic">
              &ldquo;{t.quote}&rdquo;
            </p>
            <div className="mt-3 flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-gradient-to-br from-[#00E676] to-[#00C853] flex items-center justify-center text-xs font-bold text-[#06120C]">
                {t.name.split(" ").map((n) => n[0]).join("")}
              </div>
              <div>
                <p className="text-xs font-bold text-white">{t.name}</p>
                <p className="text-[10px] text-white/70">{t.role}</p>
              </div>
            </div>
          </div>
        </div>
        {/* Dots */}
        <div className="mt-3 flex justify-center gap-1.5">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              type="button"
              onClick={() => {
                setFadeClass("auth-testimonial-exit");
                setTimeout(() => {
                  setTestimonialIdx(i);
                  setFadeClass("auth-testimonial-enter");
                }, 300);
              }}
              className={`h-1.5 rounded-full transition-all duration-300 ${
                i === testimonialIdx ? "w-6 bg-[#00E676]" : "w-1.5 bg-white/20 hover:bg-white/40"
              }`}
              aria-label={`Testimonial ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
