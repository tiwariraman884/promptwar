"use client";

import { useState, useMemo, useCallback } from "react";
import debounce from "lodash.debounce";
import { Navigation, RefreshCw, Search } from "lucide-react";
import { CITY_COORDS } from "@/lib/carbonData";
import { useGreenMapStore } from "@/lib/green-map-store";

const ALL_CITIES = Object.keys(CITY_COORDS);

interface CityFilterProps {
  onPanToCity: (lat: number, lng: number) => void;
  onNearMe: () => void;
  locating: boolean;
}

export function CityFilter({ onPanToCity, onNearMe, locating }: CityFilterProps) {
  const selectedCity = useGreenMapStore((s) => s.selectedCity);
  const setSelectedCity = useGreenMapStore((s) => s.setSelectedCity);
  const [searchQuery, setSearchQuery] = useState("");
  const [filteredCities, setFilteredCities] = useState<string[]>(ALL_CITIES);

  // Debounced filter
  const debouncedFilter = useMemo(
    () =>
      debounce((query: string) => {
        if (!query.trim()) {
          setFilteredCities(ALL_CITIES);
          return;
        }
        const q = query.toLowerCase();
        const matches = ALL_CITIES.filter((city) =>
          city.toLowerCase().includes(q)
        );
        setFilteredCities(matches);

        // Auto-select if exact match
        const exactMatch = ALL_CITIES.find(
          (city) => city.toLowerCase() === q
        );
        if (exactMatch) {
          handleCitySelect(exactMatch);
        }
      }, 300),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  const handleCitySelect = useCallback(
    (city: string) => {
      setSelectedCity(city);
      const coords = CITY_COORDS[city];
      if (coords) {
        onPanToCity(coords.lat, coords.lng);
      }
    },
    [setSelectedCity, onPanToCity]
  );

  const handleSearchChange = (value: string) => {
    setSearchQuery(value);
    debouncedFilter(value);
  };

  return (
    <div>
      <h2 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-3">
        City
      </h2>

      {/* Search input */}
      <div className="relative mb-3">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#52B788]/50"
        />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => handleSearchChange(e.target.value)}
          placeholder="Search city..."
          className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] pl-9 pr-4 py-2 text-sm focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 transition placeholder:text-[#52B788]/40"
        />
      </div>

      {/* Horizontally scrollable chip row */}
      <div className="flex overflow-x-auto gap-2 pb-2 hide-scrollbar">
        {filteredCities.map((city) => (
          <button
            key={city}
            onClick={() => handleCitySelect(city)}
            className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
              selectedCity === city
                ? "bg-[#2D6A4F] text-white"
                : "bg-white dark:bg-[#1A2F2A] border border-[#52B788]/30 hover:bg-[#52B788]/10"
            }`}
          >
            {city}
          </button>
        ))}

        {/* Near me chip */}
        <button
          onClick={onNearMe}
          disabled={locating}
          className="whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium bg-white dark:bg-[#1A2F2A] border border-[#52B788]/30 hover:bg-[#52B788]/10 transition flex items-center gap-1.5 disabled:opacity-50"
        >
          {locating ? (
            <RefreshCw size={14} className="animate-spin" />
          ) : (
            <Navigation size={14} />
          )}
          {locating ? "Locating…" : "Near me"}
        </button>

        {/* No results */}
        {filteredCities.length === 0 && (
          <span className="whitespace-nowrap text-sm text-neutral-400 dark:text-neutral-500 px-2 py-2">
            No cities found for &quot;{searchQuery}&quot;
          </span>
        )}
      </div>
    </div>
  );
}
