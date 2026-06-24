"use client";

import { useRef, useEffect } from "react";
import type { AIExplanation } from "@/lib/types/carbon-twin-types";

interface ExplainSheetProps {
  isOpen: boolean;
  onClose: () => void;
  explanation: AIExplanation | null;
  loading: boolean;
}

export function ExplainSheet({ isOpen, onClose, explanation, loading }: ExplainSheetProps): JSX.Element | null {
  const sheetRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleClickOutside = (e: MouseEvent): void => {
      if (sheetRef.current && !sheetRef.current.contains(e.target as Node)) {
        onClose();
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center md:justify-center">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />

      {/* Sheet */}
      <div
        ref={sheetRef}
        className="relative w-full md:max-w-lg max-h-[70vh] overflow-y-auto rounded-t-3xl md:rounded-2xl bg-slate-900 border border-gray-700/50 p-6 animate-slide-up"
      >
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 w-8 h-8 flex items-center justify-center rounded-full bg-gray-800 text-gray-400 hover:text-white transition-colors"
        >
          ✕
        </button>

        {loading ? (
          <div className="space-y-3 py-4">
            <div className="animate-pulse h-6 bg-gray-800 rounded w-3/4" />
            <div className="animate-pulse h-4 bg-gray-800 rounded w-1/2" />
            <div className="animate-pulse h-16 bg-gray-800 rounded w-full mt-4" />
          </div>
        ) : explanation ? (
          <div className="space-y-4">
            {/* Headline */}
            <div>
              <h3 className="text-lg font-bold text-white">{explanation.headline}</h3>
              <p className="text-sm text-gray-500">{explanation.headlineHindi}</p>
            </div>

            {/* Summary */}
            <p className="text-sm text-gray-300 leading-relaxed">{explanation.summary}</p>

            {/* Factors */}
            <div className="space-y-2">
              <span className="text-xs font-medium text-gray-400 uppercase tracking-wider">Key Factors</span>
              {explanation.factors.map((f, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-gray-800/50">
                  <div className="flex items-center gap-2">
                    <span className={`text-sm ${f.direction === "positive" ? "text-red-400" : "text-green-400"}`}>
                      {f.direction === "positive" ? "↑" : "↓"}
                    </span>
                    <div>
                      <span className="text-sm text-gray-200">{f.name}</span>
                      <span className="text-xs text-gray-500 ml-1">{f.nameHindi}</span>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-300">{f.contribution.toFixed(1)} kg</span>
                    <span className="text-xs text-gray-500 ml-1">({f.percentOfTotal.toFixed(0)}%)</span>
                  </div>
                </div>
              ))}
            </div>

            {/* Recommendation */}
            <div className="rounded-xl bg-emerald-900/20 border border-emerald-700/30 p-3">
              <p className="text-sm font-medium text-emerald-400">{explanation.recommendation}</p>
              <p className="text-xs text-emerald-600 mt-1">{explanation.recommendationHindi}</p>
            </div>

            {/* Source */}
            <p className="text-xs text-gray-600 text-center">{explanation.sourceLabel}</p>
          </div>
        ) : (
          <p className="text-sm text-gray-500 text-center py-4">No explanation available.</p>
        )}
      </div>
    </div>
  );
}
