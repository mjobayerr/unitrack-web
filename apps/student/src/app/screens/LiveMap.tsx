import { useEffect, useMemo, useRef, useState } from 'react';
import { useNavigate } from 'react-router';
import maplibregl from 'maplibre-gl';
import 'maplibre-gl/dist/maplibre-gl.css';
import { ArrowLeft, Users, Clock, MapPin, Wifi, WifiOff } from 'lucide-react';
import { apiCall, type components } from '../../lib/api';
import { useLiveTrack, type TrackBus } from '../../lib/useLiveTrack';

type Route = components['schemas']['RouteOut'];

// Free OpenStreetMap raster tiles — no API key, matching the spec's zero-quota
// map choice. A vector style (OpenFreeMap) can drop in later behind the same map.
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

const FRESH_COLOR: Record<TrackBus['freshness'], string> = {
  live: '#1A3C8F',
  stale: '#F59E0B',
  lost: '#94A3B8',
};

export function LiveMap() {
  const navigate = useNavigate();
  const [routes, setRoutes] = useState<Route[]>([]);
  const [routeId, setRouteId] = useState<string | null>(null);
  const { buses, connected } = useLiveTrack(routeId);
  const [selectedBusId, setSelectedBusId] = useState<string | null>(null);

  const mapContainer = useRef<HTMLDivElement>(null);
  const mapRef = useRef<maplibregl.Map | null>(null);
  const markersRef = useRef<Record<string, maplibregl.Marker>>({});
  const fittedRef = useRef(false);

  // Routes to choose from; default to the first.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await apiCall((api) => api.GET('/fleet/routes', {}));
        if (cancelled) return;
        setRoutes(r);
        if (r[0]) setRouteId(r[0].id);
      } catch {
        /* leave the picker empty; the map still shows */
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  // Create the map once.
  useEffect(() => {
    if (!mapContainer.current || mapRef.current) return;
    const map = new maplibregl.Map({
      container: mapContainer.current,
      style: OSM_STYLE,
      center: DHAKA,
      zoom: 12,
    });
    map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-right');
    mapRef.current = map;
    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, []);

  // A new route means a fresh set of buses to fit and select.
  useEffect(() => {
    fittedRef.current = false;
    setSelectedBusId(null);
  }, [routeId]);

  // Reconcile markers with the latest frame.
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
          'width:36px;height:36px;border-radius:12px;display:flex;align-items:center;justify-content:center;' +
          'color:#fff;font-weight:700;font-size:11px;box-shadow:0 2px 8px rgba(15,23,42,.35);cursor:pointer;border:2px solid #fff;';
        el.textContent = b.reg_no ? b.reg_no.slice(-4) : 'BUS';
        el.addEventListener('click', () => setSelectedBusId(b.bus_id));
        marker = new maplibregl.Marker({ element: el }).setLngLat(lngLat).addTo(map);
        markersRef.current[b.bus_id] = marker;
      } else {
        marker.setLngLat(lngLat);
      }
      marker.getElement().style.background = FRESH_COLOR[b.freshness];
    }

    // Drop markers for buses no longer in the frame.
    for (const id of Object.keys(markersRef.current)) {
      if (!seen.has(id)) {
        markersRef.current[id].remove();
        delete markersRef.current[id];
      }
    }

    // Frame the fleet once when the first positions arrive for this route.
    if (!fittedRef.current && located.length) {
      const bounds = new maplibregl.LngLatBounds();
      located.forEach((b) => bounds.extend([b.lng!, b.lat!]));
      map.fitBounds(bounds, { padding: 90, maxZoom: 15, duration: 600 });
      fittedRef.current = true;
    }

    if (!selectedBusId && located[0]) setSelectedBusId(located[0].bus_id);
  }, [buses, selectedBusId]);

  const selected = useMemo(
    () => buses.find((b) => b.bus_id === selectedBusId) ?? buses[0] ?? null,
    [buses, selectedBusId],
  );
  const route = routes.find((r) => r.id === routeId);

  const seatsText =
    selected && selected.capacity != null && selected.occupied != null
      ? `${Math.max(selected.capacity - selected.occupied, 0)}/${selected.capacity}`
      : '—';
  const etaText =
    selected?.next_stop_eta_minutes != null ? `${selected.next_stop_eta_minutes} min` : '—';

  return (
    <div className="h-screen bg-gray-100 relative max-w-[430px] mx-auto overflow-hidden">
      {/* Real map */}
      <div ref={mapContainer} className="absolute inset-0" />

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
          className={`w-10 h-10 rounded-full shadow-lg flex items-center justify-center shrink-0 ${
            connected ? 'bg-[#1DB954]' : 'bg-gray-400'
          }`}
          title={connected ? 'Live' : 'Reconnecting…'}
        >
          {connected ? <Wifi className="w-5 h-5 text-white" /> : <WifiOff className="w-5 h-5 text-white" />}
        </div>
      </div>

      {/* Bottom sheet */}
      <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-[24px] shadow-2xl p-6 z-20">
        <div className="w-12 h-1 bg-gray-300 rounded-full mx-auto mb-6" />

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

            <button
              onClick={() => navigate('/pay')}
              className="w-full bg-[#1A3C8F] text-white rounded-[12px] h-12 font-semibold"
            >
              Show Boarding QR
            </button>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-900 font-semibold mb-1">No buses live on this route</p>
            <p className="text-gray-500 text-sm">
              {connected ? 'Waiting for a bus to start its trip.' : 'Connecting to the live feed…'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
