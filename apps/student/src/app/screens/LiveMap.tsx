import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ArrowLeft, Users, Clock, MapPin, Wifi, WifiOff, LocateFixed, Plus, Minus } from 'lucide-react';
import { apiCall, type components } from '../../lib/api';
import { useLiveTrack, type TrackBus } from '../../lib/useLiveTrack';

type Route = components['schemas']['RouteOut'];
type RouteDetail = components['schemas']['RouteDetailOut'];

const OSM_STYLE: maplibregl.StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: ['https://tile.openstreetmap.org/{z}/{x}/{y}.png'],
      tileSize: 256,
      attribution: '© OpenStreetMap contributors',
    },
  },
  layers: [{ id: 'osm', type: 'raster', source: 'osm' }],
};

const DHAKA: [number, number] = [90.4074, 23.7806];
const SHEET_PEEK = 72; // px of the sheet that stays visible when collapsed

const FRESH_COLOR: Record<TrackBus['freshness'], string> = {
  live: '#1A3C8F',
  stale: '#F59E0B',
  lost: '#94A3B8',
};

const emptyFC: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

function routeGeoJson(detail: RouteDetail | undefined) {
  if (!detail || detail.stops.length === 0) return { line: emptyFC, stops: emptyFC };
  const coords = detail.stops.map((rs) => [rs.stop.lng, rs.stop.lat] as [number, number]);
  return {
    line: {
      type: 'FeatureCollection',
      features: [{ type: 'Feature', geometry: { type: 'LineString', coordinates: coords }, properties: {} }],
    } as GeoJSON.FeatureCollection,
    stops: {
      type: 'FeatureCollection',
      features: detail.stops.map((rs) => ({
        type: 'Feature',
        geometry: { type: 'Point', coordinates: [rs.stop.lng, rs.stop.lat] },
        properties: { name: rs.stop.name },
      })),
    } as GeoJSON.FeatureCollection,
  };
}

export function LiveMap() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [shapes, setShapes] = useState<Record<string, RouteDetail>>({});
  const [routeId, setRouteId] = useState<string | null>(null);
  const { buses, connected } = useLiveTrack(routeId);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);
  const [locating, setLocating] = useState(false);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const readyRef = useRef(false);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});
  const meMarkerRef = useRef<maplibregl.Marker | null>(null);
  const mePosRef = useRef<[number, number] | null>(null);
  const meFramedRef = useRef(false);

  // --- collapsible bottom sheet -------------------------------------------
  const sheetRef = useRef<HTMLDivElement>(null);
  const [collapsed, setCollapsed] = useState(false);
  const [dragTy, setDragTy] = useState<number | null>(null);
  const dragRef = useRef<{ y0: number; ty0: number; moved: number } | null>(null);

  const collapsedTy = () => Math.max((sheetRef.current?.offsetHeight ?? 260) - SHEET_PEEK, 0);
  const restTy = collapsed ? collapsedTy() : 0;
  const ty = dragTy ?? restTy;

  function onSheetDown(e: React.PointerEvent) {
    // Capture so the drag keeps tracking if the finger slides off the handle.
    // Wrapped because a browser can reject the capture, and that must not abort
    // the drag.
    try {
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    } catch {
      /* capture unavailable — the drag still works without it */
    }
    dragRef.current = { y0: e.clientY, ty0: ty, moved: 0 };
  }
  function onSheetMove(e: React.PointerEvent) {
    const d = dragRef.current;
    if (!d) return;
    const dy = e.clientY - d.y0;
    d.moved = Math.max(d.moved, Math.abs(dy));
    setDragTy(Math.min(Math.max(d.ty0 + dy, 0), collapsedTy()));
  }
  function onSheetUp() {
    const d = dragRef.current;
    dragRef.current = null;
    if (!d) return;
    if (d.moved < 6) {
      setCollapsed((c) => !c); // a tap toggles
    } else {
      setCollapsed((dragTy ?? 0) > collapsedTy() / 2);
    }
    setDragTy(null);
  }

  // Routes + shapes, one shot.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [r, s] = await Promise.all([
          apiCall((api) => api.GET('/fleet/routes', {})),
          apiCall((api) => api.GET('/fleet/route-shapes', {})).catch(() => [] as RouteDetail[]),
        ]);
        if (cancelled) return;
        setRoutes(r);
        setShapes(Object.fromEntries((s as RouteDetail[]).map((d) => [d.id, d])));
        if (r[0]) setRouteId(r[0].id);
      } catch {
        /* leave the picker empty; the map still shows */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Frame the route and the student's location together, so both are visible.
  function frameMap() {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const detail = routeId ? shapes[routeId] : undefined;
    const b = new maplibregl.LngLatBounds();
    detail?.stops.forEach((rs) => b.extend([rs.stop.lng, rs.stop.lat]));
    if (mePosRef.current) b.extend(mePosRef.current);
    if (b.isEmpty()) return;
    map.fitBounds(b, {
      padding: { top: 88, left: 56, right: 56, bottom: SHEET_PEEK + 48 },
      maxZoom: 15,
      duration: 600,
    });
  }

  // Create the map once; draw the route layers; watch the student's location.
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new maplibregl.Map({ container: mapContainer.current, style: OSM_STYLE, center: DHAKA, zoom: 12 });
    // Zoom is a custom control (below) so it aligns with the other buttons;
    // maplibre's own control sits on a different margin and looks off.
    mapRef.current = map;

    map.on('load', () => {
      map.addSource('route', { type: 'geojson', data: emptyFC });
      map.addSource('route-stops', { type: 'geojson', data: emptyFC });
      map.addLayer({
        id: 'route-line',
        type: 'line',
        source: 'route',
        paint: { 'line-color': '#1A3C8F', 'line-width': 4, 'line-opacity': 0.6 },
        layout: { 'line-cap': 'round', 'line-join': 'round' },
      });
      map.addLayer({
        id: 'route-stops',
        type: 'circle',
        source: 'route-stops',
        paint: { 'circle-radius': 5, 'circle-color': '#ffffff', 'circle-stroke-color': '#1A3C8F', 'circle-stroke-width': 2 },
      });
      readyRef.current = true;
      map.resize();
      pushRoute();
    });

    const ro = new ResizeObserver(() => map.resize());
    ro.observe(mapContainer.current);

    let watchId: number | null = null;
    if ('geolocation' in navigator) {
      watchId = navigator.geolocation.watchPosition(
        (pos) => {
          const at: [number, number] = [pos.coords.longitude, pos.coords.latitude];
          mePosRef.current = at;
          if (!meMarkerRef.current) {
            const el = document.createElement('div');
            el.style.cssText =
              'width:18px;height:18px;border-radius:50%;background:#2563eb;border:3px solid #fff;box-shadow:0 0 0 6px rgba(37,99,235,.25);';
            meMarkerRef.current = new maplibregl.Marker({ element: el }).setLngLat(at).addTo(map);
          } else {
            meMarkerRef.current.setLngLat(at);
          }
          // Bring the student into view once, alongside the route.
          if (!meFramedRef.current) {
            meFramedRef.current = true;
            frameMap();
          }
        },
        () => {},
        { enableHighAccuracy: true, maximumAge: 10_000, timeout: 12_000 },
      );
    }

    return () => {
      ro.disconnect();
      if (watchId != null) navigator.geolocation.clearWatch(watchId);
      map.remove();
      mapRef.current = null;
      readyRef.current = false;
      meMarkerRef.current = null;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function pushRoute() {
    const map = mapRef.current;
    if (!map || !readyRef.current) return;
    const { line, stops } = routeGeoJson(routeId ? shapes[routeId] : undefined);
    (map.getSource('route') as maplibregl.GeoJSONSource | undefined)?.setData(line);
    (map.getSource('route-stops') as maplibregl.GeoJSONSource | undefined)?.setData(stops);
    frameMap();
  }

  useEffect(() => {
    setSelectedBusId(null);
    pushRoute();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [routeId, shapes]);

  // Bus markers.
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const located = buses.filter((b) => b.lat != null && b.lng != null);
    const seen = new Set<string>();
    for (const b of located) {
      seen.add(b.bus_id);
      const lngLat: [number, number] = [b.lng!, b.lat!];
      let marker = markersRef.current[b.bus_id];
      if (!marker) {
        const el = document.createElement('div');
        el.style.cssText =
          'width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;color:#fff;font-weight:700;font-size:11px;box-shadow:0 2px 8px rgba(15,23,42,.35);cursor:pointer;border:2px solid #fff;';
        el.textContent = b.reg_no ? b.reg_no.slice(-4) : 'BUS';
        el.addEventListener('click', () => setSelectedBusId(b.bus_id));
        marker = new maplibregl.Marker({ element: el }).setLngLat(lngLat).addTo(map);
        markersRef.current[b.bus_id] = marker;
      } else {
        marker.setLngLat(lngLat);
      }
      marker.getElement().style.background = FRESH_COLOR[b.freshness];
    }
    for (const id of Object.keys(markersRef.current)) {
      if (!seen.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    }
    if (!selectedBusId && located[0]) setSelectedBusId(located[0].bus_id);
  }, [buses, selectedBusId]);

  function recenter() {
    const map = mapRef.current;
    if (!map) return;
    const at = mePosRef.current;
    if (at) {
      map.easeTo({ center: at, zoom: 15, duration: 500 });
      return;
    }
    setLocating(true);
    navigator.geolocation?.getCurrentPosition(
      (pos) => {
        setLocating(false);
        const c: [number, number] = [pos.coords.longitude, pos.coords.latitude];
        mePosRef.current = c;
        map.easeTo({ center: c, zoom: 15, duration: 500 });
      },
      () => setLocating(false),
      { enableHighAccuracy: true, timeout: 12_000 },
    );
  }

  const selected = useMemo(
    () => buses.find((b) => b.bus_id === selectedBusId) ?? buses[0] ?? null,
    [buses, selectedBusId],
  );
  const route = routes.find((r) => r.id === routeId);
  const liveCount = buses.filter((b) => b.freshness === 'live').length;

  const seatsText =
    selected && selected.capacity != null && selected.occupied != null
      ? `${Math.max(selected.capacity - selected.occupied, 0)}/${selected.capacity}`
      : '—';
  const etaText = selected?.next_stop_eta_minutes != null ? `${selected.next_stop_eta_minutes} min` : '—';

  return (
    <div className="h-full bg-gray-100 relative overflow-hidden">
      <div ref={mapContainer} className="absolute inset-0 h-full w-full" />

      {/* Top bar: back + route picker + connection */}
      <div className="absolute top-0 left-0 right-0 p-4 z-10 flex items-center gap-2">
        <button
          onClick={() => navigate('/')}
          className="w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center shrink-0"
        >
          <ArrowLeft className="w-5 h-5 text-gray-700" />
        </button>
        <div className="flex-1 bg-white rounded-full shadow-lg h-10 flex items-center px-2">
          <select
            value={routeId ?? ''}
            onChange={(e) => setRouteId(e.target.value || null)}
            className="w-full bg-transparent text-sm text-gray-800 font-medium focus:outline-none px-2"
          >
            {routes.length === 0 && <option value="">No routes</option>}
            {routes.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} · {r.direction}
              </option>
            ))}
          </select>
        </div>
        <div
          className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center shrink-0 ${connected ? 'bg-[#1DB954]' : 'bg-gray-400'}`}
          title={connected ? 'Live' : 'Reconnecting…'}
        >
          {connected ? <Wifi className="w-5 h-5 text-white" /> : <WifiOff className="w-5 h-5 text-white" />}
        </div>
      </div>

      {/* Right-side control stack — all at right-4 (16px), w-10, so they line
          up with the connection pill in the top bar. */}
      <div className="absolute right-4 top-[5.5rem] z-10 bg-white rounded-full shadow-lg flex flex-col overflow-hidden">
        <button
          onClick={() => mapRef.current?.zoomIn()}
          className="w-10 h-10 flex items-center justify-center text-gray-700 active:bg-gray-100"
          aria-label="Zoom in"
        >
          <Plus className="w-5 h-5" />
        </button>
        <div className="h-px bg-gray-200 mx-2" />
        <button
          onClick={() => mapRef.current?.zoomOut()}
          className="w-10 h-10 flex items-center justify-center text-gray-700 active:bg-gray-100"
          aria-label="Zoom out"
        >
          <Minus className="w-5 h-5" />
        </button>
      </div>
      <button
        onClick={recenter}
        className="absolute right-4 top-[10.5rem] z-10 w-10 h-10 bg-white rounded-full shadow-lg flex items-center justify-center active:bg-gray-100"
        title="Center on my location"
        aria-label="Center on my location"
      >
        <LocateFixed className={`w-5 h-5 ${locating ? 'text-gray-400 animate-pulse' : 'text-[#1A3C8F]'}`} />
      </button>

      {/* Draggable / collapsible bottom sheet */}
      <div
        ref={sheetRef}
        style={{ transform: `translateY(${ty}px)`, transition: dragTy != null ? 'none' : 'transform .25s ease' }}
        className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-2xl z-20 touch-none"
      >
        {/* Grab area (handle + summary) — stays visible when collapsed. */}
        <div
          onPointerDown={onSheetDown}
          onPointerMove={onSheetMove}
          onPointerUp={onSheetUp}
          className="px-6 pt-3 pb-3 cursor-grab active:cursor-grabbing select-none"
        >
          <div className="w-12 h-1.5 bg-gray-300 rounded-full mx-auto mb-3" />
          <div className="flex items-center justify-between">
            <p className="font-semibold text-gray-900 text-sm truncate">
              {route ? `${route.name} · ${route.direction}` : 'Live map'}
            </p>
            <span className={`text-xs shrink-0 ml-2 ${liveCount > 0 ? 'text-[#1DB954]' : 'text-gray-400'}`}>
              {liveCount > 0 ? `${liveCount} live` : 'No buses live'}
            </span>
          </div>
        </div>

        <div className="px-6 pb-6">
          {selected ? (
            <div className="space-y-4">
              <div className="flex items-start justify-between">
                <div>
                  <h2 className="text-2xl text-gray-900 mb-1">{selected.nickname || `Bus ${selected.reg_no}`}</h2>
                  <p className="text-gray-500 flex items-center gap-1 text-sm">
                    <MapPin className="w-4 h-4" />
                    {route ? `${route.name} · ${route.direction}` : selected.reg_no}
                  </p>
                </div>
                <div className="text-right">
                  <div className="flex items-center gap-1 text-[#1DB954] mb-1 justify-end">
                    <Clock className="w-4 h-4" />
                    <span className="text-lg">{etaText}</span>
                  </div>
                  <p className="text-sm text-gray-500 capitalize">{selected.freshness}</p>
                </div>
              </div>

              <div className="flex items-center justify-between bg-[#1DB954]/10 rounded-[12px] p-4">
                <div className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#1DB954]" />
                  <span className="text-gray-900">Seats Available</span>
                </div>
                <span className="text-lg text-[#1DB954]">{seatsText}</span>
              </div>

              <button onClick={() => navigate('/pay')} className="w-full bg-[#1A3C8F] text-white rounded-[12px] h-12 font-semibold">
                Show Boarding QR
              </button>
            </div>
          ) : (
            <div className="text-center py-4">
              <p className="text-gray-900 font-semibold mb-1">
                {route ? 'No buses live on this route' : 'Live bus map'}
              </p>
              <p className="text-gray-500 text-sm">
                {route
                  ? connected
                    ? 'Waiting for a bus to start its trip.'
                    : 'Connecting to the live feed…'
                  : 'Pick a route to see its buses. Your location is the blue dot.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
