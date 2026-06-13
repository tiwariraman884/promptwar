"use client";

import { useState, useCallback, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import debounce from "lodash.debounce";
import { X, MapPin, RefreshCw } from "lucide-react";
import { useGreenMapStore } from "@/lib/green-map-store";
import { CITY_COORDS } from "@/lib/carbonData";
import { TYPE_LABELS } from "./PlaceTypeFilter";

const CITIES = Object.keys(CITY_COORDS);
const PLACE_TYPES = Object.keys(TYPE_LABELS);

interface SubmitDrawerProps {
  onNewMarker: (lat: number, lng: number) => void;
}

export function SubmitDrawer({ onNewMarker }: SubmitDrawerProps) {
  const drawerOpen = useGreenMapStore((s) => s.drawerOpen);
  const setDrawerOpen = useGreenMapStore((s) => s.setDrawerOpen);
  const addSubmittedLocation = useGreenMapStore((s) => s.addSubmittedLocation);
  const showToast = useGreenMapStore((s) => s.showToast);

  const [name, setName] = useState("");
  const [type, setType] = useState("ev_charging");
  const [city, setCity] = useState("Delhi");
  const [address, setAddress] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [notes, setNotes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [geocoding, setGeocoding] = useState(false);

  // Debounced geocoding when address changes
  const geocodeAddress = useMemo(
    () =>
      debounce(async (addr: string) => {
        if (!addr || addr.length < 5) return;
        setGeocoding(true);
        try {
          const res = await fetch(
            `/api/geocode?address=${encodeURIComponent(addr)}`
          );
          const data = await res.json();
          if (res.ok) {
            setLat(data.lat.toFixed(6));
            setLng(data.lng.toFixed(6));
          }
        } catch {
          // Geocoding failed, user can enter manually
        } finally {
          setGeocoding(false);
        }
      }, 300),
    []
  );

  const handleAddressChange = (value: string) => {
    setAddress(value);
    geocodeAddress(value);
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!name.trim()) e.name = "Name is required";
    if (!type) e.type = "Place type is required";
    if (!city) e.city = "City is required";
    if (!address.trim()) e.address = "Address is required";
    if (!lat || isNaN(Number(lat))) e.lat = "Valid latitude required";
    if (!lng || isNaN(Number(lng))) e.lng = "Valid longitude required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    const newLoc = {
      id: `submitted-${Date.now()}`,
      name: name.trim(),
      type,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      city,
      address: address.trim(),
      notes: notes.trim() || undefined,
      badge: "pending_review" as const,
      approved: false,
    };

    addSubmittedLocation(newLoc);
    onNewMarker(newLoc.lat, newLoc.lng);
    showToast("📍 Location submitted! Visible on the map.");
    resetForm();
    setDrawerOpen(false);
  };

  const resetForm = () => {
    setName("");
    setType("ev_charging");
    setCity("Delhi");
    setAddress("");
    setLat("");
    setLng("");
    setNotes("");
    setErrors({});
  };

  const handleClose = useCallback(() => {
    setDrawerOpen(false);
    resetForm();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [setDrawerOpen]);

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm"
            onClick={handleClose}
          />

          {/* Drawer */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
            className="fixed bottom-0 left-0 right-0 z-50 max-h-[90vh] overflow-y-auto rounded-t-3xl bg-white dark:bg-[#0B1815] border-t border-[#52B788]/20 shadow-2xl"
          >
            {/* Drag handle */}
            <div className="flex justify-center pt-3 pb-1">
              <div className="h-1 w-10 rounded-full bg-[#52B788]/30" />
            </div>

            <div className="px-6 pb-8">
              {/* Header */}
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2">
                  <MapPin size={20} className="text-[#52B788]" />
                  <h2 className="text-xl font-bold text-[#2D6A4F] dark:text-[#52B788]">
                    Submit a new location
                  </h2>
                </div>
                <button
                  onClick={handleClose}
                  className="rounded-full p-2 hover:bg-neutral-100 dark:hover:bg-white/10 transition flex items-center gap-1 text-sm text-neutral-500"
                >
                  <X size={18} />
                  <span className="hidden sm:inline">Cancel</span>
                </button>
              </div>

              <form
                onSubmit={handleSubmit}
                className="grid grid-cols-1 md:grid-cols-2 gap-4"
              >
                {/* Name */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5">
                    Name *
                  </label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Sunny Solar Rooftop"
                    className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 transition"
                  />
                  {errors.name && (
                    <p className="mt-1 text-xs text-red-500">{errors.name}</p>
                  )}
                </div>

                {/* Type */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Place Type *
                  </label>
                  <select
                    value={type}
                    onChange={(e) => setType(e.target.value)}
                    className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none transition"
                  >
                    {PLACE_TYPES.map((t) => (
                      <option key={t} value={t}>
                        {TYPE_LABELS[t]}
                      </option>
                    ))}
                  </select>
                  {errors.type && (
                    <p className="mt-1 text-xs text-red-500">{errors.type}</p>
                  )}
                </div>

                {/* City */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    City *
                  </label>
                  <select
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none transition"
                  >
                    {CITIES.map((c) => (
                      <option key={c} value={c}>
                        {c}
                      </option>
                    ))}
                  </select>
                  {errors.city && (
                    <p className="mt-1 text-xs text-red-500">{errors.city}</p>
                  )}
                </div>

                {/* Address */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5">
                    Address *
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={address}
                      onChange={(e) => handleAddressChange(e.target.value)}
                      placeholder="Full address (auto-fills lat/lng)"
                      className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 transition"
                    />
                    {geocoding && (
                      <RefreshCw
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 animate-spin text-[#52B788]"
                      />
                    )}
                  </div>
                  {errors.address && (
                    <p className="mt-1 text-xs text-red-500">
                      {errors.address}
                    </p>
                  )}
                </div>

                {/* Lat / Lng */}
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Latitude
                  </label>
                  <input
                    type="text"
                    value={lat}
                    onChange={(e) => setLat(e.target.value)}
                    placeholder="Auto-filled or enter manually"
                    className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none transition"
                  />
                  {errors.lat && (
                    <p className="mt-1 text-xs text-red-500">{errors.lat}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm font-semibold mb-1.5">
                    Longitude
                  </label>
                  <input
                    type="text"
                    value={lng}
                    onChange={(e) => setLng(e.target.value)}
                    placeholder="Auto-filled or enter manually"
                    className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none transition"
                  />
                  {errors.lng && (
                    <p className="mt-1 text-xs text-red-500">{errors.lng}</p>
                  )}
                </div>

                {/* Notes */}
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold mb-1.5">
                    Notes (optional)
                  </label>
                  <textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Any additional details…"
                    rows={2}
                    className="w-full rounded-xl border border-[#52B788]/30 bg-[#F8FAF5] dark:bg-[#1A2F2A] px-4 py-2.5 text-sm focus:border-[#2D6A4F] focus:outline-none focus:ring-2 focus:ring-[#52B788]/20 transition resize-none"
                  />
                </div>

                {/* Actions */}
                <div className="md:col-span-2 flex gap-3 mt-2">
                  <button
                    type="button"
                    onClick={handleClose}
                    className="flex-1 rounded-xl bg-neutral-100 dark:bg-neutral-800 py-3 font-semibold hover:bg-neutral-200 dark:hover:bg-neutral-700 transition flex items-center justify-center gap-1.5"
                  >
                    <X size={16} /> Cancel
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
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
