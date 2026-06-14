"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─────────────── City Coordinates ─────────────── */
const CITY_COORDS: Record<string, { lat: number; lng: number }> = {
  Haridwar:   { lat: 29.95, lng: 78.16 },
  Dehradun:   { lat: 30.32, lng: 78.03 },
  Rishikesh:  { lat: 30.09, lng: 78.27 },
  Roorkee:    { lat: 29.87, lng: 77.89 },
  Delhi:      { lat: 28.61, lng: 77.21 },
  Mumbai:     { lat: 19.08, lng: 72.88 },
  Bengaluru:  { lat: 12.97, lng: 77.59 },
  Pune:       { lat: 18.52, lng: 73.86 },
  Jaipur:     { lat: 26.91, lng: 75.79 },
  Lucknow:    { lat: 26.85, lng: 80.95 },
  Hyderabad:  { lat: 17.39, lng: 78.49 },
};

/* Default center: roughly India's center */
const INDIA_CENTER = { lat: 22.0, lng: 78.5 };

/* ─────────────── Math helpers ─────────────── */
function degToRad(d: number) { return (d * Math.PI) / 180; }

function latLngToSphere(lat: number, lng: number, radius: number, rotY: number) {
  const phi = degToRad(90 - lat);
  const theta = degToRad(lng) + rotY;
  return {
    x: radius * Math.sin(phi) * Math.cos(theta),
    y: -radius * Math.cos(phi),
    z: radius * Math.sin(phi) * Math.sin(theta),
  };
}

/* ─────────────── Continent outlines (simplified polygons for India region) ─────────────── */
const INDIA_OUTLINE: Array<[number, number]> = [
  [8.08, 77.55], [8.3, 73.95], [10.0, 76.27], [11.75, 75.49],
  [12.97, 74.79], [14.7, 74.1], [15.4, 73.91], [17.2, 73.1],
  [18.96, 72.82], [20.2, 72.7], [21.1, 72.14], [22.5, 69.0],
  [23.7, 68.4], [24.6, 68.8], [25.4, 70.3], [26.1, 70.8],
  [28.5, 70.2], [30.4, 71.1], [32.0, 74.4], [33.9, 75.3],
  [35.5, 77.8], [34.0, 78.6], [32.7, 79.0], [30.4, 80.1],
  [28.6, 83.3], [27.5, 84.6], [26.6, 85.8], [26.0, 87.0],
  [25.3, 88.4], [24.5, 89.0], [22.0, 90.4], [21.9, 89.1],
  [22.5, 88.0], [21.5, 87.0], [20.0, 86.7], [18.3, 83.9],
  [15.5, 80.2], [13.7, 80.3], [11.0, 79.8], [8.08, 77.55],
];

const SRI_LANKA: Array<[number, number]> = [
  [9.8, 80.2], [8.0, 81.8], [6.0, 80.7], [6.9, 79.7], [9.8, 80.2],
];

/* ─────────────── Canvas Globe renderer ─────────────── */

interface GlobeProps {
  selectedCity: string;
}

export default function EarthGlobe({ selectedCity }: GlobeProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [canvasReady, setCanvasReady] = useState(false);

  // Animation state refs (avoid re-renders)
  const rotYRef = useRef(degToRad(-78.5)); // Start centered on India
  const targetRotYRef = useRef(degToRad(-78.5));
  const animFrameRef = useRef<number>(0);
  const sizeRef = useRef(300);

  // When city changes, update target rotation
  useEffect(() => {
    const coords = CITY_COORDS[selectedCity] || INDIA_CENTER;
    targetRotYRef.current = degToRad(-coords.lng);
  }, [selectedCity]);

  const drawGlobe = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const S = sizeRef.current;
    const R = S * 0.38;      // globe radius
    const cx = S / 2;
    const cy = S / 2;

    // Smooth rotation towards target
    const diff = targetRotYRef.current - rotYRef.current;
    const autoSpin = 0.001; // slow auto-rotation
    if (Math.abs(diff) > 0.002) {
      rotYRef.current += diff * 0.04;
    } else {
      rotYRef.current += autoSpin;
      targetRotYRef.current += autoSpin;
    }
    const rotY = rotYRef.current;

    ctx.clearRect(0, 0, S, S);

    /* ── Atmospheric glow ── */
    const glowGrad = ctx.createRadialGradient(cx, cy, R * 0.85, cx, cy, R * 1.35);
    glowGrad.addColorStop(0, "rgba(82, 183, 136, 0.12)");
    glowGrad.addColorStop(0.5, "rgba(82, 183, 136, 0.06)");
    glowGrad.addColorStop(1, "rgba(82, 183, 136, 0)");
    ctx.beginPath();
    ctx.arc(cx, cy, R * 1.35, 0, Math.PI * 2);
    ctx.fillStyle = glowGrad;
    ctx.fill();

    /* ── Globe body ── */
    const bodyGrad = ctx.createRadialGradient(cx - R * 0.3, cy - R * 0.3, R * 0.1, cx, cy, R);
    bodyGrad.addColorStop(0, "#1a3a2a");
    bodyGrad.addColorStop(0.6, "#0d1f1a");
    bodyGrad.addColorStop(1, "#071310");
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = bodyGrad;
    ctx.fill();

    /* ── Grid lines (meridians + parallels) ── */
    ctx.strokeStyle = "rgba(82, 183, 136, 0.08)";
    ctx.lineWidth = 0.5;

    // Parallels
    for (let lat = -60; lat <= 60; lat += 30) {
      const points: Array<{ x: number; y: number; z: number }> = [];
      for (let lng = 0; lng <= 360; lng += 5) {
        points.push(latLngToSphere(lat, lng, R, rotY));
      }
      ctx.beginPath();
      let started = false;
      for (const p of points) {
        if (p.z > 0) {
          if (!started) { ctx.moveTo(cx + p.x, cy + p.y); started = true; }
          else ctx.lineTo(cx + p.x, cy + p.y);
        } else { started = false; }
      }
      ctx.stroke();
    }

    // Meridians
    for (let lng = 0; lng < 360; lng += 30) {
      const points: Array<{ x: number; y: number; z: number }> = [];
      for (let lat = -90; lat <= 90; lat += 5) {
        points.push(latLngToSphere(lat, lng, R, rotY));
      }
      ctx.beginPath();
      let started = false;
      for (const p of points) {
        if (p.z > 0) {
          if (!started) { ctx.moveTo(cx + p.x, cy + p.y); started = true; }
          else ctx.lineTo(cx + p.x, cy + p.y);
        } else { started = false; }
      }
      ctx.stroke();
    }

    /* ── Draw land masses ── */
    function drawLandmass(c: CanvasRenderingContext2D, outline: Array<[number, number]>, color: string) {
      const projected = outline.map(([lat, lng]) => {
        const p = latLngToSphere(lat, lng, R, rotY);
        return { sx: cx + p.x, sy: cy + p.y, z: p.z };
      });

      const visible = projected.filter((p) => p.z > 0);
      if (visible.length < 3) return;

      c.beginPath();
      let started = false;
      for (const p of projected) {
        if (p.z > 0) {
          if (!started) { c.moveTo(p.sx, p.sy); started = true; }
          else c.lineTo(p.sx, p.sy);
        }
      }
      c.closePath();
      c.fillStyle = color;
      c.fill();
      c.strokeStyle = "rgba(82, 183, 136, 0.25)";
      c.lineWidth = 1;
      c.stroke();
    }

    drawLandmass(ctx, INDIA_OUTLINE, "rgba(45, 106, 79, 0.55)");
    drawLandmass(ctx, SRI_LANKA, "rgba(45, 106, 79, 0.4)");

    /* ── Draw all city dots ── */
    for (const [name, coords] of Object.entries(CITY_COORDS)) {
      const p = latLngToSphere(coords.lat, coords.lng, R, rotY);
      if (p.z <= 0) continue; // behind the globe

      const isSelected = name === selectedCity;
      const dotR = isSelected ? 4.5 : 2;
      const alpha = Math.max(0.2, Math.min(1, (p.z / R) * 1.5));

      if (!isSelected) {
        ctx.beginPath();
        ctx.arc(cx + p.x, cy + p.y, dotR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(82, 183, 136, ${alpha * 0.5})`;
        ctx.fill();
      }
    }

    /* ── Selected city: glowing pin ── */
    if (selectedCity && CITY_COORDS[selectedCity]) {
      const coords = CITY_COORDS[selectedCity];
      const p = latLngToSphere(coords.lat, coords.lng, R, rotY);

      if (p.z > 0) {
        const px = cx + p.x;
        const py = cy + p.y;
        const t = Date.now() / 1000;
        const pulseR = 8 + Math.sin(t * 3) * 4;

        // Outer pulse ring
        ctx.beginPath();
        ctx.arc(px, py, pulseR, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 200, 150, ${0.15 + Math.sin(t * 3) * 0.08})`;
        ctx.fill();

        // Mid ring
        ctx.beginPath();
        ctx.arc(px, py, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 200, 150, 0.3)";
        ctx.fill();

        // Core dot
        ctx.beginPath();
        ctx.arc(px, py, 3.5, 0, Math.PI * 2);
        ctx.fillStyle = "#00C896";
        ctx.fill();

        // Pin line
        ctx.beginPath();
        ctx.moveTo(px, py);
        ctx.lineTo(px, py - 22);
        ctx.strokeStyle = "rgba(0, 200, 150, 0.6)";
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // Pin head
        ctx.beginPath();
        ctx.arc(px, py - 22, 4, 0, Math.PI * 2);
        ctx.fillStyle = "#00C896";
        ctx.fill();
        ctx.beginPath();
        ctx.arc(px, py - 22, 6, 0, Math.PI * 2);
        ctx.fillStyle = "rgba(0, 200, 150, 0.2)";
        ctx.fill();
      }
    }

    /* ── Limb highlight (edge glow) ── */
    const limbGrad = ctx.createRadialGradient(cx, cy, R * 0.92, cx, cy, R);
    limbGrad.addColorStop(0, "rgba(82, 183, 136, 0)");
    limbGrad.addColorStop(1, "rgba(82, 183, 136, 0.12)");
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = limbGrad;
    ctx.fill();

    /* ── Specular highlight ── */
    const specGrad = ctx.createRadialGradient(cx - R * 0.35, cy - R * 0.35, 0, cx - R * 0.35, cy - R * 0.35, R * 0.7);
    specGrad.addColorStop(0, "rgba(255,255,255,0.06)");
    specGrad.addColorStop(1, "rgba(255,255,255,0)");
    ctx.beginPath();
    ctx.arc(cx, cy, R, 0, Math.PI * 2);
    ctx.fillStyle = specGrad;
    ctx.fill();

    animFrameRef.current = requestAnimationFrame(drawGlobe);
  }, [selectedCity]);

  // Setup canvas + start animation
  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    function resize() {
      const rect = container!.getBoundingClientRect();
      const s = Math.min(rect.width, rect.height, 420);
      const dpr = window.devicePixelRatio || 1;
      sizeRef.current = s;
      canvas!.width = s * dpr;
      canvas!.height = s * dpr;
      canvas!.style.width = `${s}px`;
      canvas!.style.height = `${s}px`;
      const ctx = canvas!.getContext("2d");
      if (ctx) ctx.scale(dpr, dpr);
    }

    resize();
    setCanvasReady(true);
    window.addEventListener("resize", resize);

    animFrameRef.current = requestAnimationFrame(drawGlobe);

    return () => {
      window.removeEventListener("resize", resize);
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [drawGlobe]);

  const coords = CITY_COORDS[selectedCity];
  const p = coords ? latLngToSphere(coords.lat, coords.lng, sizeRef.current * 0.38, rotYRef.current) : null;

  return (
    <div
      ref={containerRef}
      className="relative flex min-h-44 items-center justify-center overflow-hidden rounded-card bg-[#0d1f1a] p-4"
    >
      {/* Ambient bg particles */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#52B788]/5 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#2D6A4F]/8 blur-3xl" />
        <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-60 w-60 rounded-full bg-[#52B788]/[0.03] blur-2xl" />
      </div>

      {/* Canvas */}
      <canvas
        ref={canvasRef}
        className="relative z-10"
      />

      {/* City label badge */}
      {selectedCity && CITY_COORDS[selectedCity] && canvasReady && (
        <div
          className="absolute z-20 animate-in fade-in slide-in-from-bottom-2 duration-500"
          style={{
            bottom: "12px",
            left: "50%",
            transform: "translateX(-50%)",
          }}
        >
          <div className="flex items-center gap-1.5 rounded-full border border-[#52B788]/30 bg-[#0d1f1a]/90 px-3 py-1.5 backdrop-blur-sm shadow-lg">
            <span className="relative flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C896] opacity-75" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00C896]" />
            </span>
            <span className="text-xs font-bold text-white">{selectedCity}</span>
            {coords && (
              <span className="text-[10px] text-white/70">
                {coords.lat.toFixed(1)}°N, {coords.lng.toFixed(1)}°E
              </span>
            )}
          </div>
        </div>
      )}

      {/* Title overlay */}
      <div className="absolute left-3 top-3 z-20">
        <p className="text-[10px] font-bold uppercase tracking-widest text-[#52B788]/80">
          Live Globe
        </p>
      </div>
    </div>
  );
}
