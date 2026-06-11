"use client";

import { useState, useEffect } from "react";
import { callClaude } from "@/lib/anthropicClient";
import { Search, Scan, Plus } from "lucide-react";

const SYSTEM_PROMPT = `You are a product carbon footprint analyst. When given a product name or description, respond ONLY with valid JSON (no markdown, no explanation outside JSON):

{
  "product": "<product name>",
  "footprint_kg": <number: total lifecycle CO2e in kg>,
  "rating": "<A+ | A | B | C | D | F>",
  "rating_label": "<e.g. Very Low | Low | Moderate | High | Very High | Extreme>",
  "breakdown": {
    "production": <number: kg CO2e>,
    "transport": <number: kg CO2e>,
    "use_phase": <number: kg CO2e>,
    "disposal": <number: kg CO2e>
  },
  "comparison": "<one sentence comparing to a familiar reference>",
  "greener_alternative": "<name of a lower-carbon alternative product>",
  "alternative_footprint_kg": <number>,
  "tip": "<one actionable sentence>"
}

Use IPCC AR6 lifecycle emission data. For unknown products, make a well-reasoned estimate and still return valid JSON.`;

interface ScanResult {
  product: string;
  footprint_kg: number;
  rating: string;
  rating_label: string;
  breakdown: {
    production: number;
    transport: number;
    use_phase: number;
    disposal: number;
  };
  comparison: string;
  greener_alternative: string;
  alternative_footprint_kg: number;
  tip: string;
}

const EXAMPLES = ["iPhone 15", "Beef burger", "Cotton T-shirt", "Plastic water bottle", "Oat milk 1L"];

export default function ScannerPage() {
  const [query, setQuery] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ScanResult | null>(null);
  const [recentScans, setRecentScans] = useState<string[]>(EXAMPLES);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = localStorage.getItem("recent_scans");
    if (stored) {
      try {
        setRecentScans(JSON.parse(stored));
      } catch {}
    }
  }, []);

  const handleScan = async (searchQuery: string) => {
    const q = searchQuery.trim();
    if (!q) return;
    
    setIsScanning(true);
    setResult(null);
    setError("");

    try {
      const responseText = await callClaude(SYSTEM_PROMPT, q);
      let parsed: ScanResult;
      try {
        // Strip out any potential markdown backticks just in case
        const cleanJson = responseText.replace(/^[`\s]*json|[`\s]*$/gi, '').trim();
        parsed = JSON.parse(cleanJson);
      } catch (e) {
        throw new Error("Could not parse footprint data.");
      }
      
      setResult(parsed);
      
      setRecentScans((prev) => {
        const newScans = [q, ...prev.filter((s) => s.toLowerCase() !== q.toLowerCase())].slice(0, 5);
        localStorage.setItem("recent_scans", JSON.stringify(newScans));
        return newScans;
      });
    } catch (err) {
      console.error(err);
      setError("Failed to analyze product. Please try again.");
    } finally {
      setIsScanning(false);
    }
  };

  const getRatingColor = (rating: string) => {
    switch (rating) {
      case "A+": return "text-emerald-500 bg-emerald-500/10";
      case "A": return "text-green-500 bg-green-500/10";
      case "B": return "text-yellow-500 bg-yellow-500/10";
      case "C": return "text-orange-500 bg-orange-500/10";
      case "D": return "text-red-500 bg-red-500/10";
      case "F": return "text-rose-700 bg-rose-700/10";
      default: return "text-gray-500 bg-gray-500/10";
    }
  };

  const addToFootprint = () => {
    if (!result) return;
    const current = parseInt(localStorage.getItem("user_footprint") || "1900", 10);
    localStorage.setItem("user_footprint", (current + result.footprint_kg).toString());
    alert(`Added ${result.footprint_kg} kg CO2e to your footprint!`);
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] p-4 md:p-8 bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5]">
      <div className="max-w-2xl mx-auto space-y-8">
        
        {/* Search Bar */}
        <div className="space-y-4">
          <h1 className="text-2xl font-bold text-[#2D6A4F] dark:text-[#52B788]">Scanner</h1>
          <div className="relative flex items-center gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-neutral-400" size={20} />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan(query)}
                placeholder="Scan a product — type any product name"
                className="w-full rounded-2xl border-2 border-[#52B788]/30 bg-white dark:bg-[#1A2F2A] py-4 pl-12 pr-4 text-lg focus:border-[#2D6A4F] focus:outline-none"
              />
            </div>
            <button
              title="Coming soon: barcode scan"
              className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 border-[#52B788]/30 bg-white dark:bg-[#1A2F2A] text-[#2D6A4F] hover:bg-[#F8FAF5] transition"
            >
              <Scan size={24} />
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            <span className="text-sm text-neutral-500 py-1">Recent:</span>
            {recentScans.map((scan) => (
              <button
                key={scan}
                onClick={() => { setQuery(scan); handleScan(scan); }}
                className="rounded-full bg-[#52B788]/10 px-3 py-1 text-sm font-medium hover:bg-[#52B788]/20 transition"
              >
                {scan}
              </button>
            ))}
          </div>
        </div>

        {isScanning && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative flex h-16 w-16 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#52B788]/20"></div>
              <div className="absolute inset-0 rounded-full border-4 border-[#2D6A4F] border-t-transparent animate-spin"></div>
              <Search className="text-[#2D6A4F] animate-pulse" />
            </div>
            <p className="text-sm font-medium animate-pulse text-[#2D6A4F]">Analyzing lifecycle emissions...</p>
          </div>
        )}

        {error && (
          <div className="rounded-xl bg-red-50 dark:bg-red-900/20 p-4 text-red-600 dark:text-red-400 text-center">
            {error}
            <button onClick={() => handleScan(query)} className="ml-4 underline font-bold">Retry</button>
          </div>
        )}

        {result && (
          <div className="animate-in fade-in slide-in-from-bottom-4 space-y-6">
            <div className="rounded-3xl bg-white dark:bg-[#1A2F2A] p-6 shadow-sm border border-[#52B788]/20">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl font-bold capitalize">{result.product}</h2>
                  <p className="text-3xl font-black text-[#2D6A4F] dark:text-[#52B788] mt-2">
                    {result.footprint_kg} <span className="text-lg font-medium">kg CO2e</span>
                  </p>
                </div>
                <div className={`flex flex-col items-center justify-center rounded-2xl h-20 w-20 ${getRatingColor(result.rating)}`}>
                  <span className="text-3xl font-black">{result.rating}</span>
                  <span className="text-[10px] font-bold uppercase tracking-wider">{result.rating_label}</span>
                </div>
              </div>

              <p className="mt-4 text-sm font-medium bg-[#F8FAF5] dark:bg-black/20 p-3 rounded-xl border border-[#52B788]/10">
                💡 {result.comparison}
              </p>

              {/* Breakdown Chart Placeholder (CSS based) */}
              <div className="mt-8">
                <h3 className="text-sm font-bold uppercase tracking-wider text-neutral-500 mb-4">Lifecycle Breakdown</h3>
                <div className="flex h-4 w-full overflow-hidden rounded-full bg-neutral-100 dark:bg-neutral-800">
                  <div style={{ width: `${(result.breakdown.production / result.footprint_kg) * 100}%` }} className="bg-[#2D6A4F]" title="Production"></div>
                  <div style={{ width: `${(result.breakdown.transport / result.footprint_kg) * 100}%` }} className="bg-[#52B788]" title="Transport"></div>
                  <div style={{ width: `${(result.breakdown.use_phase / result.footprint_kg) * 100}%` }} className="bg-[#74C69D]" title="Use Phase"></div>
                  <div style={{ width: `${(result.breakdown.disposal / result.footprint_kg) * 100}%` }} className="bg-[#B7E4C7]" title="Disposal"></div>
                </div>
                <div className="mt-3 flex flex-wrap gap-4 text-xs font-medium">
                  <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#2D6A4F]"></span> Production</div>
                  <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#52B788]"></span> Transport</div>
                  <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#74C69D]"></span> Use Phase</div>
                  <div className="flex items-center gap-1"><span className="h-3 w-3 rounded-full bg-[#B7E4C7]"></span> Disposal</div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <div className="rounded-2xl bg-[#F8FAF5] dark:bg-[#1A2F2A] p-5 border border-[#52B788]/30 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#2D6A4F] dark:text-[#52B788] mb-1">Greener Alternative</h3>
                  <p className="font-semibold">{result.greener_alternative}</p>
                  <p className="text-sm mt-1">{result.alternative_footprint_kg} kg CO2e</p>
                </div>
                <div className="mt-4 text-xs font-medium text-emerald-600 dark:text-emerald-400">
                  ↓ Saves {(result.footprint_kg - result.alternative_footprint_kg).toFixed(1)} kg CO2e
                </div>
              </div>
              
              <div className="rounded-2xl bg-white dark:bg-[#1A2F2A] p-5 shadow-sm border border-[#52B788]/20 flex flex-col justify-between">
                <div>
                  <h3 className="text-sm font-bold text-[#2D6A4F] dark:text-[#52B788] mb-1">Actionable Tip</h3>
                  <p className="text-sm leading-relaxed">{result.tip}</p>
                </div>
                <button
                  onClick={addToFootprint}
                  className="mt-4 w-full flex items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-2.5 text-sm font-bold text-white hover:bg-[#1B4332] transition"
                >
                  <Plus size={16} />
                  Add to my footprint
                </button>
              </div>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}
