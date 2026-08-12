"use client";

import maplibregl, { Map as MapLibreMap, Marker, Popup } from "maplibre-gl";
import { useCallback, useEffect, useRef, useState } from "react";

import type { components } from "@unitrack/api-client";

import "maplibre-gl/dist/maplibre-gl.css";

type FleetBus = components["schemas"]["FleetBusOut"];
type Fleet = components["schemas"]["FleetOut"];

/**
 * Live fleet map (spec §10.2).
 *
 * MapLibre with OpenFreeMap tiles: free, keyless and unmetered, same as the
 * student map. A console that polls every five seconds on a metered tile
 * provider is a bill nobody budgeted for.
 */
const STYLE_URL = "https://tiles.openfreemap.org/styles/liberty";

/** Dhaka, near ULAB. Only used before the first fleet response arrives. */
const FALLBACK_CENTRE: [number, number] = [90.3742, 23.7461];

/**
 * Faster than the student map's ten seconds. An operator is watching for a
 * problem developing, and the helper app posts every five — so this is as fresh
 * as the data can be, and the response is one Postgres query plus one Redis
 * pipeline regardless of fleet size.
 */
const REFRESH_MS = 5_000;

/** Amber for a bus that has gone quiet, per §10.2. Green is not decoration. */
const PIN_COLOUR: Record<FleetBus["freshness"], string> = {
  live: "#16a34a",
  stale: "#f59e0b",
  lost: "#9ca3af",
};

function ageLabel(bus: FleetBus): string {
  if (bus.freshness === "lost") return "no position";
  if (bus.fix_age_s == null) return "unknown";
  if (bus.fix_age_s < 60) return `${bus.fix_age_s}s ago`;
  return `${Math.round(bus.fix_age_s / 60)}m ago`;
}

function popupHtml(bus: FleetBus): string {
  const seats =
    bus.occupied == null ? "not reported" : `${bus.occupied} / ${bus.capacity ?? "?"}`;
  const eta =
    bus.next_stop_eta_minutes == null
      ? "no estimate"
      : `${bus.next_stop_eta_minutes} min`;

  // Values come from the database and from a helper's phone, so they are
  // escaped rather than interpolated raw — a bus nickname is free text an admin
  // typed, and setHTML would happily run a <script> in it.
  return `
    <strong>${escapeHtml(bus.reg_no)}</strong><br />
    ${escapeHtml(bus.route_name)} · ${escapeHtml(bus.route_direction)}<br />
    Helper: ${escapeHtml(bus.helper_name)}<br />
    Seats: ${escapeHtml(seats)}<br />
    Next stop: ${escapeHtml(eta)}<br />
    Fix: ${escapeHtml(ageLabel(bus))}
  `;
}

function escapeHtml(value: string): string {
  return value.replace(
    /[&<>"']/g,
    (c) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c] ?? c,
  );
}

export function FleetMap({ initial }: { initial: Fleet }) {
  const container = useRef<HTMLDivElement>(null);
  const map = useRef<MapLibreMap | null>(null);
  // Keyed by bus so a position update moves the existing pin rather than
  // stacking a new one on top every five seconds.
  // The freshness is stored alongside the marker because MapLibre bakes the
  // pin colour into an inline SVG when the Marker is constructed — there is no
  // setColor. Recolouring means replacing the marker, so the last known state
  // is kept here to detect when that is actually necessary.
  const markers = useRef<Map<string, { marker: Marker; freshness: FleetBus["freshness"] }>>(
    new Map(),
  );
  const hasFitted = useRef(false);

  const [fleet, setFleet] = useState<Fleet>(initial);
  const [error, setError] = useState<string | null>(null);
  const [selected, setSelected] = useState<string | null>(null);

  // --- the map itself -------------------------------------------------------
  useEffect(() => {
    if (!container.current || map.current) return;

    // Captured for the cleanup: reading `.current` there is the pattern
    // react-hooks warns about, and the warning is worth keeping on.
    const pins = markers.current;

    map.current = new maplibregl.Map({
      container: container.current,
      style: STYLE_URL,
      center: FALLBACK_CENTRE,
      zoom: 11,
      attributionControl: { compact: true },
    });
    map.current.addControl(new maplibregl.NavigationControl(), "top-right");

    return () => {
      map.current?.remove();
      map.current = null;
      // Removing the map destroys its markers, but this cache would still hold
      // the dead Marker objects. The pin effect looks each bus up by id, so a
      // surviving entry means that bus is never drawn on the replacement map.
      pins.clear();
      hasFitted.current = false;
    };
  }, []);

  // --- polling --------------------------------------------------------------
  useEffect(() => {
    let cancelled = false;

    async function load() {
      try {
        const res = await fetch("/api/fleet", { cache: "no-store" });
        if (!res.ok) throw new Error(String(res.status));
        const data: Fleet = await res.json();
        if (!cancelled) {
          setFleet(data);
          setError(null);
        }
      } catch {
        // Keep the last known pins rather than blanking the map: a dropped poll
        // is far more likely than the whole fleet vanishing.
        if (!cancelled) setError("Could not refresh — showing last known positions");
      }
    }

    const id = setInterval(load, REFRESH_MS);
    return () => {
      cancelled = true;
      clearInterval(id);
    };
  }, []);

  // --- pins -----------------------------------------------------------------
  useEffect(() => {
    if (!map.current) return;

    // A bus with no position cannot be drawn; it is still listed in the panel,
    // which is where an operator notices it has gone quiet.
    const locatable = fleet.buses.filter(
      (b): b is FleetBus & { lat: number; lng: number } => b.lat != null && b.lng != null,
    );
    const live = new Set(locatable.map((b) => b.bus_id));

    for (const [id, entry] of markers.current) {
      if (!live.has(id)) {
        // A bus that stopped reporting a position is gone, not frozen. Leaving
        // the pin would show a bus that is not there.
        entry.marker.remove();
        markers.current.delete(id);
      }
    }

    for (const bus of locatable) {
      const position: [number, number] = [bus.lng, bus.lat];
      const existing = markers.current.get(bus.bus_id);

      // Reuse the marker unless the colour has to change, since replacing it
      // closes an open popup and drops the pin's animation.
      if (existing && existing.freshness === bus.freshness) {
        existing.marker.setLngLat(position);
        // The popup has to follow the data too. Set only at creation, a bus
        // would keep advertising the seat count and fix age it had when it
        // first appeared, however far it had since travelled.
        existing.marker.getPopup()?.setHTML(popupHtml(bus));
        continue;
      }

      // Either new, or its freshness changed — a bus going amber is the whole
      // point of §10.2, so the marker is rebuilt to recolour it.
      existing?.marker.remove();
      const marker = new maplibregl.Marker({ color: PIN_COLOUR[bus.freshness] })
        .setLngLat(position)
        .setPopup(new Popup({ offset: 24 }).setHTML(popupHtml(bus)))
        .addTo(map.current);
      markers.current.set(bus.bus_id, { marker, freshness: bus.freshness });
    }

    // Fit once, on the first response that has anything to fit. Doing it on
    // every poll would yank the view back while an operator was panning.
    if (!hasFitted.current && locatable.length > 0) {
      const bounds = new maplibregl.LngLatBounds();
      for (const bus of locatable) bounds.extend([bus.lng, bus.lat]);
      map.current.fitBounds(bounds, { padding: 64, maxZoom: 14, duration: 0 });
      hasFitted.current = true;
    }
  }, [fleet]);

  /** Centre on one bus and open its popup, from the side list. */
  const focus = useCallback((bus: FleetBus) => {
    if (bus.lat == null || bus.lng == null || !map.current) return;
    setSelected(bus.bus_id);
    map.current.easeTo({ center: [bus.lng, bus.lat], zoom: 15 });
    markers.current.get(bus.bus_id)?.marker.togglePopup();
  }, []);

  return (
    <div className="fleet-layout">
      <div className="fleet-map-wrap">
        <div ref={container} className="fleet-map" />
        {error ? <div className="fleet-map-error">{error}</div> : null}
      </div>

      <aside className="fleet-list" aria-label="Live buses">
        {fleet.buses.length === 0 ? (
          <p className="sub">
            No trips are running. A bus appears here as soon as a helper starts a
            trip.
          </p>
        ) : (
          fleet.buses.map((bus) => (
            <button
              key={bus.bus_id}
              type="button"
              className={`fleet-card ${selected === bus.bus_id ? "is-selected" : ""}`}
              onClick={() => focus(bus)}
              disabled={bus.lat == null}
              title={bus.lat == null ? "No position to show on the map" : undefined}
            >
              <span className="fleet-card-head">
                <strong>{bus.reg_no}</strong>
                <span className={`freshness freshness-${bus.freshness}`}>
                  {bus.freshness === "live" ? "live" : bus.freshness}
                </span>
              </span>
              <span className="fleet-card-route">
                {bus.route_name} · {bus.route_direction}
              </span>
              <span className="fleet-card-meta">
                {bus.helper_name} · {ageLabel(bus)}
                {bus.occupied != null ? ` · ${bus.occupied}/${bus.capacity ?? "?"}` : ""}
              </span>
            </button>
          ))
        )}
      </aside>
    </div>
  );
}
