"use client";

import { useEffect, useRef, useCallback } from "react";
import { GoogleMap, useJsApiLoader } from "@react-google-maps/api";
import { CITY_COORDS } from "@/lib/carbonData";
import { type EcoLocation } from "@/lib/green-map-store";
import { RefreshCw } from "lucide-react";

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

/* ── Layer pins ── */
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

interface GoogleMapWrapperProps {
  selectedCity: string;
  searchResult: EcoLocation | null;
  filteredLocations: EcoLocation[];
  selectedLocation: EcoLocation | null;
  setSelectedLocation: (loc: EcoLocation | null) => void;
  userLocation: { lat: number; lng: number; accuracy: number; address?: string } | null;
  showEV: boolean;
  showRecycle: boolean;
  showRoute: boolean;
  setRouteError: (err: string) => void;
  newSubmittedMarker: { lat: number; lng: number } | null;
  setMapLoaded: (loaded: boolean) => void;
}

export default function GoogleMapWrapper({
  selectedCity,
  searchResult,
  filteredLocations,
  selectedLocation,
  setSelectedLocation,
  userLocation,
  showEV,
  showRecycle,
  showRoute,
  setRouteError,
  newSubmittedMarker,
  setMapLoaded,
}: GoogleMapWrapperProps) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markersRef = useRef<google.maps.Marker[]>([]);
  const searchMarkerRef = useRef<google.maps.Marker | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const layerMarkersRef = useRef<google.maps.Marker[]>([]);
  const routeRendererRef = useRef<google.maps.DirectionsRenderer | null>(null);

  /* ── Load Google Maps SDK ── */
  const { isLoaded } = useJsApiLoader({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || "",
  });

  useEffect(() => {
    setMapLoaded(isLoaded);
  }, [isLoaded, setMapLoaded]);

  /* ── Clear existing markers ── */
  const clearMarkers = useCallback(() => {
    markersRef.current.forEach((m) => m.setMap(null));
    markersRef.current = [];
  }, []);

  /* ── Plot markers for locations ── */
  const plotMarkers = useCallback(() => {
    if (!mapRef.current) return;
    clearMarkers();

    filteredLocations.forEach((loc) => {
      if (loc.badge === "search_result") return;

      const color = loc.type === "ev_charging" ? "#3B82F6" : "#10B981"; // EV Charging is blue, Green Space green
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

      if (isPending) {
        setTimeout(() => marker.setAnimation(null), 2000);
      }

      markersRef.current.push(marker);
    });
  }, [filteredLocations, clearMarkers, setSelectedLocation]);

  /* ── Trigger replot on map load/filter updates ── */
  useEffect(() => {
    if (isLoaded && mapRef.current) {
      plotMarkers();
    }
  }, [isLoaded, plotMarkers]);

  /* ── Layer pins plotting ── */
  useEffect(() => {
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

  /* ── Directions routing layer ── */
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

    const origin = userLocation
      ? { lat: userLocation.lat, lng: userLocation.lng }
      : CITY_COORDS[selectedCity] || CITY_COORDS.Delhi;
    const dest = EV_STATIONS[0];

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

  /* ── Selected City center pan ── */
  useEffect(() => {
    if (!mapRef.current) return;
    const coords = CITY_COORDS[selectedCity];
    if (coords) {
      mapRef.current.panTo(coords);
      mapRef.current.setZoom(12);
    }
  }, [selectedCity]);

  /* ── Selected location zoom & pan ── */
  useEffect(() => {
    if (!mapRef.current || !selectedLocation) return;
    mapRef.current.panTo({ lat: selectedLocation.lat, lng: selectedLocation.lng });
    mapRef.current.setZoom(15);
  }, [selectedLocation]);

  /* ── User Location pan ── */
  useEffect(() => {
    if (!mapRef.current || !userLocation) return;
    mapRef.current.panTo({ lat: userLocation.lat, lng: userLocation.lng });
    mapRef.current.setZoom(14);
  }, [userLocation]);

  /* ── Drop new marker animation ── */
  useEffect(() => {
    if (!mapRef.current || !newSubmittedMarker) return;
    const { lat, lng } = newSubmittedMarker;

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
  }, [newSubmittedMarker]);

  /* ── Search result drop pin and overlay ── */
  useEffect(() => {
    if (!isLoaded || !mapRef.current || !searchResult) {
      if (searchMarkerRef.current) {
        searchMarkerRef.current.setMap(null);
        searchMarkerRef.current = null;
      }
      if (infoWindowRef.current) {
        infoWindowRef.current.close();
        infoWindowRef.current = null;
      }
      return;
    }

    const { lat, lng, address, name } = searchResult;
    if (searchMarkerRef.current) {
      searchMarkerRef.current.setMap(null);
    }

    mapRef.current.panTo({ lat, lng });
    mapRef.current.setZoom(15);

    const marker = new google.maps.Marker({
      position: { lat, lng },
      map: mapRef.current,
      icon: createSearchMarkerIcon(),
      animation: google.maps.Animation.DROP,
      title: name || address,
    });
    searchMarkerRef.current = marker;

    const iw = new google.maps.InfoWindow({
      content: `<div style="color:#1B4332;font-size:13px;font-weight:600;max-width:220px;padding:4px">${name || address}</div>`,
    });
    iw.open(mapRef.current, marker);
    infoWindowRef.current = iw;
  }, [isLoaded, searchResult]);

  const onMapLoad = useCallback((map: google.maps.Map) => {
    mapRef.current = map;
    const coords = CITY_COORDS[selectedCity] || CITY_COORDS.Delhi;
    map.setCenter(coords);
    map.setZoom(12);
    plotMarkers();
  }, [selectedCity, plotMarkers]);

  const defaultCenter = CITY_COORDS[selectedCity] || CITY_COORDS.Delhi;

  if (!isLoaded) {
    return (
      <div className="w-full h-full flex items-center justify-center bg-[#0d1f14]">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw size={24} className="animate-spin text-[#52B788]" />
          <span className="text-sm text-[#52B788]/70">Loading map…</span>
        </div>
      </div>
    );
  }

  return (
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
  );
}
