import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { components } from '../../lib/api';

type GpsPoint = components['schemas']['GpsPoint'];

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const DHAKA: [number, number] = [90.4074, 23.7806];
const empty: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

// --- path cleaning ---------------------------------------------------------
// Raw GPS is jittery: it zig-zags around the true track, sits in a knot while a
// bus idles at a signal, and jumps to a wild point on a bad fix. And a wide
// window holds several trips, which must not be joined end-to-start. So the path
// is split into segments at time/distance gaps and impossible-speed jumps, then
// each segment is simplified (drop redundant jitter) and smoothed (round corners).

const R = 6371000;
const rad = Math.PI / 180;
const GAP_SECONDS = 180; // >3 min between fixes = a new segment (likely a new trip)
const GAP_METERS = 400; // a jump this far between consecutive fixes = a break
const MAX_KMH = 120; // faster than this between two fixes = a GPS outlier
const SIMPLIFY_M = 12; // Douglas-Peucker tolerance
const CHAIKIN_ITERS = 2;

type XY = [number, number];

function project(lng: number, lat: number, lat0: number): XY {
  return [lng * rad * Math.cos(lat0 * rad) * R, lat * rad * R];
}
function unproject(x: number, y: number, lat0: number): [number, number] {
  return [x / (Math.cos(lat0 * rad) * R) / rad, y / R / rad];
}
function dist(a: XY, b: XY): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}
function segDist(p: XY, a: XY, b: XY): number {
  const dx = b[0] - a[0];
  const dy = b[1] - a[1];
  const len2 = dx * dx + dy * dy;
  if (len2 === 0) return dist(p, a);
  let t = ((p[0] - a[0]) * dx + (p[1] - a[1]) * dy) / len2;
  t = Math.max(0, Math.min(1, t));
  return dist(p, [a[0] + t * dx, a[1] + t * dy]);
}
function simplify(pts: XY[], eps: number): XY[] {
  if (pts.length < 3) return pts;
  let maxD = 0;
  let idx = 0;
  const a = pts[0];
  const b = pts[pts.length - 1];
  for (let i = 1; i < pts.length - 1; i++) {
    const d = segDist(pts[i], a, b);
    if (d > maxD) {
      maxD = d;
      idx = i;
    }
  }
  if (maxD > eps) {
    const left = simplify(pts.slice(0, idx + 1), eps);
    const right = simplify(pts.slice(idx), eps);
    return left.slice(0, -1).concat(right);
  }
  return [a, b];
}
function chaikin(pts: XY[], iters: number): XY[] {
  let out = pts;
  for (let k = 0; k < iters && out.length >= 3; k++) {
    const next: XY[] = [out[0]];
    for (let i = 0; i < out.length - 1; i++) {
      const [x1, y1] = out[i];
      const [x2, y2] = out[i + 1];
      next.push([0.75 * x1 + 0.25 * x2, 0.75 * y1 + 0.25 * y2]);
      next.push([0.25 * x1 + 0.75 * x2, 0.25 * y1 + 0.75 * y2]);
    }
    next.push(out[out.length - 1]);
    out = next;
  }
  return out;
}

/** Turn raw fixes into clean [lng,lat] segments. */
function cleanSegments(path: GpsPoint[]): [number, number][][] {
  const raw = path
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({ t: new Date(p.timestamp).getTime() / 1000, lng: p.longitude, lat: p.latitude }))
    .sort((a, b) => a.t - b.t);
  if (raw.length === 0) return [];

  const lat0 = raw[0].lat;
  const segments: { t: number; xy: XY }[][] = [[]];
  let prev: { t: number; xy: XY } | null = null;

  for (const p of raw) {
    const xy = project(p.lng, p.lat, lat0);
    if (prev) {
      const d = dist(xy, prev.xy);
      const dt = Math.max(p.t - prev.t, 0.001);
      const kmh = (d / dt) * 3.6;
      if (d < 2) continue; // dedupe stationary jitter
      if (dt > GAP_SECONDS || d > GAP_METERS || kmh > MAX_KMH) {
        segments.push([]); // break the line
      }
    }
    const node = { t: p.t, xy };
    segments[segments.length - 1].push(node);
    prev = node;
  }

  return segments
    .map((s) => s.map((n) => n.xy))
    .filter((s) => s.length >= 2)
    .map((s) => chaikin(simplify(s, SIMPLIFY_M), CHAIKIN_ITERS).map(([x, y]) => unproject(x, y, lat0)));
}

function dot(color: string): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)`;
  return el;
}

/** Draws a bus's recorded GPS path as clean smoothed segments, with start
 * (green) and end (red) markers, framed to the whole track. */
export function PathMap({ path, height = '30rem' }: { path: GpsPoint[]; height?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const readyRef = useRef(false);
  const endMarkers = useRef<maplibregl.Marker[]>([]);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: container.current, style: MAP_STYLE, center: DHAKA, zoom: 11 });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('load', () => {
      map.addSource('path', { type: 'geojson', data: empty });
      map.addLayer({ id: 'path-line', type: 'line', source: 'path', paint: { 'line-color': '#1A3C8F', 'line-width': 4, 'line-opacity': 0.85 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
      readyRef.current = true;
      map.resize();
      draw();
    });
    mapRef.current = map;
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(container.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
      endMarkers.current = [];
    };
  }, []);

  function draw() {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    endMarkers.current.forEach((m) => m.remove());
    endMarkers.current = [];

    const segments = cleanSegments(path);
    (map.getSource('path') as maplibregl.GeoJSONSource | undefined)?.setData(
      segments.length
        ? { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'MultiLineString', coordinates: segments }, properties: {} }] }
        : empty,
    );
    if (segments.length === 0) return;

    const first = segments[0][0];
    const lastSeg = segments[segments.length - 1];
    const last = lastSeg[lastSeg.length - 1];
    endMarkers.current.push(new maplibregl.Marker({ element: dot('#22C55E') }).setLngLat(first).addTo(map));
    endMarkers.current.push(new maplibregl.Marker({ element: dot('#EF4444') }).setLngLat(last).addTo(map));

    const b = new maplibregl.LngLatBounds();
    segments.forEach((s) => s.forEach((c) => b.extend(c)));
    map.fitBounds(b, { padding: 60, maxZoom: 16, duration: 500 });
  }

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return <div ref={container} className="w-full rounded-xl overflow-hidden" style={{ height }} />;
}
