"use client";

import { useEffect, useRef, useState, useCallback } from "react";

/* ─────────────── City Coordinates ─────────────── */
interface CityCoord { lat: number; lng: number; state: string }

const CITY_COORDS: Record<string, CityCoord> = {
  Haridwar:   { lat: 29.95, lng: 78.16, state: "Uttarakhand" },
  Dehradun:   { lat: 30.32, lng: 78.03, state: "Uttarakhand" },
  Rishikesh:  { lat: 30.09, lng: 78.27, state: "Uttarakhand" },
  Roorkee:    { lat: 29.87, lng: 77.89, state: "Uttarakhand" },
  Delhi:      { lat: 28.61, lng: 77.21, state: "Delhi" },
  Mumbai:     { lat: 19.08, lng: 72.88, state: "Maharashtra" },
  Bengaluru:  { lat: 12.97, lng: 77.59, state: "Karnataka" },
  Pune:       { lat: 18.52, lng: 73.86, state: "Maharashtra" },
  Jaipur:     { lat: 26.91, lng: 75.79, state: "Rajasthan" },
  Lucknow:    { lat: 26.85, lng: 80.95, state: "Uttar Pradesh" },
  Hyderabad:  { lat: 17.39, lng: 78.49, state: "Telangana" },
};

/* ─────────────── Detailed India outline (Official borders including J&K, Ladakh, NE States) ─────────────── */
// Using [lat, lng] format, accurate to India's officially claimed borders
const INDIA_BORDER: Array<[number, number]> = [
  // Starting from Gujarat coast, going clockwise
  // Gujarat coast
  [20.7, 68.9], [21.5, 68.5], [22.3, 68.6], [23.0, 68.3], [23.7, 68.4],
  // Rajasthan-Pakistan border
  [24.0, 68.8], [24.6, 68.9], [25.0, 70.0], [25.5, 70.3], [26.0, 70.7],
  [26.5, 70.5], [27.0, 70.0], [27.5, 70.4], [28.0, 70.7],
  // Punjab-Pakistan border
  [28.5, 70.2], [29.0, 70.9], [29.5, 71.2], [30.0, 71.5], [30.4, 71.1],
  [31.0, 72.5], [31.5, 73.8], [32.0, 74.4], [32.5, 74.6],
  // Jammu & Kashmir (Official India border)
  [33.0, 74.8], [33.5, 75.0], [33.9, 75.3], [34.2, 75.5], [34.5, 75.8],
  [34.8, 76.2], [35.0, 76.5], [35.3, 76.8], [35.5, 77.0],
  // Ladakh - Northern border (Aksai Chin area - India's claimed border)
  [35.8, 77.5], [36.0, 77.8], [35.9, 78.2], [35.5, 78.5],
  [35.2, 78.8], [35.0, 79.0], [34.8, 79.2], [34.5, 79.5],
  // Himachal Pradesh / Uttarakhand border
  [34.0, 78.6], [33.5, 79.0], [33.0, 79.3], [32.5, 79.0],
  [32.0, 79.2], [31.5, 79.5], [31.0, 79.8], [30.7, 80.0],
  [30.4, 80.3], [30.2, 80.5], [30.0, 80.8],
  // Nepal border
  [29.5, 80.8], [29.2, 81.0], [28.8, 81.5], [28.5, 82.0],
  [28.3, 82.5], [28.0, 83.0], [27.7, 83.5], [27.5, 84.0],
  [27.2, 84.5], [27.0, 84.8], [26.8, 85.0], [26.6, 85.5],
  [26.4, 85.8], [26.3, 86.2], [26.5, 86.5], [26.6, 87.0],
  [26.7, 87.5], [26.8, 88.0],
  // Sikkim / West Bengal (Chicken's Neck)
  [27.0, 88.2], [27.1, 88.5], [26.8, 88.8], [26.5, 89.0],
  // Bhutan border
  [26.8, 89.5], [27.0, 89.8], [27.2, 90.0], [27.3, 90.5],
  [27.5, 91.0], [27.4, 91.5], [27.3, 92.0],
  // Arunachal Pradesh (India's official border - McMahon Line)
  [27.5, 92.2], [28.0, 92.5], [28.2, 93.0], [28.5, 93.5],
  [28.3, 94.0], [28.0, 94.5], [27.8, 95.0], [27.5, 95.5],
  [27.3, 96.0], [27.0, 96.5], [27.2, 97.0], [27.5, 97.3],
  // Nagaland / Manipur / Mizoram (Myanmar border)
  [27.0, 97.0], [26.5, 96.5], [26.0, 96.0], [25.5, 95.5],
  [25.0, 95.0], [24.5, 94.5], [24.0, 94.0], [23.5, 93.5],
  [23.0, 93.3], [22.5, 93.0], [22.0, 93.2], [21.5, 92.8],
  [21.2, 92.5],
  // Mizoram / Tripura (Bangladesh/Myanmar border)
  [21.0, 92.3], [22.0, 92.5], [22.5, 92.0], [23.0, 91.8],
  [23.5, 91.5], [24.0, 91.8], [24.5, 92.0], [24.8, 92.2],
  [25.0, 91.5], [25.2, 91.0], [25.0, 90.5],
  // Bangladesh border (West Bengal / Meghalaya / Assam)
  [25.2, 90.0], [25.5, 89.5], [25.2, 89.0], [25.0, 88.8],
  [24.5, 89.0],
  // West Bengal - Bangladesh border
  [24.0, 89.0], [23.5, 88.8], [23.0, 88.7], [22.5, 88.5],
  [22.0, 88.8], [21.8, 89.0], [21.9, 89.1],
  // Sundarbans / West Bengal coast
  [21.5, 88.5], [21.6, 87.8], [21.5, 87.0],
  // Odisha coast
  [20.5, 87.0], [20.0, 86.7], [19.5, 85.5], [19.0, 85.0],
  [18.5, 84.5], [18.0, 84.0], [17.5, 83.5],
  // Andhra Pradesh coast
  [17.0, 82.5], [16.5, 82.0], [16.0, 81.5], [15.5, 80.5],
  [15.0, 80.2], [14.5, 80.0],
  // Tamil Nadu / AP coast
  [14.0, 80.2], [13.5, 80.3], [13.0, 80.3],
  [12.5, 80.2], [12.0, 80.0],
  // Tamil Nadu coast
  [11.5, 79.8], [11.0, 79.7], [10.5, 79.5], [10.0, 79.3],
  [9.5, 79.2], [9.0, 79.3], [8.5, 78.5],
  // Kanyakumari
  [8.1, 77.6], [8.0, 77.5],
  // Kerala coast
  [8.3, 77.0], [8.5, 76.8], [9.0, 76.5], [9.5, 76.3],
  [10.0, 76.2], [10.5, 76.0], [11.0, 75.8],
  [11.5, 75.5], [12.0, 75.2], [12.5, 75.0],
  // Karnataka coast
  [13.0, 74.8], [13.5, 74.7], [14.0, 74.5], [14.5, 74.2],
  [15.0, 74.0], [15.5, 73.9],
  // Goa / Maharashtra coast
  [16.0, 73.5], [16.5, 73.3], [17.0, 73.2], [17.5, 73.0],
  [18.0, 72.9], [18.5, 72.8],
  // Mumbai area
  [19.0, 72.8], [19.5, 72.7], [20.0, 72.7], [20.5, 72.5],
  // Gujarat coast (Saurashtra)
  [21.0, 72.1], [21.5, 72.0], [22.0, 72.1],
  [22.3, 72.5], [22.5, 72.3], [22.3, 71.5],
  [22.0, 71.0], [21.5, 71.5], [21.0, 71.0],
  [20.8, 70.5], [21.0, 70.0], [21.3, 69.5],
  [21.0, 69.0], [20.7, 68.9],
];

/* ─────────────── Andaman & Nicobar Islands (simplified) ─────────────── */
const ANDAMAN: Array<[number, number]> = [
  [13.6, 92.7], [13.2, 93.0], [12.8, 92.9], [12.3, 92.8],
  [11.8, 92.7], [11.5, 92.8], [11.7, 92.6], [12.0, 92.6],
  [12.5, 92.7], [13.0, 92.7], [13.6, 92.7],
];

const NICOBAR: Array<[number, number]> = [
  [9.2, 92.8], [8.8, 93.0], [7.5, 93.8], [7.0, 93.7],
  [7.3, 93.5], [8.5, 92.9], [9.2, 92.8],
];

/* ─────────────── Lakshadweep (simplified) ─────────────── */
const LAKSHADWEEP_ISLANDS: Array<[number, number]> = [
  [11.5, 72.2], [10.5, 72.3], [10.0, 72.1], [11.0, 71.8], [11.5, 72.2],
];

/* ─────────────── Sri Lanka ─────────────── */
const SRI_LANKA: Array<[number, number]> = [
  [9.8, 80.2], [9.5, 80.8], [8.5, 81.5], [7.5, 81.8],
  [6.2, 81.0], [6.0, 80.5], [6.5, 80.0], [7.0, 79.8],
  [8.0, 79.7], [9.0, 79.9], [9.8, 80.2],
];

/* ─────────────── Major State Boundaries ─────────────── */
const STATE_BORDERS: Array<{ name: string; path: Array<[number, number]> }> = [
  { name: "Rajasthan-Gujarat", path: [[24.5, 68.8], [24.0, 72.0], [23.2, 72.5], [22.3, 72.3]] },
  { name: "Rajasthan-MP", path: [[25.0, 70.0], [24.5, 74.0], [24.0, 76.5], [23.5, 77.5]] },
  { name: "UP-MP", path: [[24.0, 77.0], [24.5, 78.5], [25.0, 80.0], [25.5, 81.5], [26.0, 83.0]] },
  { name: "Maharashtra-Karnataka", path: [[15.8, 74.0], [16.5, 76.0], [17.0, 78.0], [17.4, 78.5]] },
  { name: "AP-TN", path: [[13.8, 77.5], [13.2, 79.0], [12.5, 80.2]] },
  { name: "WB-Bihar", path: [[25.5, 84.0], [24.5, 86.0], [23.5, 87.0], [22.5, 88.0]] },
  { name: "Uttarakhand-UP", path: [[30.0, 77.5], [29.3, 79.0], [29.5, 80.5]] },
  { name: "Kerala-TN", path: [[11.8, 75.5], [10.5, 76.5], [9.0, 77.0], [8.1, 77.5]] },
  { name: "Maharashtra-Goa", path: [[15.5, 73.9], [15.8, 74.5]] },
  { name: "Gujarat-coast", path: [[21.0, 72.1], [22.0, 72.5], [23.0, 72.5]] },
  { name: "HP-Punjab", path: [[32.0, 74.8], [31.5, 76.0], [31.0, 77.0], [30.5, 77.5]] },
  { name: "NE-corridor", path: [[26.5, 89.5], [26.0, 91.0], [25.5, 92.0], [25.0, 93.0]] },
  { name: "Odisha-AP", path: [[19.0, 82.5], [18.5, 83.5], [18.0, 84.0]] },
  { name: "MP-Maharashtra", path: [[21.5, 73.5], [21.0, 75.5], [21.0, 77.5], [20.5, 79.0]] },
];

/* ─────────────── Projection ─────────────── */
const BOUNDS = { minLat: 5.5, maxLat: 37.5, minLng: 67.5, maxLng: 98.0 };

function toSVG(lat: number, lng: number): [number, number] {
  const x = ((lng - BOUNDS.minLng) / (BOUNDS.maxLng - BOUNDS.minLng)) * 500;
  const y = ((BOUNDS.maxLat - lat) / (BOUNDS.maxLat - BOUNDS.minLat)) * 550;
  return [x, y];
}

function pathFromCoords(coords: Array<[number, number]>): string {
  return coords
    .map(([lat, lng], i) => {
      const [x, y] = toSVG(lat, lng);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ") + " Z";
}

function lineFromCoords(coords: Array<[number, number]>): string {
  return coords
    .map(([lat, lng], i) => {
      const [x, y] = toSVG(lat, lng);
      return `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`;
    })
    .join(" ");
}

/* ─────────────── Step Info ─────────────── */
const STEP_CONFIG = [
  { label: "Select your city", sublabel: "Where are you?", accent: "#00C896" },
  { label: "Your lifestyle", sublabel: "Tell us about you", accent: "#52B788" },
  { label: "Set your goal", sublabel: "Your 6-month target", accent: "#2D6A4F" },
];

/* ─────────────── Component ─────────────── */
interface IndiaMapProps {
  selectedCity: string;
  step: number;
  diet?: string;
  vehicle?: string;
  goal?: number;
}

export default function IndiaMapOfficial({ selectedCity, step, diet, vehicle, goal }: IndiaMapProps) {
  const [time, setTime] = useState(0);

  useEffect(() => {
    let frame: number;
    function tick() {
      setTime(Date.now() / 1000);
      frame = requestAnimationFrame(tick);
    }
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  const config = STEP_CONFIG[step] || STEP_CONFIG[0];
  const coords = CITY_COORDS[selectedCity];
  const cityPos = coords ? toSVG(coords.lat, coords.lng) : null;

  // Pulse animation
  const pulse1 = 8 + Math.sin(time * 2.5) * 4;
  const pulse2 = 14 + Math.sin(time * 2.5) * 6;
  const pulseOpacity1 = 0.2 + Math.sin(time * 2.5) * 0.1;
  const pulseOpacity2 = 0.08 + Math.sin(time * 2.5) * 0.04;

  return (
    <div className="relative flex min-h-[280px] flex-col overflow-hidden rounded-card bg-[#0d1f1a] sm:min-h-[380px]">
      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-3 pb-1 z-20 relative">
        <div>
          <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-[#52B788]/80">
            India
          </p>
          <p className="text-xs font-bold text-white/70">{config.sublabel}</p>
        </div>
        <span className="text-lg">🇮🇳</span>
      </div>

      {/* SVG Map */}
      <div className="relative flex-1 px-2 pb-10">
        <svg
          viewBox="0 0 500 550"
          className="h-full w-full"
          style={{ filter: "drop-shadow(0 4px 12px rgba(0,200,150,0.08))" }}
        >
          <defs>
            {/* Map gradient */}
            <linearGradient id="mapGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#2D6A4F" stopOpacity="0.5" />
              <stop offset="50%" stopColor="#1B4332" stopOpacity="0.45" />
              <stop offset="100%" stopColor="#0d1f1a" stopOpacity="0.55" />
            </linearGradient>
            {/* Glow filter */}
            <filter id="pinGlow">
              <feGaussianBlur stdDeviation="4" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
            {/* Shadow for 3D effect */}
            <filter id="mapShadow">
              <feDropShadow dx="3" dy="5" stdDeviation="4" floodColor="#00C896" floodOpacity="0.08" />
            </filter>
          </defs>

          {/* Grid dots */}
          {Array.from({ length: 7 }, (_, latI) =>
            Array.from({ length: 7 }, (_, lngI) => {
              const lat = 10 + latI * 4;
              const lng = 70 + lngI * 4;
              const [x, y] = toSVG(lat, lng);
              return <circle key={`g${latI}-${lngI}`} cx={x} cy={y} r="0.8" fill="rgba(82,183,136,0.06)" />;
            })
          )}

          {/* India shadow (3D depth) */}
          <path
            d={pathFromCoords(INDIA_BORDER)}
            fill="rgba(0,200,150,0.04)"
            stroke="none"
            transform="translate(3, 5)"
          />

          {/* Main India fill */}
          <path
            d={pathFromCoords(INDIA_BORDER)}
            fill="url(#mapGrad)"
            stroke="rgba(82,183,136,0.45)"
            strokeWidth="1.2"
            filter="url(#mapShadow)"
          />

          {/* State borders */}
          {STATE_BORDERS.map((sb) => (
            <path
              key={sb.name}
              d={lineFromCoords(sb.path)}
              fill="none"
              stroke="rgba(82,183,136,0.12)"
              strokeWidth="0.6"
              strokeDasharray="3,3"
            />
          ))}

          {/* Andaman & Nicobar */}
          <path d={pathFromCoords(ANDAMAN)} fill="rgba(45,106,79,0.35)" stroke="rgba(82,183,136,0.3)" strokeWidth="0.6" />
          <path d={pathFromCoords(NICOBAR)} fill="rgba(45,106,79,0.3)" stroke="rgba(82,183,136,0.25)" strokeWidth="0.5" />

          {/* Lakshadweep */}
          <path d={pathFromCoords(LAKSHADWEEP_ISLANDS)} fill="rgba(45,106,79,0.25)" stroke="rgba(82,183,136,0.2)" strokeWidth="0.5" />

          {/* Sri Lanka (neighbor) */}
          <path d={pathFromCoords(SRI_LANKA)} fill="rgba(45,106,79,0.12)" stroke="rgba(82,183,136,0.15)" strokeWidth="0.5" />

          {/* City dots (non-selected) */}
          {Object.entries(CITY_COORDS).map(([name, c]) => {
            if (name === selectedCity) return null;
            const [cx, cy] = toSVG(c.lat, c.lng);
            return (
              <g key={name}>
                <circle cx={cx} cy={cy} r="2.5" fill="rgba(82,183,136,0.35)" />
                <text
                  x={cx + 5}
                  y={cy + 2}
                  fill="rgba(82,183,136,0.2)"
                  fontSize="6"
                  fontWeight="bold"
                  fontFamily="system-ui, sans-serif"
                >
                  {name}
                </text>
              </g>
            );
          })}

          {/* Selected city — animated pin */}
          {cityPos && (
            <g filter="url(#pinGlow)">
              {/* Pulse rings */}
              <circle cx={cityPos[0]} cy={cityPos[1]} r={pulse2} fill="none" stroke={config.accent} strokeWidth="0.5" opacity={pulseOpacity2} />
              <circle cx={cityPos[0]} cy={cityPos[1]} r={pulse1} fill="none" stroke={config.accent} strokeWidth="0.8" opacity={pulseOpacity1} />

              {/* Halo */}
              <circle cx={cityPos[0]} cy={cityPos[1]} r="12" fill={config.accent} opacity="0.1" />

              {/* Pin stem */}
              <line
                x1={cityPos[0]} y1={cityPos[1]}
                x2={cityPos[0]} y2={cityPos[1] - 24}
                stroke={config.accent} strokeWidth="1.5" opacity="0.7"
              />

              {/* Pin head */}
              <circle cx={cityPos[0]} cy={cityPos[1] - 24} r="5.5" fill={config.accent} />
              <circle cx={cityPos[0]} cy={cityPos[1] - 24} r="7" fill={config.accent} opacity="0.2" />
              <circle cx={cityPos[0]} cy={cityPos[1] - 24} r="2.2" fill="white" />

              {/* Base dot */}
              <circle cx={cityPos[0]} cy={cityPos[1]} r="3.5" fill={config.accent} />
              <circle cx={cityPos[0]} cy={cityPos[1]} r="1.5" fill="white" />

              {/* City name label */}
              <rect
                x={cityPos[0] + 10}
                y={cityPos[1] - 30}
                width={selectedCity.length * 6.5 + 16}
                height="18"
                rx="9"
                fill="#0d1f1a"
                stroke={config.accent}
                strokeWidth="0.6"
                opacity="0.9"
              />
              <text
                x={cityPos[0] + 18}
                y={cityPos[1] - 18}
                fill="white"
                fontSize="9"
                fontWeight="bold"
                fontFamily="system-ui, sans-serif"
              >
                {selectedCity}
              </text>
            </g>
          )}
        </svg>
      </div>

      {/* Ambient glow */}
      <div className="pointer-events-none absolute inset-0 overflow-hidden">
        <div className="absolute -left-10 -top-10 h-40 w-40 rounded-full bg-[#52B788]/5 blur-3xl" />
        <div className="absolute -bottom-10 -right-10 h-32 w-32 rounded-full bg-[#2D6A4F]/10 blur-3xl" />
      </div>

      {/* Bottom info badge */}
      <div className="absolute bottom-3 left-1/2 -translate-x-1/2 z-20">
        <div className="flex items-center gap-1.5 rounded-full border border-[#52B788]/30 bg-[#0d1f1a]/90 px-3 py-1.5 backdrop-blur-sm shadow-lg">
          <span className="relative flex h-2 w-2">
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full opacity-75" style={{ background: config.accent }} />
            <span className="relative inline-flex h-2 w-2 rounded-full" style={{ background: config.accent }} />
          </span>
          {step === 0 && coords && (
            <>
              <span className="text-xs font-bold text-white">{selectedCity}</span>
              <span className="text-[10px] text-white/70">{coords.state}</span>
            </>
          )}
          {step === 1 && (
            <span className="text-xs font-bold text-white">
              {diet?.replace("_", "-") || "vegetarian"} · {vehicle?.replaceAll("_", " ") || "two-wheeler"}
            </span>
          )}
          {step === 2 && (
            <span className="text-xs font-bold text-white">
              Goal: {goal || 20}% reduction in 6 months
            </span>
          )}
        </div>
      </div>
    </div>
  );
}
