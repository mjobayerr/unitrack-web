import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import type { components } from '../../lib/api';

type FleetBus = components['schemas']['FleetBusOut'];

const MAP_STYLE = 'https://tiles.openfreemap.org/styles/positron';
const DHAKA: [number, number] = [90.4074, 23.7806];

const COLOR: Record<FleetBus['freshness'], string> = {
  live: '#22C55E',
  stale: '#F59E0B',
  lost: '#94A3B8',
};

function esc(s: string): string {
  return s.replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[c]!);
}

function popupHtml(b: FleetBus): string {
  const free = b.capacity != null && b.occupied != null ? `${Math.max(b.capacity - b.occupied, 0)}/${b.capacity} free` : 'seats —';
  const eta = b.next_stop_eta_minutes != null ? `${b.next_stop_eta_minutes} min to next stop` : '';
  return `<div style="font:12px system-ui;color:#0f172a;min-width:150px">
    <div style="font-weight:700;font-size:13px">${esc(b.nickname || b.reg_no)}</div>
    <div style="color:#475569">${esc(b.route_name)} · ${esc(b.route_direction)}</div>
    <div style="color:#475569">Helper: ${esc(b.helper_name)}</div>
    <div style="margin-top:4px">${free}${eta ? ' · ' + eta : ''}</div>
    <div style="margin-top:2px;text-transform:capitalize;color:${COLOR[b.freshness]}">${b.freshness}</div>
  </div>`;
}

/** A live map of the fleet: one clickable marker per bus, coloured by GPS
 * freshness. Markers reconcile in place as positions update, so a bus slides
 * rather than blinking. */
export function LiveFleetMap({ buses, height = '32rem', selectedId, onSelect }: {
  buses: FleetBus[];
  height?: string;
  selectedId?: string | null;
  onSelect?: (busId: string) => void;
}) {
  const container = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const readyRef = useRef(false);
  const markers = useRef<Record<string, maplibregl.Marker>>({});
  const fitted = useRef(false);

  useEffect(() => {
    if (!container.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: container.current, style: MAP_STYLE, center: DHAKA, zoom: 11 });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    map.on('load', () => {
      readyRef.current = true;
      map.resize();
    });
    mapRef.current = map;
    const ro = new ResizeObserver(() => map.resize());
    ro.observe(container.current);
    return () => {
      ro.disconnect();
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
      markers.current = {};
    };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const located = buses.filter((b) => b.lat != null && b.lng != null);
    const seen = new Set<string>();

    for (const b of located) {
      seen.add(b.bus_id);
      const lngLat: [number, number] = [b.lng!, b.lat!];
      let marker = markers.current[b.bus_id];
      if (!marker) {
        const el = document.createElement('div');
        el.style.cssText =
          'padding:2px 7px;border-radius:9px;color:#fff;font:700 10px system-ui;white-space:nowrap;' +
          'box-shadow:0 2px 6px rgba(15,23,42,.4);border:2px solid #fff;cursor:pointer;';
        el.textContent = b.reg_no.slice(-6);
        marker = new maplibregl.Marker({ element: el })
          .setLngLat(lngLat)
          .setPopup(new maplibregl.Popup({ offset: 14, closeButton: false }).setHTML(popupHtml(b)))
          .addTo(map);
        el.addEventListener('click', () => onSelect?.(b.bus_id));
        markers.current[b.bus_id] = marker;
      } else {
        marker.setLngLat(lngLat);
        marker.getPopup()?.setHTML(popupHtml(b));
      }
      const el = marker.getElement();
      el.style.background = COLOR[b.freshness];
      el.style.outline = b.bus_id === selectedId ? '3px solid #3B82F6' : 'none';
    }

    for (const id of Object.keys(markers.current)) {
      if (!seen.has(id)) {
        markers.current[id].remove();
        delete markers.current[id];
      }
    }

    if (!fitted.current && located.length && readyRef.current) {
      const b = new maplibregl.LngLatBounds();
      located.forEach((x) => b.extend([x.lng!, x.lat!]));
      map.fitBounds(b, { padding: 70, maxZoom: 14, duration: 500 });
      fitted.current = true;
    }
  }, [buses, selectedId, onSelect]);

  return <div ref={container} className="w-full rounded-xl overflow-hidden" style={{ height }} />;
}
