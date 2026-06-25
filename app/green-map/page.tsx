"use client";

import { useState, useCallback, useMemo } from "react";
import dynamic from "next/dynamic";
import { GREEN_MAP_LOCATIONS } from "@/lib/carbonData";
import { useGreenMapStore, type EcoLocation } from "@/lib/green-map-store";
import { MapPin, Plus, RefreshCw, X } from "lucide-react";

import { CityFilter } from "@/components/green-map/CityFilter";
import { MapSearchBar } from "@/components/green-map/MapSearchBar";
import { PlaceTypeFilter, TYPE_LABELS } from "@/components/green-map/PlaceTypeFilter";
import { LocationCardGrid } from "@/components/green-map/LocationCardGrid";
import { SubmitDrawer } from "@/components/green-map/SubmitDrawer";
import { Toast } from "@/components/green-map/Toast";

// Dynamically import the Google Maps wrapper to unbundle maps SDK from initial page load.
const GoogleMapWrapper = dynamic(
  () => import("@/components/green-map/GoogleMapWrapper"),
  {
    ssr: false,
    loading: () => (
      <div className="w-full h-full flex items-center justify-center bg-[#0d1f14]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-[#52B788]" />
          <span className="text-sm text-[#52B788]/70">Loading map bundle…</span>
        </div>
      </div>
    ),
  }
);

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  address?: string;
}

export default function GreenMapPage() {
  /* ── Store ── */
  const selectedCity = useGreenMapStore((s) => s.selectedCity);
  const selectedType = useGreenMapStore((s) => s.selectedType);
  const searchResult = useGreenMapStore((s) => s.searchResult);
  const clearSearchResult = useGreenMapStore((s) => s.clearSearchResult);
  const submittedLocations = useGreenMapStore((s) => s.submittedLocations);
  const setDrawerOpen = useGreenMapStore((s) => s.setDrawerOpen);
  const showToast = useGreenMapStore((s) => s.showToast);

  /* ── Local state ── */
  const [selectedLocation, setSelectedLocation] = useState<EcoLocation | null>(null);
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");
  const [showEV, setShowEV] = useState(false);
  const [showRecycle, setShowRecycle] = useState(false);
  const [showRoute, setShowRoute] = useState(false);
  const [routeError, setRouteError] = useState("");
  const [mapActivated, setMapActivated] = useState(false);
  const [mapLoaded, setMapLoaded] = useState(false);

  // Declarative target coordinate pattern for custom submissions
  const [newSubmittedMarker, setNewSubmittedMarker] = useState<{ lat: number; lng: number } | null>(null);

  /* ── Filtered locations ── */
  const allLocations = useMemo(() => {
    const base = GREEN_MAP_LOCATIONS.map((loc) => ({
      ...loc,
      id: loc.id,
    })) as EcoLocation[];
    return [...submittedLocations, ...base];
  }, [submittedLocations]);

  const filteredLocations = useMemo(() => {
    let locs = allLocations.filter((loc) => {
      if (loc.badge === "search_result") return false;
      if (loc.city !== selectedCity) return false;
      if (selectedType !== "All" && loc.type !== selectedType) return false;
      return true;
    });

    if (searchResult) {
      locs = [searchResult, ...locs];
    }

    return locs;
  }, [allLocations, selectedCity, selectedType, searchResult]);

  /* ── Map tooltip text ── */
  const tooltipText = useMemo(() => {
    const cityLocs = allLocations.filter(
      (l) => l.city === selectedCity && l.badge !== "search_result"
    );
    if (selectedType === "All") {
      return `${selectedCity} — ${cityLocs.length} spots`;
    }
    const typeLocs = cityLocs.filter((l) => l.type === selectedType);
    const label = TYPE_LABELS[selectedType] || selectedType;
    return `${selectedCity} — ${typeLocs.length} ${label} spots`;
  }, [allLocations, selectedCity, selectedType]);

  /* ── Handle city pan from CityFilter ── */
  const handlePanToCity = useCallback((_lat: number, _lng: number) => {
    setSelectedLocation(null);
  }, []);

  /* ── Handle search result ── */
  const handleSearchResult = useCallback((_lat: number, _lng: number, _address: string) => {
    // Declared inside searchResult prop to map wrapper
  }, []);

  /* ── Clear search ── */
  const handleClearSearch = useCallback(() => {
    clearSearchResult();
    setSelectedLocation(null);
  }, [clearSearchResult]);

  /* ── Handle new submitted marker ── */
  const handleNewMarker = useCallback((lat: number, lng: number) => {
    setNewSubmittedMarker({ lat, lng });
  }, []);

  /* ── Live Location ── */
  const requestLocation = useCallback(() => {
    if (!navigator.geolocation) {
      setLocationError("Geolocation is not supported by your browser.");
      return;
    }

    setLocating(true);
    setLocationError("");

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const loc: UserLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
          accuracy: position.coords.accuracy,
        };

        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?lat=${loc.lat}&lon=${loc.lng}&format=json&addressdetails=1`,
            { headers: { "Accept-Language": "en" } }
          );
          const data = await res.json();
          if (data.display_name) {
            loc.address = data.display_name;
          }
        } catch {
          // ignore geocode error
        }

        setUserLocation(loc);
        setLocating(false);
      },
      (err) => {
        setLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError("Location permission denied.");
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable.");
            break;
          case err.TIMEOUT:
            setLocationError("Location request timed out.");
            break;
          default:
            setLocationError("An unknown error occurred.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, []);

  const handleNearMe = () => {
    requestLocation();
    showToast("📍 Getting your live location…");
  };

  /* ── Handle card click ── */
  const handleSelectLocation = useCallback((loc: EcoLocation) => {
    setSelectedLocation(loc);
  }, []);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5] flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Toast */}
      <Toast />

      {/* Sidebar Filters */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#2D6A4F]/20 p-4 md:p-6 flex flex-col gap-5 overflow-y-auto">
        <CityFilter
          onPanToCity={handlePanToCity}
          onNearMe={handleNearMe}
          locating={locating}
        />

        {/* Live location banner */}
        {userLocation && (
          <div className="rounded-xl border border-[#52B788]/30 bg-[#52B788]/5 dark:bg-[#52B788]/10 px-3 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C896] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00C896]" />
              </span>
              <span className="text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">
                Live Location
              </span>
            </div>
            <p className="text-[11px] text-[#1B4332]/70 dark:text-white/60 leading-relaxed">
              {userLocation.address
                ? userLocation.address.split(",").slice(0, 3).join(",")
                : `${userLocation.lat.toFixed(4)}°N, ${userLocation.lng.toFixed(4)}°E`}
            </p>
            <p className="text-[10px] text-[#1B4332]/70 dark:text-white/60 mt-0.5">
              Accuracy: ±{Math.round(userLocation.accuracy)}m
            </p>
          </div>
        )}

        {locationError && (
          <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
            {locationError}
          </div>
        )}

        {/* ── Layer Toggles ── */}
        <div className="rounded-xl border border-[#52B788]/20 bg-[#F0FDF4] dark:bg-[#2D6A4F]/10 p-3 space-y-2">
          <p className="text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] uppercase tracking-wider">
            Map Layers / मैप लेयर
          </p>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showEV}
              onChange={() => setShowEV((v) => !v)}
              className="h-4 w-4 rounded border-[#2D6A4F] text-[#2D6A4F] focus:ring-[#52B788]"
            />
            <span className="text-sm font-semibold">⚡ EV Charging Stations</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showRecycle}
              onChange={() => setShowRecycle((v) => !v)}
              className="h-4 w-4 rounded border-[#2D6A4F] text-[#2D6A4F] focus:ring-[#52B788]"
            />
            <span className="text-sm font-semibold">♻️ Recycling Centers</span>
          </label>
          <label className="flex items-center gap-2 cursor-pointer">
            <input
              type="checkbox"
              checked={showRoute}
              onChange={() => setShowRoute((v) => !v)}
              className="h-4 w-4 rounded border-[#2D6A4F] text-[#2D6A4F] focus:ring-[#52B788]"
            />
            <span className="text-sm font-semibold">🚲 Carbon-Saving Route</span>
          </label>
          {routeError && (
            <p className="text-[10px] text-amber-600 dark:text-amber-400">{routeError}</p>
          )}
        </div>

        <PlaceTypeFilter />

        <button
          onClick={() => setDrawerOpen(true)}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-3 text-sm font-bold text-white hover:bg-[#1B4332] transition"
        >
          <Plus size={18} />
          Submit a location
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 md:p-6 gap-5 h-full overflow-y-auto">
        <MapSearchBar
          onSearchResult={handleSearchResult}
          onClear={handleClearSearch}
        />

        {/* Dynamic map viewport */}
        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-[#52B788]/20 shadow-md relative">
          {!mapActivated ? (
            <div className="w-full h-full flex flex-col items-center justify-center bg-[#0d1f14] gap-4">
              <MapPin size={36} className="text-[#52B788]" />
              <p className="text-sm text-[#52B788]/80 text-center px-4">
                Interactive map ready — tap to load
              </p>
              <button
                onClick={() => setMapActivated(true)}
                className="rounded-full bg-[#2D6A4F] px-5 py-2 text-sm font-bold text-white hover:bg-[#1B4332] transition"
              >
                🗺️ Load Green Map
              </button>
            </div>
          ) : (
            <GoogleMapWrapper
              selectedCity={selectedCity}
              selectedType={selectedType}
              searchResult={searchResult}
              filteredLocations={filteredLocations}
              selectedLocation={selectedLocation}
              setSelectedLocation={setSelectedLocation}
              userLocation={userLocation}
              showEV={showEV}
              showRecycle={showRecycle}
              showRoute={showRoute}
              routeError={routeError}
              setRouteError={setRouteError}
              newSubmittedMarker={newSubmittedMarker}
              setMapLoaded={setMapLoaded}
            />
          )}

          {/* Map tooltip overlay */}
          {mapActivated && mapLoaded && (
            <div className="absolute top-3 left-3 flex gap-2 pointer-events-none z-10">
              <span className="rounded-full bg-[#0d1f1a]/80 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold text-white flex items-center gap-1.5">
                <MapPin size={12} className="text-[#00C896]" />
                {selectedLocation
                  ? selectedLocation.name.split("—")[0].trim()
                  : tooltipText}
              </span>
            </div>
          )}

          {selectedLocation && mapActivated && (
            <button
              onClick={() => setSelectedLocation(null)}
              className="absolute top-3 right-3 rounded-full bg-[#0d1f1a]/80 backdrop-blur-sm p-1.5 text-white hover:bg-[#0d1f1a] transition z-10"
              aria-label="Clear selection"
            >
              <X size={14} />
            </button>
          )}

          {userLocation && !selectedLocation && mapActivated && mapLoaded && (
            <div className="absolute bottom-3 left-3 rounded-full bg-[#0d1f1a]/80 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold text-[#00C896] flex items-center gap-1.5 pointer-events-none z-10">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C896] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00C896]" />
              </span>
              You are here
            </div>
          )}
        </div>

        <LocationCardGrid
          locations={filteredLocations}
          selectedLocationId={selectedLocation?.id ?? null}
          onSelectLocation={handleSelectLocation}
        />
      </div>

      <SubmitDrawer onNewMarker={handleNewMarker} />
    </div>
  );
}
