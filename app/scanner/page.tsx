"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { MotionPage } from "@/components/motion-page";
import { Button } from "@/components/ui/button";
import { showSettingsToast } from "@/components/settings/SettingsToast";
import { cn } from "@/lib/utils";
import { Search } from "lucide-react";

/* ─── Types ─── */
interface ProductResult {
  product: string;
  brand?: string;
  category?: string;
  image?: string;
  footprint_kg: number;
  rating: string;
  rating_label: string;
  sustainability_score?: number;
  breakdown: {
    production: number;
    transport: number;
    use_phase: number;
    disposal: number;
  };
  packaging?: {
    type: string;
    recyclable: boolean;
    biodegradable: boolean;
  };
  comparison: string;
  greener_alternative: string;
  alternative_footprint_kg: number;
  tip: string;
  eco_facts?: string[];
}

interface ScanHistoryItem {
  query: string;
  type: "name" | "barcode" | "qr";
  product: string;
  footprint_kg: number;
  rating: string;
  timestamp: number;
}

/* ─── Tabs ─── */
const SCAN_TABS = [
  { id: "search", label: "Product Search", emoji: "🔍", desc: "Search by name" },
  { id: "barcode", label: "Barcode / Code", emoji: "📊", desc: "Enter barcode" },
  { id: "camera", label: "Camera Scan", emoji: "📷", desc: "Scan with camera" },
] as const;

type TabId = (typeof SCAN_TABS)[number]["id"];

/* ─── Quick search suggestions ─── */
const QUICK_SEARCHES = [
  { name: "iPhone 15", emoji: "📱" },
  { name: "Cotton T-Shirt", emoji: "👕" },
  { name: "Plastic Water Bottle", emoji: "🧴" },
  { name: "Oat Milk", emoji: "🥛" },
  { name: "LED Bulb", emoji: "💡" },
  { name: "Rice", emoji: "🍚" },
  { name: "Beef Burger", emoji: "🍔" },
  { name: "Laptop", emoji: "💻" },
];

/* ─── Example barcodes ─── */
const EXAMPLE_BARCODES = [
  { code: "8901030899999", label: "Amul Butter" },
  { code: "8901725133541", label: "Parle-G Biscuits" },
  { code: "8901063070226", label: "Tata Tea Gold" },
  { code: "5000159484695", label: "Cadbury Dairy Milk" },
];

/* ─── Rating colors ─── */
function getRatingStyle(rating: string) {
  switch (rating) {
    case "A+": return { bg: "bg-emerald-500", text: "text-white", ring: "ring-emerald-300" };
    case "A": return { bg: "bg-green-500", text: "text-white", ring: "ring-green-300" };
    case "B": return { bg: "bg-yellow-500", text: "text-white", ring: "ring-yellow-300" };
    case "C": return { bg: "bg-orange-500", text: "text-white", ring: "ring-orange-300" };
    case "D": return { bg: "bg-red-500", text: "text-white", ring: "ring-red-300" };
    case "F": return { bg: "bg-rose-700", text: "text-white", ring: "ring-rose-400" };
    default: return { bg: "bg-gray-400", text: "text-white", ring: "ring-gray-300" };
  }
}

function getSustainabilityColor(score: number) {
  if (score >= 80) return "from-emerald-400 to-emerald-600";
  if (score >= 60) return "from-green-400 to-green-600";
  if (score >= 40) return "from-yellow-400 to-orange-500";
  if (score >= 20) return "from-orange-400 to-red-500";
  return "from-red-500 to-rose-700";
}

/* ─── Confidence ─── */
type ScanConfidence = "HIGH" | "MEDIUM" | "LOW";

function getScanConfidence(source: string): ScanConfidence {
  if (source === "local_db" || source === "openfoodfacts") return "HIGH";
  if (source === "openfoodfacts+ai") return "MEDIUM";
  return "LOW";
}

const SCAN_CONFIDENCE_COLORS: Record<ScanConfidence, string> = {
  HIGH: "bg-green-600 text-white",
  MEDIUM: "bg-yellow-500 text-white",
  LOW: "bg-red-500 text-white",
};

/* ─── Suggest Alternatives ─── */
const ALTERNATIVES: Record<string, { item: string; co2: number }> = {
  "plastic bottle": { item: "Steel Bottle", co2: 0.7 },
  "plastic bag": { item: "Cloth Bag", co2: 0.01 },
  "disposable cup": { item: "Reusable Cup", co2: 0.05 },
  "paper cup": { item: "Reusable Cup", co2: 0.05 },
  "styrofoam": { item: "Banana Leaf Plate", co2: 0.0 },
  "petrol car": { item: "CNG Auto/Tempo", co2: 0.8 },
  "incandescent bulb": { item: "LED Bulb", co2: 0.04 },
};

function findAlternative(product: string): { key: string; alt: { item: string; co2: number } } | null {
  const lower = product.toLowerCase();
  for (const [key, alt] of Object.entries(ALTERNATIVES)) {
    if (lower.includes(key)) return { key, alt };
  }
  return null;
}

/* ─── Main page ─── */
export default function ScannerPage() {
  const [activeTab, setActiveTab] = useState<TabId>("search");
  const [query, setQuery] = useState("");
  const [barcodeInput, setBarcodeInput] = useState("");
  const [isScanning, setIsScanning] = useState(false);
  const [result, setResult] = useState<ProductResult | null>(null);
  const [source, setSource] = useState("");
  const [error, setError] = useState("");
  const [history, setHistory] = useState<ScanHistoryItem[]>([]);
  const [_showHistory, _setShowHistory] = useState(false);
  const [cameraActive, setCameraActive] = useState(false);
  const [cameraError, setCameraError] = useState("");
  const [detectedCode, setDetectedCode] = useState("");
  const [barcodeSupported, setBarcodeSupported] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const scanningRef = useRef(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleScanRef = useRef<(q: string, t: "name" | "barcode" | "qr") => void>();

  // Load history
  useEffect(() => {
    try {
      const stored = localStorage.getItem("scanner_history");
      if (stored) setHistory(JSON.parse(stored));
    } catch {}
  }, []);

  const saveToHistory = useCallback((item: ScanHistoryItem) => {
    setHistory((prev) => {
      const updated = [item, ...prev.filter((h) => h.query !== item.query)].slice(0, 20);
      localStorage.setItem("scanner_history", JSON.stringify(updated));
      return updated;
    });
  }, []);

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem("scanner_history");
    showSettingsToast("History cleared");
  };

  /* ─── Scan / Search ─── */
  const handleScan = async (searchQuery: string, type: "name" | "barcode" | "qr" = "name") => {
    const q = searchQuery.trim();
    if (!q) return;

    setIsScanning(true);
    setResult(null);
    setError("");

    try {
      const response = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: q, type }),
      });

      const data = await response.json();

      if (data.error) {
        setError(data.error);
        return;
      }

      setResult(data.data);
      setSource(data.source);

      saveToHistory({
        query: q,
        type,
        product: data.data.product,
        footprint_kg: data.data.footprint_kg,
        rating: data.data.rating,
        timestamp: Date.now(),
      });
    } catch (err) {
      console.error(err);
      setError("Failed to analyze product. Please check your connection and try again.");
    } finally {
      setIsScanning(false);
    }
  };

  // Keep ref in sync so the scanning loop always calls the latest handleScan
  handleScanRef.current = handleScan;

  /* ─── Camera ─── */

  // Check if BarcodeDetector is supported (Chrome, Edge, Android)
  useEffect(() => {
    if (typeof window !== "undefined" && !("BarcodeDetector" in window)) {
      setBarcodeSupported(false);
    }
  }, []);

  // Barcode scanning loop — captures frames from <video> to <canvas>,
  // then uses BarcodeDetector.detect() to find barcodes.
  // WHAT WAS BROKEN: The original code opened the camera and displayed the
  // video feed, but NEVER attempted to read/decode any barcodes from it.
  // The camera was purely visual — no decoding logic existed.
  const startScanningLoop = useCallback(() => {
    if (!barcodeSupported || !("BarcodeDetector" in window)) return;

    const detector = new (window as any).BarcodeDetector({
      formats: ["ean_13", "ean_8", "upc_a", "upc_e", "qr_code", "code_128", "code_39"],
    });

    scanningRef.current = true;

    const scan = async () => {
      if (!scanningRef.current || !videoRef.current || !canvasRef.current) return;

      const video = videoRef.current;
      const canvas = canvasRef.current;

      // Only scan when video has actual frames
      if (video.readyState >= video.HAVE_ENOUGH_DATA && video.videoWidth > 0) {
        canvas.width = video.videoWidth;
        canvas.height = video.videoHeight;
        const ctx = canvas.getContext("2d");
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          try {
            const barcodes = await detector.detect(canvas);
            if (barcodes.length > 0) {
              const code = barcodes[0].rawValue;
              if (code) {
                // Stop scanning, show detected code, and trigger lookup
                scanningRef.current = false;
                setDetectedCode(code);
                setBarcodeInput(code);
                // Auto-trigger the scan after a brief visual flash
                setTimeout(() => {
                  handleScanRef.current?.(code, "barcode");
                  stopCamera();
                }, 600);
                return; // Don't continue the loop
              }
            }
          } catch {
            // Detection can throw on invalid frames — just continue
          }
        }
      }

      // Continue loop at ~10fps (every 100ms) to balance performance
      if (scanningRef.current) {
        requestAnimationFrame(() => setTimeout(scan, 100));
      }
    };

    // Start after a short delay to let camera warm up
    setTimeout(scan, 300);
  }, [barcodeSupported]);

  const startCamera = async () => {
    setCameraError("");
    setDetectedCode("");
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "environment", width: { ideal: 1280 }, height: { ideal: 720 } },
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraActive(true);
      // FIX: Start the barcode decoding loop when camera starts
      startScanningLoop();
    } catch (_err) {
      setCameraError("Camera access denied. Please allow camera permissions in your browser settings.");
      setCameraActive(false);
    }
  };

  const stopCamera = () => {
    scanningRef.current = false; // Stop the scanning loop
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
    }
    setCameraActive(false);
  };

  useEffect(() => {
    return () => { stopCamera(); };
  }, []);

  useEffect(() => {
    if (activeTab !== "camera") stopCamera();
  }, [activeTab]);

  /* ─── Add to footprint ─── */
  const addToFootprint = () => {
    if (!result) return;
    try {
      const _response = fetch("/api/entries", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          category: "shopping",
          input: { items: { [result.category?.toLowerCase() === "electronics" ? "smartphone" : "clothing_item"]: 1 } },
          notes: `Scanner: ${result.product} (${result.footprint_kg} kg CO₂e)`,
        }),
      });
      showSettingsToast(`Added ${result.product} (${result.footprint_kg} kg CO₂e) to your log! 🌿`);
    } catch {
      showSettingsToast("Failed to add entry", "error");
    }
  };

  const totalBreakdown = result ? result.breakdown.production + result.breakdown.transport + result.breakdown.use_phase + result.breakdown.disposal : 0;

  return (
    <MotionPage>
      <section className="space-y-5 pb-8">
        {/* ─── Header ─── */}
        <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-[#1B4332] via-[#2D6A4F] to-[#40916C] p-6 text-white shadow-xl">
          <div className="absolute top-0 right-0 h-32 w-32 rounded-full bg-white/5 -translate-y-8 translate-x-8" />
          <div className="absolute bottom-0 left-0 h-24 w-24 rounded-full bg-white/5 translate-y-8 -translate-x-8" />
          <div className="inline-flex items-center gap-1.5 rounded-full bg-white/15 px-3 py-1 text-xs font-bold backdrop-blur-sm">
            🔍 Product Scanner
          </div>
          <h1 className="mt-3 font-heading text-2xl font-extrabold leading-tight sm:text-3xl">
            Scan & Discover Impact
          </h1>
          <p className="mt-1 text-sm text-white/70">
            Search products, scan barcodes, or use your camera to discover their carbon footprint.
          </p>
        </div>

        {/* ─── Tab bar ─── */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar">
          {SCAN_TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => { setActiveTab(tab.id); setResult(null); setError(""); }}
              className={cn(
                "inline-flex min-h-11 shrink-0 items-center gap-2 rounded-full border-2 px-4 text-sm font-bold transition-all",
                activeTab === tab.id
                  ? "border-[#2D6A4F] bg-[#2D6A4F] text-white shadow-md"
                  : "border-[#E5E7EB] dark:border-white/10 bg-white dark:bg-white/[0.03] text-ink/70 dark:text-white/70 hover:border-[#52B788]/40"
              )}
            >
              <span>{tab.emoji}</span>
              {tab.label}
            </button>
          ))}
        </div>

        {/* ─── SEARCH TAB ─── */}
        {activeTab === "search" && (
          <div className="space-y-4">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-[#6B7C6E]" size={20} />
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleScan(query)}
                placeholder="Search any product — iPhone, T-shirt, Rice, LED bulb..."
                className="w-full min-h-14 rounded-2xl border-2 border-[#D1FAE5]/80 dark:border-white/10 bg-white dark:bg-white/[0.03] pl-12 pr-4 text-sm font-semibold focus:border-[#2D6A4F] focus:outline-none transition"
              />
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-[#6B7C6E] dark:text-white/60 py-1.5">Try:</span>
              {QUICK_SEARCHES.map((item) => (
                <button
                  key={item.name}
                  onClick={() => { setQuery(item.name); handleScan(item.name); }}
                  disabled={isScanning}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#D1FAE5] dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-1.5 text-xs font-semibold hover:border-[#52B788] hover:bg-[#F0FDF4] dark:hover:bg-[#2D6A4F]/15 transition disabled:opacity-40"
                >
                  <span>{item.emoji}</span>
                  {item.name}
                </button>
              ))}
            </div>

            <Button
              onClick={() => handleScan(query)}
              disabled={!query.trim() || isScanning}
              className="w-full rounded-2xl bg-[#2D6A4F] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#1B4332] disabled:opacity-40"
            >
              {isScanning ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Analyzing...</>
              ) : (
                <>🔍 Analyze Product</>
              )}
            </Button>
          </div>
        )}

        {/* ─── BARCODE TAB ─── */}
        {activeTab === "barcode" && (
          <div className="space-y-4">
            <div className="rounded-2xl border-2 border-[#D1FAE5]/80 dark:border-white/10 bg-white dark:bg-white/[0.03] p-5">
              <label className="block text-sm font-bold text-[#6B7C6E] dark:text-white/50 mb-2">
                📊 Enter Barcode / Product Code
              </label>
              <input
                type="text"
                value={barcodeInput}
                onChange={(e) => setBarcodeInput(e.target.value.replace(/[^a-zA-Z0-9-]/g, ""))}
                onKeyDown={(e) => e.key === "Enter" && handleScan(barcodeInput, "barcode")}
                placeholder="e.g. 8901030899999 or SKU-12345"
                className="w-full min-h-14 rounded-xl border-2 border-[#E5E7EB] dark:border-white/10 bg-[#F8FAF5] dark:bg-white/[0.02] px-4 text-lg font-mono font-bold tracking-wider focus:border-[#2D6A4F] focus:outline-none transition"
                maxLength={20}
              />
              <p className="mt-2 text-xs text-[#6B7C6E] dark:text-white/60">
                Supports: EAN-13, EAN-8, UPC-A, GTIN, SKU codes
              </p>
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="text-xs font-bold text-[#6B7C6E] dark:text-white/60 py-1.5">Try:</span>
              {EXAMPLE_BARCODES.map((item) => (
                <button
                  key={item.code}
                  onClick={() => { setBarcodeInput(item.code); handleScan(item.code, "barcode"); }}
                  disabled={isScanning}
                  className="inline-flex items-center gap-1.5 rounded-full border border-[#D1FAE5] dark:border-white/10 bg-white dark:bg-white/[0.03] px-3 py-1.5 text-xs font-semibold hover:border-[#52B788] transition disabled:opacity-40"
                >
                  📊 {item.label}
                </button>
              ))}
            </div>

            <Button
              onClick={() => handleScan(barcodeInput, "barcode")}
              disabled={!barcodeInput.trim() || isScanning}
              className="w-full rounded-2xl bg-[#2D6A4F] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#1B4332] disabled:opacity-40"
            >
              {isScanning ? (
                <><span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" /> Looking up...</>
              ) : (
                <>📊 Look Up Barcode</>
              )}
            </Button>
          </div>
        )}

        {/* ─── CAMERA TAB ─── */}
        {activeTab === "camera" && (
          <div className="space-y-4">
            <div className="relative overflow-hidden rounded-2xl border-2 border-[#D1FAE5]/80 dark:border-white/10 bg-black aspect-video">
              {cameraActive ? (
                <>
                  <video ref={videoRef} className="h-full w-full object-cover" playsInline muted />
                  {/* Scanner overlay */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="h-48 w-48 rounded-2xl border-4 border-[#52B788]/60">
                      <div className="absolute top-0 left-0 w-8 h-8 border-t-4 border-l-4 border-[#52B788] rounded-tl-lg" />
                      <div className="absolute top-0 right-0 w-8 h-8 border-t-4 border-r-4 border-[#52B788] rounded-tr-lg" />
                      <div className="absolute bottom-0 left-0 w-8 h-8 border-b-4 border-l-4 border-[#52B788] rounded-bl-lg" />
                      <div className="absolute bottom-0 right-0 w-8 h-8 border-b-4 border-r-4 border-[#52B788] rounded-br-lg" />
                    </div>
                    {/* Scanning line animation */}
                    <div className="absolute h-0.5 w-44 bg-gradient-to-r from-transparent via-[#52B788] to-transparent animate-pulse" />
                  </div>
                  <div className="absolute bottom-3 inset-x-0 text-center">
                    <p className="text-xs text-white/70 bg-black/50 rounded-full px-3 py-1 inline-block backdrop-blur-sm">
                      Point camera at barcode or QR code
                    </p>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center h-full text-white/60 p-8">
                  <span className="text-4xl mb-3">📷</span>
                  <p className="text-sm font-semibold text-center">Camera preview will appear here</p>
                  <p className="text-xs mt-1 text-center text-white/60">Scan the barcode on the package</p>
                </div>
              )}
              {/* Hidden canvas for barcode frame capture */}
              <canvas ref={canvasRef} className="hidden" />
              {/* Visual feedback when barcode is detected */}
              {detectedCode && (
                <div className="absolute inset-0 flex items-center justify-center bg-green-500/20 backdrop-blur-sm animate-pulse">
                  <div className="rounded-2xl bg-white dark:bg-[#1A2F2A] px-6 py-4 shadow-xl text-center">
                    <p className="text-sm font-bold text-green-600 dark:text-green-400">✅ Barcode detected!</p>
                    <p className="text-lg font-mono font-bold mt-1">{detectedCode}</p>
                  </div>
                </div>
              )}
            </div>

            {cameraError && (
              <div className="rounded-xl bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-900/30 p-3">
                <p className="text-xs font-medium text-red-600 dark:text-red-400">{cameraError}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={cameraActive ? stopCamera : startCamera}
                className={cn(
                  "rounded-2xl py-3.5 text-sm font-bold shadow-lg",
                  cameraActive
                    ? "bg-red-500 text-white hover:bg-red-600"
                    : "bg-[#2D6A4F] text-white hover:bg-[#1B4332]"
                )}
              >
                {cameraActive ? "⏹ Stop Camera" : "📷 Start Camera"}
              </Button>
              <Button
                onClick={() => {
                  const code = prompt("Enter the barcode/QR code value you scanned:");
                  if (code) handleScan(code.trim(), "barcode");
                }}
                className="rounded-2xl bg-white dark:bg-white/[0.05] border-2 border-[#D1FAE5] dark:border-white/10 py-3.5 text-sm font-bold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4]"
              >
                ⌨️ Type Code
              </Button>
            </div>

            {!barcodeSupported && (
              <div className="rounded-2xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 p-3">
                <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                  ⚠️ Barcode scanning is not supported in this browser. Use the <strong>Type Code</strong> button or switch to Chrome/Edge.
                </p>
              </div>
            )}

            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/30 bg-amber-50 dark:bg-amber-900/10 p-3">
              <p className="text-xs font-medium text-amber-700 dark:text-amber-400">
                💡 <strong>Tip:</strong> Point your camera at a barcode. It will be detected and looked up automatically.
              </p>
            </div>
          </div>
        )}

        {/* ─── Loading state ─── */}
        {isScanning && (
          <div className="flex flex-col items-center justify-center py-12 space-y-4">
            <div className="relative flex h-20 w-20 items-center justify-center">
              <div className="absolute inset-0 rounded-full border-4 border-[#D1FAE5] dark:border-[#2D6A4F]/40" />
              <div className="absolute inset-0 rounded-full border-4 border-[#2D6A4F] border-t-transparent animate-spin" />
              <span className="text-2xl">🔍</span>
            </div>
            <p className="text-sm font-bold text-[#2D6A4F] dark:text-[#52B788] animate-pulse">
              Analyzing lifecycle emissions...
            </p>
            <p className="text-xs text-[#6B7C6E] dark:text-white/60">
              Checking databases & calculating carbon footprint
            </p>
          </div>
        )}

        {/* ─── Error state ─── */}
        {error && !isScanning && (
          <div className="rounded-2xl border-2 border-red-200 dark:border-red-900/30 bg-red-50 dark:bg-red-900/10 p-5 text-center space-y-3">
            <span className="text-3xl">😔</span>
            <p className="text-sm font-bold text-red-600 dark:text-red-400">{error}</p>
            <div className="flex gap-2 justify-center">
              <button
                onClick={() => handleScan(activeTab === "barcode" ? barcodeInput : query, activeTab === "barcode" ? "barcode" : "name")}
                className="rounded-full bg-red-100 dark:bg-red-900/20 px-4 py-2 text-xs font-bold text-red-600 dark:text-red-400 hover:bg-red-200 transition"
              >
                🔄 Retry
              </button>
              <button
                onClick={() => { setError(""); setActiveTab("search"); }}
                className="rounded-full bg-[#D1FAE5] dark:bg-[#2D6A4F]/30 px-4 py-2 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#B7E4C7] transition"
              >
                🔍 Try different search
              </button>
            </div>
          </div>
        )}

        {/* ─── RESULT ─── */}
        {result && !isScanning && (
          <div className="space-y-4 animate-[fadeIn_0.4s_ease]">
            {/* Source badge */}
            <div className="flex items-center justify-between">
              <span className="inline-flex items-center gap-1.5 rounded-full bg-[#D1FAE5] dark:bg-[#2D6A4F]/30 px-3 py-1 text-[10px] font-bold uppercase text-[#2D6A4F] dark:text-[#52B788]">
                {source === "local_db" ? "📚 Local Database" : source === "openfoodfacts+ai" ? "🌍 OpenFoodFacts + AI" : source === "openfoodfacts" ? "🌍 OpenFoodFacts" : "🤖 AI Analysis"}
              </span>
              <button
                onClick={() => { setResult(null); setError(""); }}
                className="text-xs font-bold text-[#6B7C6E] hover:text-[#2D6A4F] transition"
              >
                ✕ Clear
              </button>
            </div>

            {/* Main product card */}
            <div className="rounded-3xl border-2 border-[#D1FAE5]/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-6 shadow-sm">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {result.brand && result.brand !== "Generic" && (
                    <p className="text-xs font-bold uppercase tracking-wider text-[#6B7C6E] dark:text-white/60 mb-1">{result.brand}</p>
                  )}
                  <h2 className="text-xl font-extrabold capitalize truncate">{result.product}</h2>
                  {result.category && (
                    <span className="inline-block mt-1 rounded-full bg-[#F0FDF4] dark:bg-[#2D6A4F]/15 px-2.5 py-0.5 text-[10px] font-bold text-[#2D6A4F] dark:text-[#52B788]">
                      {result.category}
                    </span>
                  )}
                  <p className="mt-3 font-heading text-3xl font-extrabold text-[#1B4332] dark:text-white tabular-nums">
                    {result.footprint_kg} <span className="text-base font-bold text-[#6B7C6E]">kg CO₂e</span>
                  </p>
                  {/* Confidence badge */}
                  <div className="mt-2 flex items-center gap-2">
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold ${SCAN_CONFIDENCE_COLORS[getScanConfidence(source)]}`}
                      title="Confidence reflects how closely the detected object matches our emission database."
                    >
                      Confidence: {getScanConfidence(source)}
                    </span>
                    <span className="text-xs text-[#6B7C6E] dark:text-white/40 cursor-help" title="Confidence reflects how closely the detected object matches our emission database.">
                      ?
                    </span>
                  </div>
                </div>

                {/* Rating badge */}
                <div className={cn(
                  "flex flex-col items-center justify-center rounded-2xl h-20 w-20 shrink-0 shadow-lg ring-4",
                  getRatingStyle(result.rating).bg,
                  getRatingStyle(result.rating).text,
                  getRatingStyle(result.rating).ring
                )}>
                  <span className="text-2xl font-black">{result.rating}</span>
                  <span className="text-[9px] font-bold uppercase tracking-wider">{result.rating_label}</span>
                </div>
              </div>

              {/* Sustainability score bar */}
              {result.sustainability_score != null && result.sustainability_score > 0 && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-xs font-bold text-[#6B7C6E] dark:text-white/50">Sustainability Score</span>
                    <span className="text-sm font-extrabold text-[#1B4332] dark:text-white">{result.sustainability_score}/100</span>
                  </div>
                  <div className="h-2.5 w-full rounded-full bg-gray-100 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${getSustainabilityColor(result.sustainability_score)} transition-all duration-700`}
                      style={{ width: `${result.sustainability_score}%` }}
                    />
                  </div>
                </div>
              )}

              {/* Comparison */}
              <div className="mt-4 rounded-xl bg-[#F0FDF4] dark:bg-[#2D6A4F]/15 border border-[#D1FAE5]/60 dark:border-[#2D6A4F]/40 p-3">
                <p className="text-sm text-[#2D6A4F] dark:text-[#B7E4C7]">💡 {result.comparison}</p>
              </div>

              {/* Explain Result */}
              {result.tip && (
                <p className="mt-3 text-sm italic text-[#6B7C6E] dark:text-white/60">
                  Why: {result.tip}
                </p>
              )}
            </div>

            {/* Suggest Alternatives */}
            {(() => {
              const match = findAlternative(result.product);
              if (!match) return null;
              const saving = Math.max(0, result.footprint_kg - match.alt.co2);
              return (
                <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 p-5">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-3">
                    🔄 Suggested Alternative / विकल्प
                  </h3>
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-[#1B4332] dark:text-white">Detected: {result.product}</span>
                      <span className="font-bold tabular-nums">{result.footprint_kg} kg CO₂e</span>
                    </div>
                    <div className="text-[#6B7C6E] dark:text-white/60 text-xs font-bold">↓ Switch to</div>
                    <div className="flex items-center justify-between text-sm">
                      <span className="font-bold text-emerald-700 dark:text-emerald-400">{match.alt.item}</span>
                      <span className="font-bold tabular-nums text-emerald-600">{match.alt.co2} kg CO₂e</span>
                    </div>
                    {saving > 0 && (
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 mt-1">
                        ✅ Save {saving.toFixed(1)} kg CO₂e
                      </p>
                    )}
                  </div>
                </div>
              );
            })()}

            {/* Lifecycle breakdown */}
            {totalBreakdown > 0 && (
              <div className="rounded-2xl border-2 border-[#D1FAE5]/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7C6E] dark:text-white/60 mb-3">Lifecycle Breakdown</h3>
                <div className="flex h-3 w-full overflow-hidden rounded-full">
                  <div style={{ width: `${(result.breakdown.production / totalBreakdown) * 100}%` }} className="bg-[#1B4332]" title="Production" />
                  <div style={{ width: `${(result.breakdown.transport / totalBreakdown) * 100}%` }} className="bg-[#2D6A4F]" title="Transport" />
                  <div style={{ width: `${(result.breakdown.use_phase / totalBreakdown) * 100}%` }} className="bg-[#52B788]" title="Use Phase" />
                  <div style={{ width: `${(result.breakdown.disposal / totalBreakdown) * 100}%` }} className="bg-[#B7E4C7]" title="Disposal" />
                </div>
                <div className="mt-3 grid grid-cols-2 gap-2">
                  {[
                    { label: "Production", value: result.breakdown.production, color: "bg-[#1B4332]" },
                    { label: "Transport", value: result.breakdown.transport, color: "bg-[#2D6A4F]" },
                    { label: "Use Phase", value: result.breakdown.use_phase, color: "bg-[#52B788]" },
                    { label: "Disposal", value: result.breakdown.disposal, color: "bg-[#B7E4C7]" },
                  ].map((item) => (
                    <div key={item.label} className="flex items-center gap-2 text-xs">
                      <span className={`h-2.5 w-2.5 rounded-full ${item.color}`} />
                      <span className="text-[#6B7C6E] dark:text-white/50">{item.label}</span>
                      <span className="ml-auto font-bold tabular-nums">{item.value} kg</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Packaging info */}
            {result.packaging && (
              <div className="rounded-2xl border-2 border-[#D1FAE5]/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7C6E] dark:text-white/60 mb-3">📦 Packaging</h3>
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full bg-[#F0FDF4] dark:bg-[#2D6A4F]/15 px-3 py-1.5 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                    {result.packaging.type}
                  </span>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${result.packaging.recyclable ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-red-100 text-red-700 dark:bg-red-900/20 dark:text-red-400"}`}>
                    {result.packaging.recyclable ? "♻️ Recyclable" : "❌ Not Recyclable"}
                  </span>
                  <span className={`rounded-full px-3 py-1.5 text-xs font-bold ${result.packaging.biodegradable ? "bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400" : "bg-orange-100 text-orange-700 dark:bg-orange-900/20 dark:text-orange-400"}`}>
                    {result.packaging.biodegradable ? "🌱 Biodegradable" : "⚠️ Non-Biodegradable"}
                  </span>
                </div>
              </div>
            )}

            {/* Greener alternative + tip */}
            <div className="grid md:grid-cols-2 gap-3">
              <div className="rounded-2xl border-2 border-emerald-200 dark:border-emerald-900/30 bg-emerald-50 dark:bg-emerald-900/10 p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 mb-2">🌿 Greener Alternative</h3>
                <p className="font-bold text-[#1B4332] dark:text-white">{result.greener_alternative}</p>
                <p className="text-sm mt-1 text-[#6B7C6E] dark:text-white/60">{result.alternative_footprint_kg} kg CO₂e</p>
                {result.footprint_kg > result.alternative_footprint_kg && (
                  <p className="mt-2 text-xs font-bold text-emerald-600 dark:text-emerald-400">
                    ↓ Saves {(result.footprint_kg - result.alternative_footprint_kg).toFixed(1)} kg CO₂e
                  </p>
                )}
              </div>

              <div className="rounded-2xl border-2 border-[#D1FAE5]/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7C6E] dark:text-white/60 mb-2">💡 Eco Tip</h3>
                <p className="text-sm leading-relaxed text-[#1B4332] dark:text-white/80">{result.tip}</p>
              </div>
            </div>

            {/* Eco facts */}
            {result.eco_facts && result.eco_facts.length > 0 && (
              <div className="rounded-2xl border-2 border-[#D1FAE5]/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7C6E] dark:text-white/60 mb-3">📖 Did You Know?</h3>
                <div className="space-y-2">
                  {result.eco_facts.map((fact, i) => (
                    <div key={i} className="flex items-start gap-2">
                      <span className="mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-[#2D6A4F]/10 text-[10px] font-bold text-[#2D6A4F] dark:text-[#52B788]">{i + 1}</span>
                      <p className="text-sm text-[#6B7C6E] dark:text-white/60">{fact}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <Button
                onClick={addToFootprint}
                className="rounded-2xl bg-[#2D6A4F] py-3.5 text-sm font-bold text-white shadow-lg hover:bg-[#1B4332]"
              >
                ➕ Add to Carbon Log
              </Button>
              <Button
                onClick={() => {
                  if (navigator.share) {
                    navigator.share({ title: `${result.product} Carbon Footprint`, text: `${result.product}: ${result.footprint_kg} kg CO₂e (Rating: ${result.rating})` });
                  } else {
                    navigator.clipboard.writeText(`${result.product}: ${result.footprint_kg} kg CO₂e (Rating: ${result.rating})`);
                    showSettingsToast("Copied to clipboard! 📋");
                  }
                }}
                className="rounded-2xl bg-white dark:bg-white/[0.05] border-2 border-[#D1FAE5] dark:border-white/10 py-3.5 text-sm font-bold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#F0FDF4]"
              >
                📤 Share Result
              </Button>
            </div>
          </div>
        )}

        {/* ─── SCAN HISTORY ─── */}
        {history.length > 0 && !isScanning && !result && (
          <div className="rounded-2xl border-2 border-[#D1FAE5]/80 dark:border-white/[0.08] bg-white dark:bg-white/[0.03] p-5">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#6B7C6E] dark:text-white/60">📋 Scan History</h3>
              <button onClick={clearHistory} className="text-[10px] font-bold text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 transition">
                Clear all
              </button>
            </div>
            <div className="space-y-2">
              {history.slice(0, 8).map((item, i) => (
                <button
                  key={`${item.query}-${i}`}
                  onClick={() => {
                    if (item.type === "barcode") {
                      setBarcodeInput(item.query);
                      setActiveTab("barcode");
                    } else {
                      setQuery(item.query);
                      setActiveTab("search");
                    }
                    handleScan(item.query, item.type);
                  }}
                  className="flex w-full items-center gap-3 rounded-xl border border-[#D1FAE5]/60 dark:border-white/[0.06] bg-[#F8FAF5] dark:bg-white/[0.02] p-3 text-left hover:bg-[#F0FDF4] dark:hover:bg-[#2D6A4F]/10 transition"
                >
                  <span className="text-base">{item.type === "barcode" ? "📊" : "🔍"}</span>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-bold truncate">{item.product}</p>
                    <p className="text-[10px] text-[#6B7C6E] dark:text-white/60">
                      {item.footprint_kg} kg CO₂e • {new Date(item.timestamp).toLocaleDateString()}
                    </p>
                  </div>
                  <div className={cn(
                    "flex h-8 w-8 items-center justify-center rounded-lg text-xs font-black",
                    getRatingStyle(item.rating).bg,
                    getRatingStyle(item.rating).text
                  )}>
                    {item.rating}
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </section>
    </MotionPage>
  );
}
