"use client";

import { useState, useCallback } from "react";
import debounce from "lodash.debounce";
import { Search, X, RefreshCw } from "lucide-react";
import { useGreenMapStore } from "@/lib/green-map-store";

interface MapSearchBarProps {
  onSearchResult: (lat: number, lng: number, address: string) => void;
  onClear: () => void;
}

export function MapSearchBar({ onSearchResult, onClear }: MapSearchBarProps) {
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const setSearchResult = useGreenMapStore((s) => s.setSearchResult);
  const clearSearchResult = useGreenMapStore((s) => s.clearSearchResult);

  const doSearch = useCallback(
    debounce(async (searchQuery: string) => {
      if (!searchQuery.trim()) return;

      setLoading(true);
      setError("");

      try {
        const res = await fetch(
          `/api/geocode?address=${encodeURIComponent(searchQuery)}`
        );
        const data = await res.json();

        if (!res.ok) {
          setError(data.error || "Search failed");
          setLoading(false);
          return;
        }

        // Add search result to store
        setSearchResult({
          id: `search-${Date.now()}`,
          name: searchQuery,
          type: "search_result",
          lat: data.lat,
          lng: data.lng,
          city: "Search",
          address: data.formatted_address,
          badge: "search_result",
        });

        onSearchResult(data.lat, data.lng, data.formatted_address);
      } catch {
        setError("Network error — please try again");
      } finally {
        setLoading(false);
      }
    }, 300),
    [onSearchResult, setSearchResult]
  );

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    doSearch(query);
  };

  const handleClear = () => {
    setQuery("");
    setError("");
    clearSearchResult();
    onClear();
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Escape") {
      handleClear();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="w-full mb-3">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#52B788]/50"
        />
        <input
          type="text"
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            if (!e.target.value) handleClear();
          }}
          onKeyDown={handleKeyDown}
          placeholder="Search any place or address..."
          className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] pl-10 pr-20 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 transition placeholder:text-[#52B788]/40"
        />
        <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {query && (
            <button
              type="button"
              onClick={handleClear}
              className="rounded-full p-1.5 hover:bg-[#52B788]/10 transition"
              aria-label="Clear search"
            >
              <X size={14} className="text-neutral-400" />
            </button>
          )}
          <button
            type="submit"
            disabled={loading || !query.trim()}
            className="rounded-lg bg-[#2D6A4F] px-3 py-1.5 text-xs font-semibold text-white hover:bg-[#1B4332] disabled:opacity-50 transition"
          >
            {loading ? (
              <RefreshCw size={14} className="animate-spin" />
            ) : (
              "Search"
            )}
          </button>
        </div>
      </div>
      {error && (
        <p className="mt-1.5 text-xs text-red-600 dark:text-red-400 pl-1">
          {error}
        </p>
      )}
    </form>
  );
}
