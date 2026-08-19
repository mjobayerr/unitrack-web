import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { components } from '../../lib/api';

type GpsPoint = components['schemas']['GpsPoint'];
type LL = [number, number]; // [lng, lat]

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const DHAKA: [number, number] = [90.4074, 23.7806];
const empty: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

// --- ordering --------------------------------------------------------------
// Sort by time, drop stationary jitter and impossible-speed outliers, and break
// the track into separate segments only on a real pause (parked between trips).
const R = 6371000;
const rad = Math.PI / 180;
const GAP_SECONDS = 600;
const MAX_KMH = 130;
const OUTLIER_M = 250;

function meters(a: LL, b: LL): number {
  const dLat = (b[1] - a[1]) * rad * R;
  const dLng = (b[0] - a[0]) * rad * R * Math.cos(((a[1] + b[1]) / 2) * rad);
  return Math.hypot(dLat, dLng);
}

function orderedSegments(path: GpsPoint[]): LL[][] {
  const raw = path
    .filter((p) => p.latitude != null && p.longitude != null)
    .map((p) => ({ t: new Date(p.timestamp).getTime() / 1000, ll: [p.longitude, p.latitude] as LL }))
    .sort((a, b) => a.t - b.t);
  if (raw.length === 0) return [];

  const segments: LL[][] = [[]];
  let prev: { t: number; ll: LL } | null = null;
  for (const p of raw) {
    if (prev) {
      const d = meters(p.ll, prev.ll);
      const dt = Math.max(p.t - prev.t, 0.001);
      if (d < 3) continue; // stationary jitter
      if ((d / dt) * 3.6 > MAX_KMH && d > OUTLIER_M) continue; // teleport outlier
      if (dt > GAP_SECONDS) segments.push([]); // real pause = new segment
    }
    segments[segments.length - 1].push(p.ll);
    prev = p;
  }
  return segments.filter((s) => s.length >= 2);
}

// --- snap to roads (OSRM map matching) -------------------------------------
// Straight lines between sparse fixes cut across buildings; matching pins the
// trace to the actual road network. Free public OSRM, so it is best-effort — a
// failed or rate-limited match falls back to the raw segment.
const OSRM = 'https://router.project-osrm.org/match/v1/driving';
const CHUNK = 90; // OSRM demo caps coordinates per request

async function matchChunk(coords: LL[]): Promise<LL[] | null> {
  if (coords.length < 2) return null;
  const path = coords.map((c) => `${c[0].toFixed(6)},${c[1].toFixed(6)}`).join(';');
  const radiuses = coords.map(() => 35).join(';');
  try {
    const res = await fetch(`${OSRM}/${path}?geometries=geojson&overview=full&tidy=true&radiuses=${radiuses}`);
    if (!res.ok) return null;
    const d = await res.json();
    if (d.code !== 'Ok' || !Array.isArray(d.matchings) || d.matchings.length === 0) return null;
    const out: LL[] = [];
    for (const m of d.matchings) {
      if (m?.geometry?.coordinates) for (const c of m.geometry.coordinates) out.push(c as LL);
    }
    return out.length >= 2 ? out : null;
  } catch {
    return null;
  }
}

async function matchSegment(coords: LL[]): Promise<LL[]> {
  if (coords.length <= CHUNK) return (await matchChunk(coords)) ?? coords;
  const parts: LL[] = [];
  for (let i = 0; i < coords.length; i += CHUNK - 1) {
    const slice = coords.slice(i, i + CHUNK);
    const matched = await matchChunk(slice);
    parts.push(...(matched ?? slice));
    if (i + CHUNK >= coords.length) break;
  }
  return parts;
}

function fc(segments: LL[][]): GeoJSON.FeatureCollection {
  const lines = segments.filter((s) => s.length >= 2);
  if (lines.length === 0) return empty;
  return { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'MultiLineString', coordinates: lines }, properties: {} }] };
}

function dot(color: string): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)`;
  return el;
}

/** A bus's recorded path, snapped to the road network (OSRM). Draws the raw
 * trace first, then upgrades to the matched geometry so roads are followed. */
export function PathMap({ path, height = '30rem' }: { path: GpsPoint[]; height?: string }) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const readyRef = useRef(false);
  const endMarkers = useRef<maplibregl.Marker[]>([]);
  const runId = useRef(0);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: container.current, style: MAP_STYLE, center: DHAKA, zoom: 11 });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('load', () => {
      map.addSource('path', { type: 'geojson', data: empty });
      map.addLayer({ id: 'path-line', type: 'line', source: 'path', paint: { 'line-color': '#1A3C8F', 'line-width': 4, 'line-opacity': 0.85 }, layout: { 'line-cap': 'round', 'line-join': 'round' } });
      readyRef.current = true;
      map.resize();
      render();
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

  function drawSegments(segments: LL[][]) {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    (map.getSource('path') as maplibregl.GeoJSONSource | undefined)?.setData(fc(segments));
    endMarkers.current.forEach((m) => m.remove());
    endMarkers.current = [];
    const valid = segments.filter((s) => s.length >= 2);
    if (valid.length === 0) return;
    const first = valid[0][0];
    const lastSeg = valid[valid.length - 1];
    const last = lastSeg[lastSeg.length - 1];
    endMarkers.current.push(new maplibregl.Marker({ element: dot('#22C55E') }).setLngLat(first).addTo(map));
    endMarkers.current.push(new maplibregl.Marker({ element: dot('#EF4444') }).setLngLat(last).addTo(map));
    const b = new maplibregl.LngLatBounds();
    valid.forEach((s) => s.forEach((c) => b.extend(c)));
    map.fitBounds(b, { padding: 60, maxZoom: 16, duration: 500 });
  }

  async function render() {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const id = ++runId.current;
    const raw = orderedSegments(path);
    drawSegments(raw); // instant: raw trace
    if (raw.length === 0) return;
    // Snap each segment to roads, then redraw (best-effort, sequential to be
    // gentle on the public service).
    const matched: LL[][] = [];
    for (const seg of raw) {
      matched.push(await matchSegment(seg));
      if (runId.current !== id) return; // a newer path superseded this run
    }
    if (runId.current === id) drawSegments(matched);
  }

  useEffect(() => {
    void render();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return <div ref={container} className="w-full rounded-xl overflow-hidden" style={{ height }} />;
}
