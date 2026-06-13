"use client";

import { useGreenMapStore } from "@/lib/green-map-store";
import type { ReactElement } from "react";
import {
  IconEvCharging,
  IconTransit,
  IconComposting,
  IconEcoStore,
  IconUrbanGarden,
  IconSolar,
  IconRecycling,
} from "@/components/icons/EcoIcons";

export const TYPE_LABELS: Record<string, string> = {
  ev_charging: "EV Charging",
  public_transit: "Public Transit",
  composting: "Composting Hub",
  eco_store: "Eco Store",
  urban_garden: "Community Garden",
  solar_facility: "Solar Facility",
  recycling: "Recycling Center",
};

export const TYPE_ICONS: Record<string, ReactElement> = {
  ev_charging:    <IconEvCharging size={14} />,
  public_transit: <IconTransit size={14} />,
  composting:     <IconComposting size={14} />,
  eco_store:      <IconEcoStore size={14} />,
  urban_garden:   <IconUrbanGarden size={14} />,
  solar_facility: <IconSolar size={14} />,
  recycling:      <IconRecycling size={14} />,
};

export const TYPE_MARKER_COLORS: Record<string, string> = {
  ev_charging:    "#14B8A6", // teal
  public_transit: "#3B82F6", // blue
  composting:     "#F97316", // orange
  eco_store:      "#22C55E", // green
  urban_garden:   "#84CC16", // lime
  solar_facility: "#EAB308", // yellow
  recycling:      "#A855F7", // purple
};

const ALL_TYPES = [
  "All",
  "ev_charging",
  "public_transit",
  "composting",
  "eco_store",
  "urban_garden",
  "solar_facility",
  "recycling",
];

export function PlaceTypeFilter() {
  const selectedType = useGreenMapStore((s) => s.selectedType);
  const setSelectedType = useGreenMapStore((s) => s.setSelectedType);

  return (
    <div>
      <h2 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-3">
        Place Type
      </h2>
      <div className="flex overflow-x-auto md:flex-wrap gap-2 pb-2 md:pb-0 hide-scrollbar">
        {ALL_TYPES.map((type) => (
          <button
            key={type}
            onClick={() => setSelectedType(type)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition flex items-center gap-1.5 ${
              selectedType === type
                ? "bg-[#52B788] text-[#1B4332]"
                : "bg-white dark:bg-[#1A2F2A] border border-[#52B788]/30 hover:bg-[#52B788]/10"
            }`}
          >
            {type !== "All" && TYPE_ICONS[type]}
            {type === "All" ? "All Types" : TYPE_LABELS[type] || type}
          </button>
        ))}
      </div>
    </div>
  );
}
