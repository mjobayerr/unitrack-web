"use client";

import { addRouteLayers, keepMapSized, routeBounds, viewportRadiusKm } from "@unitrack/map";
import type { RouteShape } from "@unitrack/map";
import maplibregl, { Map as MapLibreMap, Marker } from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";

import "maplibre-gl/dist/maplibre-gl.css";

/**
 * Live bus positions, drawn on the routes they run.
 *
 * MapLibre with OpenFreeMap tiles. Both are free with no account, no API key
 * and no request quota, which matters for a university project that cannot
 * carry a per-view billing risk — one runaway loop on a metered provider is a
 * bill nobody budgeted for. Swapping to MapTiler or CARTO later is a one-line
 * style URL change, because the library is the same either way.
 */
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/** Dhaka, near ULAB. Only used when there is no route to fit and no fix yet. */
const FALLBACK_CENTRE: [number, number] = [90.3742, 23.7461];

const REFRESH_MS = 10_000;

/**
 * How long to wait after the map stops moving before querying again.
 *
 * A pan fires `moveend` once, but a pinch-zoom or a flick fires several in
 * quick succession, and each one would be a request whose answer is thrown away
 * by the next.
 */
const MOVE_SETTLE_MS = 400;

interface NearbyBus {
  bus_id: string;
  location: { lat: number; lon: number };
  distance_km: number;
  ts: string;
  speed: number | null;
}

export function LiveMap({ routes }: { routes: RouteShape[] }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  // Keyed by bus so a position update moves the existing pin instead of
  // stacking a new one on top of it every ten seconds.
  const markers = useRef<Map<string, Marker>>(new Map());

  const [buses, setBuses] = useState<NearbyBus[]>([]);
  const [radiusKm, setRadiusKm] = useState<number>(5);
  const [error, setError] = useState<string | null>(null);

  /**
   * Ask for the buses inside the current view.
   *
   * The query follows the map rather than a fixed 5 km around wherever the
   * browser last reported the student. That radius was wrong in both
   * directions: zoomed out over the whole corridor it hid buses that were
   * plainly on screen, and it kept fetching around a stale centre after the
   * student panned somewhere else. What is visible is what gets asked for.
   */
  const load = useCallback(async () => {
    const m = map.current;
    if (!m) return;
    const centre = m.getCenter();
    const radius = viewportRadiusKm(m);
    setRadiusKm(radius);

    try {
      const res = await fetch(
        `/api/nearby?lat=${centre.lat}&lng=${centre.lng}&radius_km=${radius}`,
        { cache: "no-store" },
      );
      if (!res.ok) throw new Error(String(res.status));
      const data = await res.json();
      setBuses(data.buses ?? []);
      setError(null);
    } catch {
      // Polling failures are transient by nature — a tunnel, a lift, a dead
      // spot. Keep the last known pins rather than blanking the map.
      setError("Could not refresh bus positions");
    }
  }, []);

  // --- the map itself -------------------------------------------------------
  useEffect(() => {
    if (!container.current || map.current) return;

    // Captured for the cleanup below. The ref object is created once and never
    // reassigned, so this is the same Map either way — but reading `.current`
    // inside a cleanup is the pattern react-hooks warns about, and the warning
    // is worth keeping switched on for the cases where it is a real bug.
    const pins = markers.current;

    // Open on the whole route when there is one. Centring on a guessed
    // coordinate showed a street grid with nothing on it, and the student had to
    // find their own bus service by panning.
    const bounds = routeBounds(routes);

    const instance = new maplibregl.Map({
      container: container.current,
      style: STYLE_URL,
      center: FALLBACK_CENTRE,
      zoom: 13,
      attributionControl: { compact: true },
    });
    map.current = instance;

    if (bounds) instance.fitBounds(bounds, { padding: 48, maxZoom: 14, duration: 0 });
    instance.addControl(new maplibregl.NavigationControl(), "top-right");
    instance.addControl(
      new maplibregl.GeolocateControl({ trackUserLocation: true }),
      "top-right",
    );

    addRouteLayers(instance, routes);
    const stopWatchingSize = keepMapSized(instance);

    // The map is the query. Every way the view can change ends in `moveend`,
    // including the geolocate control's fly-to and the fitBounds above, so this
    // one listener replaces the separate "where is the student" effect that used
    // to drive the fetch through a state variable.
    let settle: ReturnType<typeof setTimeout> | undefined;
    const onMoveEnd = () => {
      clearTimeout(settle);
      settle = setTimeout(load, MOVE_SETTLE_MS);
    };
    instance.on("moveend", onMoveEnd);
    instance.once("load", load);

    return () => {
      clearTimeout(settle);
      instance.off("moveend", onMoveEnd);
      stopWatchingSize();
      instance.remove();
      map.current = null;
      // Removing the map destroys its markers, but this cache would still hold
      // the dead Marker objects. The pin effect looks buses up by id and calls
      // setLngLat on a hit, so a stale entry means that bus is silently never
      // drawn on the replacement map — which is what happens on a remount, and
      // on every mount under React's development double-invoke.
      pins.clear();
    };
  }, [routes, load]);

  // --- polling --------------------------------------------------------------
  useEffect(() => {
    // Matches the helper app's 5s GPS batch closely enough that a pin is never
    // more than one cycle stale, without polling faster than data arrives.
    const id = setInterval(load, REFRESH_MS);
    return () => clearInterval(id);
  }, [load]);

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
        // Red, not the brand navy it used to be. The outbound route line is
        // navy, and a navy pin sitting on it was the one place on the map where
        // the bus — the thing the student opened this screen for — was the
        // hardest object to pick out.
        const marker = new maplibregl.Marker({ color: "#b91c1c" })
          .setLngLat(position)
          .setPopup(new maplibregl.Popup({ offset: 24 }).setText(label))
          .addTo(map.current);
        markers.current.set(bus.bus_id, marker);
      }
    }
  }, [buses]);

  return (
    <div className="relative overflow-hidden bg-card">
      {/* An explicit height: MapLibre measures its container, and a flex child
          with no height at all renders a zero-pixel canvas. Full-bleed to the
          tab bar — Track is the one map-first screen, with no navy band above
          it. The 5rem matches the fixed nav's height so the map ends exactly at
          its top edge. */}
      <div
        ref={container}
        className="h-[calc(100dvh-5rem-env(safe-area-inset-bottom))] min-h-80 w-full"
      />
      <div className="pointer-events-none absolute inset-x-2 bottom-2 rounded-xl bg-card/95 px-3 py-2 text-[13px] shadow-sm backdrop-blur">
        {error ? (
          <span className="text-warning">{error}</span>
        ) : (
          <span className="text-muted-foreground">
            {buses.length === 0
              ? `No buses in view (${radiusKm} km)`
              : `${buses.length} bus${buses.length === 1 ? "" : "es"} in view`}
          </span>
        )}
      </div>
    </div>
  );
}
