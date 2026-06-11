"use client";

import { useState, useEffect, useCallback } from "react";
import { GREEN_MAP_LOCATIONS } from "@/lib/carbonData";
import { MapPin, Navigation, Plus, Target, RefreshCw, X, ArrowUpRight } from "lucide-react";
import {
  IconEvCharging,
  IconTransit,
  IconComposting,
  IconEcoStore,
  IconUrbanGarden,
  IconSolar,
  IconRecycling,
} from "@/components/icons/EcoIcons";
import type { ReactElement } from "react";

const TYPE_LABELS: Record<string, string> = {
  ev_charging: "EV Charging",
  public_transit: "Public Transit",
  composting: "Composting Hub",
  eco_store: "Eco Store",
  urban_garden: "Community Garden",
  solar_facility: "Solar Facility",
  recycling: "Recycling Center",
};

const TYPE_ICONS: Record<string, ReactElement> = {
  ev_charging:    <IconEvCharging size={14} />,
  public_transit: <IconTransit size={14} />,
  composting:     <IconComposting size={14} />,
  eco_store:      <IconEcoStore size={14} />,
  urban_garden:   <IconUrbanGarden size={14} />,
  solar_facility: <IconSolar size={14} />,
  recycling:      <IconRecycling size={14} />,
};

/* City center coordinates for map default views */
const CITY_CENTERS: Record<string, { lat: number; lng: number }> = {
  Delhi:     { lat: 28.6139, lng: 77.2090 },
  Mumbai:    { lat: 19.0760, lng: 72.8777 },
  Bengaluru: { lat: 12.9716, lng: 77.5946 },
  Haridwar:  { lat: 29.9457, lng: 78.1642 },
};

interface UserLocation {
  lat: number;
  lng: number;
  accuracy: number;
  address?: string;
}

export default function GreenMapPage() {
  const [selectedCity, setSelectedCity] = useState<string>("Delhi");
  const [selectedType, setSelectedType] = useState<string>("All");
  const [showModal, setShowModal] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [selectedLocation, setSelectedLocation] = useState<typeof GREEN_MAP_LOCATIONS[0] | null>(null);

  // Live location state
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locating, setLocating] = useState(false);
  const [locationError, setLocationError] = useState("");

  // Submit form state
  const [submitName, setSubmitName] = useState("");
  const [submitType, setSubmitType] = useState("ev_charging");
  const [submitAddress, setSubmitAddress] = useState("");
  const [useMyLocation, setUseMyLocation] = useState(false);

  const cities = Array.from(new Set(GREEN_MAP_LOCATIONS.map((loc) => loc.city)));
  const types = ["All", ...Array.from(new Set(GREEN_MAP_LOCATIONS.map((loc) => loc.type)))];

  const filteredLocations = GREEN_MAP_LOCATIONS.filter((loc) => {
    if (loc.city !== selectedCity) return false;
    if (selectedType !== "All" && loc.type !== selectedType) return false;
    return true;
  });

  /* ── Live Location Tracking ── */
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

        // Reverse geocode using Nominatim (free, no API key)
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
          // Geocoding failed — still have coordinates
        }

        setUserLocation(loc);
        setLocating(false);

        if (useMyLocation) {
          setSubmitAddress(`${loc.lat.toFixed(6)}, ${loc.lng.toFixed(6)}`);
        }
      },
      (err) => {
        setLocating(false);
        switch (err.code) {
          case err.PERMISSION_DENIED:
            setLocationError("Location permission denied. Please allow access in your browser settings.");
            break;
          case err.POSITION_UNAVAILABLE:
            setLocationError("Location information unavailable.");
            break;
          case err.TIMEOUT:
            setLocationError("Location request timed out. Please try again.");
            break;
          default:
            setLocationError("An unknown error occurred.");
        }
      },
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 60000 }
    );
  }, [useMyLocation]);

  const handleNearMe = () => {
    requestLocation();
    showToast("📍 Getting your live location…");
  };

  /* ── Map URL builder ── */
  const getMapEmbedUrl = () => {
    if (selectedLocation) {
      return `https://maps.google.com/maps?q=${selectedLocation.lat},${selectedLocation.lng}&z=16&output=embed`;
    }
    if (userLocation) {
      return `https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=15&output=embed`;
    }
    const center = CITY_CENTERS[selectedCity] || CITY_CENTERS.Delhi;
    // Build query with all locations for this city
    const query = `eco+green+sustainable+${selectedCity}+India`;
    return `https://maps.google.com/maps?q=${query}&ll=${center.lat},${center.lng}&z=13&output=embed`;
  };

  /* ── Toast ── */
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleSubmitLocation = (e: React.FormEvent) => {
    e.preventDefault();
    setShowModal(false);
    showToast("✅ Thanks! We'll review your submission.");
    setSubmitName("");
    setSubmitAddress("");
    setSubmitType("ev_charging");
    setUseMyLocation(false);
  };

  // When "Use my location" is toggled in the modal
  useEffect(() => {
    if (useMyLocation && !userLocation) {
      requestLocation();
    }
    if (useMyLocation && userLocation) {
      setSubmitAddress(`${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`);
    }
  }, [useMyLocation, userLocation, requestLocation]);

  return (
    <div className="min-h-[calc(100vh-4rem)] bg-[#F8FAF5] dark:bg-[#0B1815] text-[#1B4332] dark:text-[#F8FAF5] flex flex-col md:flex-row">
      
      {/* Toast Notification */}
      {toastMessage && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 rounded-full bg-[#2D6A4F] px-6 py-3 text-sm font-bold text-white shadow-lg animate-in fade-in slide-in-from-top-5">
          {toastMessage}
        </div>
      )}

      {/* Sidebar Filters */}
      <div className="w-full md:w-80 border-b md:border-b-0 md:border-r border-[#2D6A4F]/20 p-4 md:p-6 flex flex-col gap-5 overflow-y-auto">
        
        <div>
          <h2 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-3">City</h2>
          <div className="flex flex-wrap gap-2">
            {cities.map((city) => (
              <button
                key={city}
                onClick={() => { setSelectedCity(city); setSelectedLocation(null); }}
                className={`rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedCity === city
                    ? "bg-[#2D6A4F] text-white"
                    : "bg-white dark:bg-[#1A2F2A] border border-[#52B788]/30 hover:bg-[#52B788]/10"
                }`}
              >
                {city}
              </button>
            ))}
            <button
              onClick={handleNearMe}
              disabled={locating}
              className="rounded-full px-4 py-2 text-sm font-medium bg-white dark:bg-[#1A2F2A] border border-[#52B788]/30 hover:bg-[#52B788]/10 transition flex items-center gap-1.5 disabled:opacity-50"
            >
              {locating ? <RefreshCw size={14} className="animate-spin" /> : <Navigation size={14} />}
              {locating ? "Locating…" : "Near me"}
            </button>
          </div>
        </div>

        {/* Live location banner */}
        {userLocation && (
          <div className="rounded-xl border border-[#52B788]/30 bg-[#52B788]/5 dark:bg-[#52B788]/10 px-3 py-2.5">
            <div className="flex items-center gap-2 mb-1">
              <span className="relative flex h-2 w-2">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C896] opacity-75" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-[#00C896]" />
              </span>
              <span className="text-xs font-bold text-[#2D6A4F] dark:text-[#52B788]">Live Location</span>
            </div>
            <p className="text-[11px] text-[#1B4332]/70 dark:text-white/60 leading-relaxed">
              {userLocation.address
                ? userLocation.address.split(",").slice(0, 3).join(",")
                : `${userLocation.lat.toFixed(4)}°N, ${userLocation.lng.toFixed(4)}°E`
              }
            </p>
            <p className="text-[10px] text-[#1B4332]/40 dark:text-white/30 mt-0.5">
              Accuracy: ±{Math.round(userLocation.accuracy)}m
            </p>
          </div>
        )}

        {locationError && (
          <div className="rounded-xl border border-red-300 bg-red-50 dark:bg-red-900/20 px-3 py-2 text-xs text-red-600 dark:text-red-400">
            {locationError}
          </div>
        )}

        <div>
          <h2 className="text-lg font-bold text-[#2D6A4F] dark:text-[#52B788] mb-3">Place Type</h2>
          <div className="flex overflow-x-auto md:flex-wrap gap-2 pb-2 md:pb-0 hide-scrollbar">
            {types.map((type) => (
              <button
                key={type}
                onClick={() => setSelectedType(type)}
                className={`whitespace-nowrap rounded-full px-4 py-2 text-sm font-medium transition ${
                  selectedType === type
                    ? "bg-[#52B788] text-[#1B4332]"
                    : "bg-white dark:bg-[#1A2F2A] border border-[#52B788]/30 hover:bg-[#52B788]/10"
                }`}
              >
                {type === "All" ? "All Types" : TYPE_LABELS[type] || type}
              </button>
            ))}
          </div>
        </div>

        <button
          onClick={() => setShowModal(true)}
          className="mt-auto flex w-full items-center justify-center gap-2 rounded-xl bg-[#2D6A4F] py-3 text-sm font-bold text-white hover:bg-[#1B4332] transition"
        >
          <Plus size={18} />
          Submit a location
        </button>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col p-4 md:p-6 gap-5 h-full overflow-y-auto">
        
        {/* Interactive Google Map */}
        <div className="w-full h-64 md:h-80 rounded-2xl overflow-hidden border border-[#52B788]/20 shadow-md relative">
          <iframe
            title="Green Map"
            src={getMapEmbedUrl()}
            className="w-full h-full border-0"
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            allowFullScreen
          />
          {/* Map overlay controls */}
          <div className="absolute top-3 left-3 flex gap-2">
            <span className="rounded-full bg-[#0d1f1a]/80 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold text-white flex items-center gap-1.5">
              <MapPin size={12} className="text-[#00C896]" />
              {selectedLocation ? selectedLocation.name.split("—")[0].trim() : `${selectedCity} — ${filteredLocations.length} spots`}
            </span>
          </div>
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
            <div className="absolute bottom-3 left-3 rounded-full bg-[#0d1f1a]/80 backdrop-blur-sm px-3 py-1.5 text-[11px] font-bold text-[#00C896] flex items-center gap-1.5">
              <span className="relative flex h-1.5 w-1.5">
                <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C896] opacity-75" />
                <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00C896]" />
              </span>
              You are here
            </div>
          )}
        </div>

        {/* Card Grid */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filteredLocations.map((loc) => (
            <div
              key={loc.id}
              onClick={() => setSelectedLocation(loc)}
              className={`rounded-2xl bg-white dark:bg-[#1A2F2A] border p-5 shadow-sm hover:shadow-md transition flex flex-col justify-between cursor-pointer ${
                selectedLocation?.id === loc.id
                  ? "border-[#00C896] ring-2 ring-[#00C896]/20"
                  : "border-[#52B788]/20"
              }`}
            >
              <div>
                <span className="inline-flex items-center gap-1 rounded-full bg-[#52B788]/10 px-2.5 py-1 text-xs font-bold text-[#2D6A4F] dark:text-[#52B788] mb-3">
                  {TYPE_ICONS[loc.type]}
                  {TYPE_LABELS[loc.type] || loc.type}
                </span>
                <h3 className="text-base font-bold leading-tight mb-2">{loc.name}</h3>
                <p className="flex items-center gap-1 text-sm text-neutral-500 dark:text-neutral-400 mb-1">
                  <MapPin size={13} /> {loc.city}
                </p>
                <p className="text-[11px] text-neutral-400 dark:text-neutral-500">
                  {loc.lat.toFixed(4)}°N, {loc.lng.toFixed(4)}°E
                </p>
              </div>
              <div className="flex gap-2 mt-4">
                <button
                  onClick={(e) => { e.stopPropagation(); setSelectedLocation(loc); }}
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
            </div>
          ))}
          {filteredLocations.length === 0 && (
            <div className="col-span-full py-12 text-center text-neutral-500">
              No locations found matching your filters.
            </div>
          )}
        </div>
      </div>

      {/* Submit Location Modal with Live Location */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-3xl bg-white dark:bg-[#0B1815] p-6 shadow-2xl border border-[#52B788]/20 animate-in zoom-in-95">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-xl font-bold text-[#2D6A4F] dark:text-[#52B788]">Submit a new location</h2>
              <button onClick={() => setShowModal(false)} className="rounded-full p-1.5 hover:bg-neutral-100 dark:hover:bg-white/10 transition">
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSubmitLocation} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1.5">Location Name</label>
                <input
                  required
                  type="text"
                  value={submitName}
                  onChange={(e) => setSubmitName(e.target.value)}
                  placeholder="e.g. Sunny Solar Rooftop"
                  className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 transition"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold mb-1.5">Type</label>
                <select
                  required
                  value={submitType}
                  onChange={(e) => setSubmitType(e.target.value)}
                  className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none transition"
                >
                  {types.filter(t => t !== "All").map(t => (
                    <option key={t} value={t}>{TYPE_LABELS[t] || t}</option>
                  ))}
                </select>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-sm font-semibold">Address / Coordinates</label>
                  <button
                    type="button"
                    onClick={() => {
                      setUseMyLocation(!useMyLocation);
                      if (!useMyLocation && !userLocation) {
                        requestLocation();
                      }
                      if (!useMyLocation && userLocation) {
                        setSubmitAddress(`${userLocation.lat.toFixed(6)}, ${userLocation.lng.toFixed(6)}`);
                      }
                    }}
                    className={`flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-bold transition ${
                      useMyLocation
                        ? "bg-[#00C896] text-white"
                        : "bg-[#52B788]/10 text-[#2D6A4F] dark:text-[#52B788] hover:bg-[#52B788]/20"
                    }`}
                  >
                    {locating ? (
                      <RefreshCw size={11} className="animate-spin" />
                    ) : (
                      <Target size={11} />
                    )}
                    {useMyLocation ? "Using GPS" : "Use my location"}
                  </button>
                </div>

                <input
                  required
                  type="text"
                  value={submitAddress}
                  onChange={(e) => { setSubmitAddress(e.target.value); setUseMyLocation(false); }}
                  placeholder={useMyLocation ? "Getting your location…" : "Full address or lat, lng"}
                  className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 transition"
                />

                {/* Live location preview */}
                {useMyLocation && userLocation && (
                  <div className="mt-2 rounded-xl border border-[#52B788]/20 bg-[#52B788]/5 dark:bg-[#52B788]/10 px-3 py-2.5">
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="relative flex h-1.5 w-1.5">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#00C896] opacity-75" />
                        <span className="relative inline-flex h-1.5 w-1.5 rounded-full bg-[#00C896]" />
                      </span>
                      <span className="text-[10px] font-bold text-[#2D6A4F] dark:text-[#52B788]">Live GPS Location</span>
                      <span className="text-[10px] text-[#2D6A4F]/50 dark:text-white/30">±{Math.round(userLocation.accuracy)}m</span>
                    </div>
                    {userLocation.address && (
                      <p className="text-[11px] text-[#1B4332]/60 dark:text-white/50 leading-relaxed">
                        {userLocation.address.split(",").slice(0, 4).join(",")}
                      </p>
                    )}
                    {/* Mini map preview */}
                    <div className="mt-2 h-24 rounded-lg overflow-hidden border border-[#52B788]/20">
                      <iframe
                        title="Your location"
                        src={`https://maps.google.com/maps?q=${userLocation.lat},${userLocation.lng}&z=17&output=embed`}
                        className="w-full h-full border-0"
                        loading="lazy"
                      />
                    </div>
                  </div>
                )}

                {locating && useMyLocation && (
                  <p className="mt-1.5 flex items-center gap-1.5 text-[11px] text-[#2D6A4F] dark:text-[#52B788]">
                    <RefreshCw size={11} className="animate-spin" />
                    Getting precise location…
                  </p>
                )}
              </div>

              <div className="flex gap-3 mt-6">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 py-3 font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 rounded-xl bg-[#2D6A4F] py-3 font-semibold text-white hover:bg-[#1B4332] transition"
                >
                  Submit
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
