import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { components } from '../../lib/api';

type GpsPoint = components['schemas']['GpsPoint'];

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const DHAKA: [number, number] = [90.4074, 23.7806];
const empty: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

function dot(color: string): HTMLDivElement {
  const el = document.createElement('div');
  el.style.cssText = `width:14px;height:14px;border-radius:50%;background:${color};border:3px solid #fff;box-shadow:0 1px 4px rgba(0,0,0,.4)`;
  return el;
}

/** Draws a bus's recorded GPS path as a line, with start (green) and end (red)
 * markers, framed to the whole track. */
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

    const coords = path.filter((p) => p.latitude != null && p.longitude != null).map((p) => [p.longitude, p.latitude] as [number, number]);
    (map.getSource('path') as maplibregl.GeoJSONSource | undefined)?.setData(
      coords.length >= 2 ? { type: 'FeatureCollection', features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} }] } : empty,
    );
    if (coords.length === 0) return;

    endMarkers.current.push(new maplibregl.Marker({ element: dot('#22C55E') }).setLngLat(coords[0]).addTo(map));
    if (coords.length > 1) endMarkers.current.push(new maplibregl.Marker({ element: dot('#EF4444') }).setLngLat(coords[coords.length - 1]).addTo(map));

    const b = new maplibregl.LngLatBounds();
    coords.forEach((c) => b.extend(c));
    map.fitBounds(b, { padding: 60, maxZoom: 15, duration: 500 });
  }

  useEffect(() => {
    draw();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [path]);

  return <div ref={container} className="w-full rounded-xl overflow-hidden" style={{ height }} />;
}
