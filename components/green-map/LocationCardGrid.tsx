"use client";

import { motion, AnimatePresence } from "framer-motion";
import { MapPin, ArrowUpRight } from "lucide-react";
import { TYPE_LABELS, TYPE_ICONS } from "./PlaceTypeFilter";
import type { EcoLocation } from "@/lib/green-map-store";

interface LocationCardGridProps {
  locations: EcoLocation[];
  selectedLocationId: number | string | null;
  onSelectLocation: (loc: EcoLocation) => void;
}

export function LocationCardGrid({
  locations,
  selectedLocationId,
  onSelectLocation,
}: LocationCardGridProps) {
  return (
    <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      <AnimatePresence mode="popLayout">
        {locations.map((loc) => (
          <motion.div
            key={loc.id}
            layout
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={{ duration: 0.15, ease: "easeOut" }}
            onClick={() => onSelectLocation(loc)}
            className={`rounded-2xl bg-white dark:bg-[#1A2F2A] border p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between cursor-pointer relative ${
              selectedLocationId === loc.id
                ? "border-[#00C896] ring-2 ring-[#00C896]/20"
                : "border-[#52B788]/20"
            }`}
          >
            {/* Badges */}
            {loc.badge === "search_result" && (
              <span className="absolute top-3 right-3 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400">
                Search result
              </span>
            )}
            {loc.badge === "pending_review" && (
              <span className="absolute top-3 right-3 rounded-full bg-amber-500/15 px-2.5 py-1 text-[10px] font-bold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                <span className="relative flex h-1.5 w-1.5">
                  <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-amber-500 opacity-75" />
                  <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-amber-500" />
                </span>
                Pending review
              </span>
            )}

            <div>
              <span className="inline-flex items-center gap-1 rounded-full bg-[#52B788]/10 px-2.5 py-1 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] mb-3">
                {TYPE_ICONS[loc.type]}
                {TYPE_LABELS[loc.type] || loc.type}
              </span>
              <h3 className="text-base font-bold leading-tight mb-2">
                {loc.name}
              </h3>
              <p className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                <MapPin size={13} /> {loc.city}
              </p>
              {loc.address && (
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500 mb-1">
                  {loc.address}
                </p>
              )}
              <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                {loc.lat.toFixed(4)}°N, {loc.lng.toFixed(4)}°E
              </p>
            </div>
            <div className="flex gap-2 mt-4">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onSelectLocation(loc);
                }}
                className="flex-1 flex items-center justify-center gap-1.5 rounded-xl bg-[#F8FAF5] dark:bg-black/20 py-2.5 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#52B788]/20 transition"
              >
                <MapPin size={14} /> View on Map
              </button>
              <a
                href={`https://maps.google.com/?q=${loc.lat},${loc.lng}`}
                target="_blank"
                rel="noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="flex items-center justify-center gap-1.5 rounded-xl bg-[#F8FAF5] dark:bg-black/20 px-3 py-2.5 text-xs font-semibold text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#52B788]/20 transition"
              >
                <ArrowUpRight size={14} />
              </a>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>

      {locations.length === 0 && (
        <div className="col-span-full py-12 text-center text-neutral-500">
          No locations found matching your filters.
        </div>
      )}
    </div>
  );
}
