/**
 * Drawing a bus route on a MapLibre map.
 *
 * Shared by both apps because both need the same thing: the corridor as a line
 * and its stops as points. A student wants to know where the bus is *going*, and
 * a pin on a blank street grid does not answer that; an operator watching for a
 * bus that has left its route needs the route on screen to see that it has.
 *
 * It lives in a package rather than being written twice. The two copies would
 * not stay equal — a colour fixed in one, a layer id renamed in the other — and
 * "the maps look different" is the kind of difference nobody files a bug for.
 *
 * The route geometry is structurally typed rather than imported from
 * `@unitrack/api-client`, so this package depends on no API shape and can be
 * handed a route from anywhere: a fixture, a test, a future offline cache.
 */

import type { LngLatBounds as LngLatBoundsType, Map as MapLibreMap } from "maplibre-gl";
import { GeoJSONSource, LngLat, LngLatBounds } from "maplibre-gl";

export interface RouteStopShape {
  seq: number;
  stop: { id: string; name: string; lat: number; lng: number };
}

export interface RouteShape {
  id: string;
  name: string;
  /** "outbound" | "inbound" — free-form so a third direction needs no change here. */
  direction: string;
  stops: RouteStopShape[];
}

export const ROUTE_SOURCE_ID = "unitrack-routes";
export const STOP_SOURCE_ID = "unitrack-stops";
export const LINE_LAYER_ID = "unitrack-routes-line";
export const STOP_CIRCLE_LAYER_ID = "unitrack-stops-circle";

const CASING_LAYER_ID = "unitrack-routes-casing";
const STOP_LABEL_LAYER_ID = "unitrack-stops-label";

/**
 * Brand navy out, accent green back. Both measured against the Liberty tile
 * style's road and park fills, which is the only background these ever sit on.
 */
const DIRECTION_COLOUR: Record<string, string> = {
  outbound: "#1a3c8f",
  inbound: "#128038",
};
const FALLBACK_COLOUR = "#6b7280";

/**
 * Half the gap between the two directions, in screen pixels.
 *
 * Outbound and inbound are the same stops walked in opposite orders, so their
 * geometry is *identical* and whichever draws second hides the other
 * completely — the map would show one route where there are two. Offsetting
 * each to its own side of the corridor is what makes both visible, and it
 * happens to match how road maps draw a divided carriageway. Pixels, not
 * metres, so the separation survives zooming out.
 */
const DIRECTION_OFFSET_PX = 3.5;

function colourFor(direction: string): string {
  return DIRECTION_COLOUR[direction] ?? FALLBACK_COLOUR;
}

/** Routes with fewer than two stops cannot be a line. */
function drawable(routes: RouteShape[]): RouteShape[] {
  return routes.filter((r) => r.stops.length >= 2);
}

function ordered(stops: RouteStopShape[]): RouteStopShape[] {
  return [...stops].sort((a, b) => a.seq - b.seq);
}

export function routesToGeoJson(routes: RouteShape[]) {
  return {
    type: "FeatureCollection" as const,
    features: drawable(routes).map((route) => ({
      type: "Feature" as const,
      id: route.id,
      properties: {
        routeId: route.id,
        name: route.name,
        direction: route.direction,
        colour: colourFor(route.direction),
        // Signed so the two directions land on opposite sides of the corridor.
        // Anything unrecognised sits on the centre line rather than guessing a
        // side and overlapping whatever is already there.
        offset:
          route.direction === "outbound"
            ? -DIRECTION_OFFSET_PX
            : route.direction === "inbound"
              ? DIRECTION_OFFSET_PX
              : 0,
      },
      geometry: {
        type: "LineString" as const,
        coordinates: ordered(route.stops).map((rs) => [rs.stop.lng, rs.stop.lat]),
      },
    })),
  };
}

export function stopsToGeoJson(routes: RouteShape[]) {
  // Deduplicated by stop id. Both directions serve the same stops, so without
  // this every circle and every label is drawn twice — which is invisible for
  // the circles and, for the labels, is why MapLibre would hide half of them as
  // colliding text.
  const seen = new Map<string, RouteStopShape["stop"]>();
  for (const route of drawable(routes)) {
    for (const rs of route.stops) seen.set(rs.stop.id, rs.stop);
  }

  return {
    type: "FeatureCollection" as const,
    features: [...seen.values()].map((stop) => ({
      type: "Feature" as const,
      id: stop.id,
      properties: { name: stop.name },
      geometry: { type: "Point" as const, coordinates: [stop.lng, stop.lat] },
    })),
  };
}

/** A box containing every stop on every route, or null if there are none. */
export function routeBounds(routes: RouteShape[]): LngLatBoundsType | null {
  const bounds = new LngLatBounds();
  let any = false;
  for (const route of drawable(routes)) {
    for (const rs of route.stops) {
      bounds.extend([rs.stop.lng, rs.stop.lat]);
      any = true;
    }
  }
  return any ? bounds : null;
}

/**
 * How far the map can currently see, in kilometres, as a radius from its centre.
 *
 * `/track/nearby` asks for a centre and a radius; a map shows a rectangle. The
 * corner is the far edge of what the user is looking at, so using it means
 * every bus on screen is inside the query — a radius taken from the shorter
 * side would leave buses visibly on the map and missing from the results.
 *
 * Clamped at both ends: the endpoint refuses anything over 50 km, and a radius
 * below a kilometre returns nothing useful however far in someone has zoomed.
 */
export function viewportRadiusKm(map: MapLibreMap, min = 1, max = 25): number {
  const bounds = map.getBounds();
  const centre = map.getCenter();
  const corner = new LngLat(bounds.getEast(), bounds.getNorth());
  const km = centre.distanceTo(corner) / 1000;
  return Math.min(max, Math.max(min, Math.round(km * 10) / 10));
}

/**
 * Keep the map's canvas the size of its container. Returns a disposer.
 *
 * MapLibre's own `trackResize` does not always catch it. Measured on the student
 * map: the container went from 430x774 to 375x676 and the canvas stayed 430x774
 * — a map rendering 55px wider and 98px taller than its box, so the right edge
 * and the zoom controls sat outside the visible area, clipped and unreachable.
 * `map.resize()` corrected it immediately, which is what makes this the fix
 * rather than a workaround.
 *
 * The trigger in the field is not a desktop window drag. It is a phone rotating,
 * or the iOS URL bar collapsing on scroll, or the soft keyboard opening — all of
 * which resize the container without a window `resize` event that arrives in
 * time. `resize()` is a no-op when the size already matches, so observing
 * costs nothing when nothing changes.
 */
export function keepMapSized(map: MapLibreMap): () => void {
  const container = map.getContainer();
  if (typeof ResizeObserver === "undefined") return () => {};

  const observer = new ResizeObserver(() => {
    // Guarded: the observer can fire during teardown, after `remove()` has
    // already thrown the canvas away, and resizing a removed map throws.
    if (map.getCanvas()) map.resize();
  });
  observer.observe(container);
  return () => observer.disconnect();
}

interface AddOptions {
  /** Show the stop names. Off on a small map, where they only collide. */
  labels?: boolean;
}

/**
 * Add (or update) the route and stop layers on `map`.
 *
 * Safe to call more than once and safe to call before the style has loaded: on
 * a second call it updates the existing sources' data instead of throwing
 * "There is already a source with this ID", which is what React's development
 * double-invoke and any later route change would otherwise trigger.
 */
export function addRouteLayers(
  map: MapLibreMap,
  routes: RouteShape[],
  { labels = true }: AddOptions = {},
): void {
  const apply = () => {
    const lines = routesToGeoJson(routes);
    const stops = stopsToGeoJson(routes);

    // `instanceof`, not a cast or an `in` check: `getSource` is typed to return
    // the union of every source kind, and a duck-type test narrows it to
    // something whose `setData` is `unknown`. This is the only form that both
    // proves the source is ours and types the call.
    const lineSource = map.getSource(ROUTE_SOURCE_ID);
    if (lineSource instanceof GeoJSONSource) {
      lineSource.setData(lines);
      const stopSource = map.getSource(STOP_SOURCE_ID);
      if (stopSource instanceof GeoJSONSource) stopSource.setData(stops);
      return;
    }

    map.addSource(ROUTE_SOURCE_ID, { type: "geojson", data: lines });
    map.addSource(STOP_SOURCE_ID, { type: "geojson", data: stops });

    // A white casing under the coloured line. Without it the route disappears
    // wherever it crosses a road of a similar colour, which on a street map is
    // most of its length.
    map.addLayer({
      id: CASING_LAYER_ID,
      type: "line",
      source: ROUTE_SOURCE_ID,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": "#ffffff",
        "line-opacity": 0.9,
        "line-offset": ["get", "offset"],
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 5, 14, 9, 17, 13],
      },
    });

    map.addLayer({
      id: LINE_LAYER_ID,
      type: "line",
      source: ROUTE_SOURCE_ID,
      layout: { "line-cap": "round", "line-join": "round" },
      paint: {
        "line-color": ["get", "colour"],
        "line-offset": ["get", "offset"],
        "line-width": ["interpolate", ["linear"], ["zoom"], 10, 2.5, 14, 5, 17, 8],
      },
    });

    map.addLayer({
      id: STOP_CIRCLE_LAYER_ID,
      type: "circle",
      source: STOP_SOURCE_ID,
      paint: {
        "circle-radius": ["interpolate", ["linear"], ["zoom"], 10, 3, 14, 5.5, 17, 8],
        "circle-color": "#ffffff",
        "circle-stroke-color": "#1a3c8f",
        "circle-stroke-width": 2,
      },
    });

    if (labels) {
      map.addLayer({
        id: STOP_LABEL_LAYER_ID,
        type: "symbol",
        source: STOP_SOURCE_ID,
        // Only from zoom 12: below that the seven names of a 17 km corridor
        // pile into one another and MapLibre drops most of them anyway.
        minzoom: 12,
        layout: {
          "text-field": ["get", "name"],
          // No font stack is named, so this uses the style's own — asking for a
          // font the Liberty glyph server does not serve makes every label
          // silently vanish.
          "text-size": 11,
          "text-offset": [0, 1.1],
          "text-anchor": "top",
          "text-allow-overlap": false,
        },
        paint: {
          "text-color": "#111827",
          // The halo, not a background: the label has to stay readable over a
          // park, a river and a motorway without a box around it.
          "text-halo-color": "#ffffff",
          "text-halo-width": 1.6,
        },
      });
    }
  };

  if (map.isStyleLoaded()) {
    apply();
  } else {
    map.once("load", apply);
  }
}
