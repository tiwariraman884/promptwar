"use client";

import { useState, useEffect, useCallback, useRef, useMemo } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { GREEN_MAP_LOCATIONS, CITY_COORDS } from "@/lib/carbonData";
import { useGreenMapStore, type EcoLocation } from "@/lib/green-map-store";
import { MapPin, Plus, RefreshCw, X } from "lucide-react";

import { CityFilter } from "@/components/green-map/CityFilter";
import { MapSearchBar } from "@/components/green-map/MapSearchBar";
import { PlaceTypeFilter, TYPE_LABELS, TYPE_MARKER_COLORS } from "@/components/green-map/PlaceTypeFilter";
import { LocationCardGrid } from "@/components/green-map/LocationCardGrid";
import { SubmitDrawer } from "@/components/green-map/SubmitDrawer";
import { Toast } from "@/components/green-map/Toast";

/* ── Dark-themed map styles ── */
const DARK_MAP_STYLES: google.maps.MapTypeStyle[] = [
  { elementType: "geometry", stylers: [{ color: "#0d1f14" }] },
  { elementType: "labels.text.fill", stylers: [{ color: "#52B788" }] },
  { elementType: "labels.text.stroke", stylers: [{ color: "#0d1f14" }] },
  { featureType: "road", elementType: "geometry", stylers: [{ color: "#1a3324" }] },
  { featureType: "road", elementType: "geometry.stroke", stylers: [{ color: "#2D6A4F" }] },
  { featureType: "water", elementType: "geometry", stylers: [{ color: "#0a1a10" }] },
  { featureType: "water", elementType: "labels.text.fill", stylers: [{ color: "#2D6A4F" }] },
  { featureType: "poi", elementType: "geometry", stylers: [{ color: "#1a2f2a" }] },
  { featureType: "poi", elementType: "labels.text.fill", stylers: [{ color: "#52B788" }] },
  { featureType: "poi.park", elementType: "geometry", stylers: [{ color: "#1a3324" }] },
  { featureType: "transit", elementType: "geometry", stylers: [{ color: "#1a2f2a" }] },
  { featureType: "administrative", elementType: "geometry.stroke", stylers: [{ color: "#2D6A4F" }] },
];

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
};

/* ── SVG marker icons ── */
function createMarkerIcon(color: string, pulsing = false): google.maps.Symbol {
  return {
    path: google.maps.SymbolPath.CIRCLE,
    fillColor: color,
    fillOpacity: pulsing ? 0.9 : 0.85,
    strokeColor: "#fff",
    strokeWeight: 2,
    scale: pulsing ? 10 : 8,
  };
}

function createSearchMarkerIcon(): google.maps.Symbol {
  return {
    path: "M12 0C7.6 0 4 3.6 4 8c0 5.4 8 16 8 16s8-10.6 8-16c0-4.4-3.6-8-8-8zm0 12c-2.2 0-4-1.8-4-4s1.8-4 4-4 4 1.8 4 4-1.8 4-4 4z",
    fillColor: "#F97316",
    fillOpacity: 1,
    strokeColor: "#fff",
    strokeWeight: 1.5,
    scale: 1.8,
    anchor: new google.maps.Point(12, 24),
  };
}

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  address?: string;
}

/* ── Layer data ── */
interface LayerPin {
  id: string;
  lat: number;
  lng: number;
  name: string;
  detail: string;
  emoji: string;
}

const EV_STATIONS: LayerPin[] = [
  { id: "ev-1", lat: 29.9457, lng: 78.1642, name: "Tata Power EV – Haridwar", detail: "CCS2 + Type 2", emoji: "⚡" },
  { id: "ev-2", lat: 29.8543, lng: 77.8880, name: "EESL EV Station – Roorkee", detail: "Bharat DC", emoji: "⚡" },
  { id: "ev-3", lat: 28.6139, lng: 77.2090, name: "NTPC EV Hub – Connaught Place", detail: "CCS2 50kW", emoji: "⚡" },
];

const RECYCLE_CENTERS: LayerPin[] = [
  { id: "rc-1", lat: 29.9550, lng: 78.1620, name: "Haridwar Municipal Recycling", detail: "Paper, Plastic, Glass", emoji: "♻️" },
  { id: "rc-2", lat: 29.8600, lng: 77.8950, name: "Kabad‑Se‑Jugaad – Roorkee", detail: "E-waste, Metal", emoji: "♻️" },
  { id: "rc-3", lat: 28.5355, lng: 77.3910, name: "Noida Dry Waste Center", detail: "Paper, Cardboard, Plastic", emoji: "♻️" },
];

export default function GreenMapPage() {
  /* ── Store ── */
  const selectedCity = useGreenMapStore((s) => s.selectedCity);
  const _setSelectedCity = useGreenMapStore((s) => s.setSelectedCity);
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

  /* ── Refs for map and markers ── */
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const searchMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const layerMarkersRef = useRef<google.maps.Marker[]>([]);
  const routeRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  /* ── Load Google Maps ── */
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

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

    // Prepend search result if it exists
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

  /* ── Clear all markers ── */
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  }, []);

  /* ── Plot markers for filtered locations ── */
  const plotMarkers = useCallback(() => {
    if (!mapRef.current) return;
    clearMarkers();

    filteredLocations.forEach((loc) => {
      if (loc.badge === "search_result") return; // handled separately

      const color =
        TYPE_MARKER_COLORS[loc.type] || "#52B788";
      const isPending = loc.badge === "pending_review";

      const marker = new google.maps.Marker({
        position: { lat: loc.lat, lng: loc.lng },
        map: mapRef.current!,
        icon: createMarkerIcon(isPending ? "#F59E0B" : color, isPending),
        title: loc.name,
        animation: isPending ? google.maps.Animation.BOUNCE : undefined,
      });

      marker.addListener("click", () => {
        setSelectedLocation(loc);
        if (mapRef.current) {
          mapRef.current.panTo({ lat: loc.lat, lng: loc.lng });
          mapRef.current.setZoom(15);
        }
      });

      // Stop bouncing after 2 seconds for pending markers
      if (isPending) {
        setTimeout(() => marker.setAnimation(null), 2000);
      }

      markersRef.current.push(marker);
    });
  }, [filteredLocations, clearMarkers]);

  /* ── Replot markers when filter changes ── */
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      plotMarkers();
    }
  }, [isLoaded, plotMarkers]);

  /* ── Plot/unplot layer markers (EV, Recycling) ── */
  useEffect(() => {
    // Clear old layer markers
    layerMarkersRef.current.forEach((m) => m.setMap(null));
    layerMarkersRef.current = [];

    if (!isLoaded || !mapRef.current) return;

    const plotLayer = (pins: LayerPin[], color: string) => {
      pins.forEach((pin) => {
        const marker = new google.maps.Marker({
          position: { lat: pin.lat, lng: pin.lng },
          map: mapRef.current!,
          icon: createMarkerIcon(color),
          title: `${pin.emoji} ${pin.name}`,
        });

        marker.addListener("click", () => {
          if (infoWindowRef.current) infoWindowRef.current.close();
          const iw = new google.maps.InfoWindow({
            content: `<div style="color:#1B4332;font-size:13px;padding:4px;max-width:220px">
              <strong>${pin.emoji} ${pin.name}</strong><br/>
              <span style="font-size:11px;color:#6B7C6E">${pin.detail}</span><br/>
              <a href="https://maps.google.com/?q=${pin.lat},${pin.lng}" target="_blank" style="font-size:11px;color:#2D6A4F">Open in Maps →</a>
            </div>`,
          });
          iw.open(mapRef.current!, marker);
          infoWindowRef.current = iw;
        });

        layerMarkersRef.current.push(marker);
      });
    };

    if (showEV) plotLayer(EV_STATIONS, "#F59E0B");
    if (showRecycle) plotLayer(RECYCLE_CENTERS, "#22C55E");
  }, [isLoaded, showEV, showRecycle]);

  /* ── Carbon-Saving Route toggle ── */
  useEffect(() => {
    if (!showRoute) {
      if (routeRendererRef.current) {
        routeRendererRef.current.setMap(null);
        routeRendererRef.current = null;
      }
      setRouteError("");
      return;
    }

    if (!isLoaded || !mapRef.current) return;

    // Requires Directions API key — graceful fallback
    if (!window.google?.maps?.DirectionsService) {
      setRouteError("⚠️ Route comparison unavailable — Directions API not loaded.");
      return;
    }

    const service = new google.maps.DirectionsService();
    const renderer = new google.maps.DirectionsRenderer({
      map: mapRef.current,
      polylineOptions: { strokeColor: "#22C55E", strokeWeight: 5, strokeOpacity: 0.8 },
      suppressMarkers: true,
    });
    routeRendererRef.current = renderer;

    // Use user's location or city center as origin, nearest EV station as destination
    const origin = userLocation
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : CITY_COORDS[selectedCity] || CITY_COORDS.Delhi;
    const dest = EV_STATIONS[0]; // nearest fallback

    service.route(
      {
        origin,
        destination: { lat: dest.lat, lng: dest.lng },
        travelMode: google.maps.TravelMode.BICYCLING,
      },
      (result, status) => {
        if (status === google.maps.DirectionsStatus.OK && result) {
          renderer.setDirections(result);
          setRouteError("");
        } else {
          setRouteError("⚠️ Route comparison unavailable — try a different location.");
        }
      }
    );
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoaded, showRoute, userLocation]);

  /* ── Pan to city when city changes ── */
  useEffect(() => {
    if (!mapRef.current) return;
    const coords = CITY_COORDS[selectedCity];
    if (coords) {
      mapRef.current.panTo(coords);
      mapRef.current.setZoom(12);
    }
  }, [selectedCity]);

  /* ── Pan to selected location ── */
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;
    mapRef.current.panTo({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    mapRef.current.setZoom(15);
  }, [selectedLocation]);

  /* ── Map load callback ── */
  const onMapLoad = useCallback(
    (map: google.maps.Map) => {
      mapRef.current = map;
      const coords = CITY_COORDS[selectedCity] || CITY_COORDS.Delhi;
      map.setCenter(coords);
      map.setZoom(12);
      plotMarkers();
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [selectedCity]
  );

  /* ── Handle city pan from CityFilter ── */
  const handlePanToCity = useCallback(
    (lat: number, lng: number) => {
      if (!mapRef.current) return;
      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(12);
      setSelectedLocation(null);
    },
    []
  );

  /* ── Handle search result ── */
  const handleSearchResult = useCallback(
    (lat: number, lng: number, address: string) => {
      if (!mapRef.current) return;

      // Remove previous search marker
      if (searchMarkerRef.current) {
        searchMarkerRef.current.setMap(null);
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
      }

      mapRef.current.panTo({ lat, lng });
      mapRef.current.setZoom(15);

      // Drop search marker
      const marker = new google.maps.Marker({
        position: { lat, lng },
        map: mapRef.current,
        icon: createSearchMarkerIcon(),
        animation: google.maps.Animation.DROP,
        title: address,
      });
      searchMarkerRef.current = marker;

      // Open InfoWindow
      const iw = new google.maps.InfoWindow({
        content: `<div style="color:#1B4332;font-size:13px;font-weight:600;max-width:220px;padding:4px">${address}</div>`,
      });
      iw.open(mapRef.current, marker);
      infoWindowRef.current = iw;
    },
    []
  );

  /* ── Clear search ── */
  const handleClearSearch = useCallback(() => {
    if (searchMarkerRef.current) {
      searchMarkerRef.current.setMap(null);
      searchMarkerRef.current = null;
    }
    if (infoWindowRef.current) {
      infoWindowRef.current.close();
      infoWindowRef.current = null;
    }
    clearSearchResult();

    // Reset to city view
    if (mapRef.current) {
      const coords = CITY_COORDS[selectedCity] || CITY_COORDS.Delhi;
      mapRef.current.panTo(coords);
      mapRef.current.setZoom(12);
    }
  }, [selectedCity, clearSearchResult]);

  /* ── Handle new submitted marker ── */
  const handleNewMarker = useCallback((lat: number, lng: number) => {
    if (!mapRef.current) return;

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: mapRef.current,
      icon: createMarkerIcon("#F59E0B", true),
      animation: google.maps.Animation.DROP,
      title: "Submitted location",
    });

    setTimeout(() => marker.setAnimation(null), 3000);
    markersRef.current.push(marker);

    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(14);
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

        // Reverse geocode
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
          // Geocoding failed
        }

        setUserLocation(loc);
        setLocating(false);

        // Pan map to user location
        if (mapRef.current) {
          mapRef.current.panTo({ lat: loc.lat, lng: loc.lng });
          mapRef.current.setZoom(14);
        }
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

  /* ── Default center ── */
  const defaultCenter = CITY_COORDS[selectedCity] || CITY_COORDS.Delhi;

  /* ── Gate map reveal: defer GoogleMap init until user requests it ── */
  const [mapActivated, setMapActivated] = useState(false)

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5] flex flex-col md:flex-row pb-20 md:pb-0">
      {/* Toast */}
      <Toast />

      {/* Sidebar Filters */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#2D6A4F]/20 p-4 md:p-6 flex flex-col gap-5 overflow-y-auto">
        {/* Feature 1: City Filter */}
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

        {/* Feature 3: Place Type Filter */}
        <PlaceTypeFilter />

        {/* Feature 4: Submit button */}
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
        {/* Feature 2: Search Bar */}
        <MapSearchBar
          onSearchResult={handleSearchResult}
          onClear={handleClearSearch}
        />

        {/* Interactive Google Map — deferred until user activates */}
        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-[#52B788]/20 shadow-md relative">
          {!mapActivated ? (
            /* Placeholder: avoids loading Google Maps JS on page init */
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
          ) : isLoaded ? (
            <GoogleMap
              mapContainerStyle={MAP_CONTAINER_STYLE}
              center={defaultCenter}
              zoom={12}
              onLoad={onMapLoad}
              options={{
                styles: DARK_MAP_STYLES,
                disableDefaultUI: false,
                zoomControl: true,
                mapTypeControl: false,
                streetViewControl: false,
                fullscreenControl: true,
                backgroundColor: "#0d1f14",
              }}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-[#0d1f14]">
              <div className="flex flex-col items-center gap-3">
                <RefreshCw size={24} className="animate-spin text-[#52B788]" />
                <span className="text-sm text-[#52B788]/70">Loading map…</span>
              </div>
            </div>
          )}

          {/* Map overlay — tooltip */}
          {mapActivated && (
            <div className="absolute top-3 left-3 flex gap-2 pointer-events-none">
              <span className="rounded-full bg-[#0d1f1a]/80 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold text-white flex items-center gap-1.5">
                <MapPin size={12} className="text-[#00C896]" />
                {selectedLocation
                  ? selectedLocation.name.split("—")[0].trim()
                  : tooltipText}
              </span>
            </div>
          )}

          {selectedLocation && (
            <button
              onClick={() => setSelectedLocation(null)}
              className="absolute top-3 right-3 rounded-full bg-[#0d1f1a]/80 backdrop-blur-sm p-1.5 text-white hover:bg-[#0d1f1a] transition"
              aria-label="Clear selection"
            >
              <X size={14} />
            </button>
          )}

          {userLocation && !selectedLocation && (
            <div className="absolute bottom-3 left-3 rounded-full bg-[#0d1f1a]/80 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold text-[#00C896] flex items-center gap-1.5 pointer-events-none">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C896] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00C896]" />
              </span>
              You are here
            </div>
          )}
        </div>

        {/* Feature 3: Animated Card Grid */}
        <LocationCardGrid
          locations={filteredLocations}
          selectedLocationId={selectedLocation?.id ?? null}
          onSelectLocation={handleSelectLocation}
        />
      </div>

      {/* Feature 4: Submit Drawer */}
      <SubmitDrawer onNewMarker={handleNewMarker} />
    </div>
  );
}
