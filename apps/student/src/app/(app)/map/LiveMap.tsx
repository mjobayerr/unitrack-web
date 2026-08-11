"use client";

import maplibregl, { Map as MapLibreMap, Marker } from "maplibre-gl";
import { useEffect, useRef, useState } from "react";

import "maplibre-gl/dist/maplibre-gl.css";

/**
 * Live bus positions.
 *
 * MapLibre with OpenFreeMap tiles. Both are free with no account, no API key
 * and no request quota, which matters for a university project that cannot
 * carry a per-view billing risk — one runaway loop on a metered provider is a
 * bill nobody budgeted for. Swapping to MapTiler or CARTO later is a one-line
 * style URL change, because the library is the same either way.
 */
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/** Dhaka, near ULAB. Only used until the browser reports a real position. */
const FALLBACK_CENTRE: [number, number] = [90.3742, 23.7461];

const REFRESH_MS = 10_000;
const RADIUS_KM = 5;

interface NearbyBus {
  bus_id: string;
  location: { lat: number; lon: number };
  distance_km: number;
  ts: string;
  speed: number | null;
}

export function LiveMap() {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  // Keyed by bus so a position update moves the existing pin instead of
  // stacking a new one on top of it every ten seconds.
  const markers = useRef<Map<string, Marker>>(new Map());

  const [centre, setCentre] = useState<[number, number]>(FALLBACK_CENTRE);
  const [buses, setBuses] = useState<NearbyBus[]>([]);
  const [error, setError] = useState<string | null>(null);

  // --- the map itself -------------------------------------------------------
  useEffect(() => {
    if (!container.current || map.current) return;

    // Captured for the cleanup below. The ref object is created once and never
    // reassigned, so this is the same Map either way — but reading `.current`
    // inside a cleanup is the pattern react-hooks warns about, and the warning
    // is worth keeping switched on for the cases where it is a real bug.
    const pins = markers.current;

    map.current = new maplibregl.Map({
      container: container.current,
      style: STYLE_URL,
      center: FALLBACK_CENTRE,
      zoom: 13,
      attributionControl: { compact: true },
    });
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");
    map.current.addControl(
      new maplibregl.GeolocateControl({ trackUserLocation: true }),
      "top-right",
    );

    return () => {
      map.current?.remove();
      map.current = null;
      // Removing the map destroys its markers, but this cache would still hold
      // the dead Marker objects. The pin effect looks buses up by id and calls
      // setLngLat on a hit, so a stale entry means that bus is silently never
      // drawn on the replacement map — which is what happens on a remount, and
      // on every mount under React's development double-invoke.
      pins.clear();
    };
  }, []);

  // --- where the student is -------------------------------------------------
  useEffect(() => {
    if (!navigator.geolocation) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const next: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        setCentre(next);
        map.current?.easeTo({ center: next, zoom: 14 });
      },
      // Denied or unavailable is not an error worth showing: the map still
      // works centred on the campus, which is where the buses are anyway.
      () => {},
      { enableHighAccuracy: true, timeout: 8000 },
    );
  }, []);

  // --- polling --------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch(
          `/api/nearby?lat=${centre[1]}&lng=${centre[0]}&radius_km=${RADIUS_KM}`,
          { cache: "no-store" },
        );
        if (!res.ok) throw new Error(String(res.status));
        const data = await res.json();
        if (!cancelled) {
          setBuses(data.buses ?? []);
          setError(null);
        }
      } catch {
        // Polling failures are transient by nature — a tunnel, a lift, a dead
        // spot. Keep the last known pins rather than blanking the map.
        if (!cancelled) setError("Could not refresh bus positions");
      }
    }

    load();
    // Matches the helper app's 5s GPS batch closely enough that a pin is never
    // more than one cycle stale, without polling faster than data arrives.
    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, [centre]);

  // --- pins -----------------------------------------------------------------
  useEffect(() => {
    if (!map.current) return;
    const live = new Set(buses.map((b) => b.bus_id));

    for (const [id, marker] of markers.current) {
      if (!live.has(id)) {
        // A bus that stopped reporting is gone, not frozen. Leaving the pin
        // would show a bus that is not there.
        marker.remove();
        markers.current.delete(id);
      }
    }

    for (const bus of buses) {
      const position: [number, number] = [bus.location.lon, bus.location.lat];
      const label = `${bus.distance_km.toFixed(1)} km away`;
      const existing = markers.current.get(bus.bus_id);

      if (existing) {
        existing.setLngLat(position);
        // The popup text has to be updated too, not just the pin. Setting it
        // only at creation left a bus advertising the distance it was at when it
        // first appeared — so a pin that had visibly moved across the map still
        // claimed to be 4 km away ten minutes later.
        existing.getPopup()?.setText(label);
      } else {
        const marker = new maplibregl.Marker({ color: "#1a3c8f" })
          .setLngLat(position)
          .setPopup(new maplibregl.Popup({ offset: 24 }).setText(label))
          .addTo(map.current);
        markers.current.set(bus.bus_id, marker);
      }
    }
  }, [buses]);

  return (
    <div className="map-wrap">
      <div ref={container} className="map" />
      <div className="map-status">
        {error ? (
          <span className="warn">{error}</span>
        ) : (
          <span>
            {buses.length === 0
              ? `No buses within ${RADIUS_KM} km`
              : `${buses.length} bus${buses.length === 1 ? "" : "es"} nearby`}
          </span>
        )}
      </div>
    </div>
  );
}
