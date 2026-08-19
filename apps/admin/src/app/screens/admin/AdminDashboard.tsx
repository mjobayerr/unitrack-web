import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { Bus, Activity, Route as RouteIcon, UserCheck, AlertTriangle, Loader2 } from 'lucide-react';
import { apiCall, type components } from '../../../lib/api';
import { LiveFleetMap } from '../../components/LiveFleetMap';

type Fleet = components['schemas']['FleetOut'];
type BusT = components['schemas']['BusOut'];
type RouteT = components['schemas']['RouteOut'];
type Helper = components['schemas']['HelperOut'];
type Alert = components['schemas']['AlertOut'];

function timeAgo(iso: string): string {
  const s = Math.max(0, Math.floor((Date.now() - new Date(iso).getTime()) / 1000));
  if (s < 60) return `${s}s ago`;
  if (s < 3600) return `${Math.floor(s / 60)}m ago`;
  if (s < 86400) return `${Math.floor(s / 3600)}h ago`;
  return `${Math.floor(s / 86400)}d ago`;
}

export function AdminDashboard() {
  const navigate = useNavigate();
  const [fleet, setFleet] = useState<Fleet | null>(null);
  const [buses, setBuses] = useState<BusT[]>([]);
  const [routes, setRoutes] = useState<RouteT[]>([]);
  const [helpers, setHelpers] = useState<Helper[]>([]);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const [f, b, r, h, a] = await Promise.all([
        apiCall((api) => api.GET('/admin/fleet', {})).catch(() => null),
        apiCall((api) => api.GET('/admin/buses', {})).catch(() => [] as BusT[]),
        apiCall((api) => api.GET('/fleet/routes', { params: { query: { only_active: false } } })).catch(() => [] as RouteT[]),
        apiCall((api) => api.GET('/admin/helpers', {})).catch(() => [] as Helper[]),
        apiCall((api) => api.GET('/admin/alerts', {})).catch(() => [] as Alert[]),
      ]);
      if (cancelled) return;
      setFleet(f);
      setBuses(b);
      setRoutes(r);
      setHelpers(h);
      setAlerts(a);
      setLoaded(true);
    };
    void load();
    const id = window.setInterval(load, 20_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const pending = helpers.filter((h) => h.helper_status === 'pending').length;
  const activeBuses = buses.filter((b) => b.status === 'active').length;
  const openAlerts = alerts.filter((a) => a.status === 'open');

  const stats = [
    { name: 'Live buses now', value: fleet ? String(fleet.live) : '—', icon: Activity, color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10' },
    { name: 'Active buses', value: loaded ? String(activeBuses) : '—', icon: Bus, color: 'text-[#3B82F6]', bg: 'bg-[#3B82F6]/10' },
    { name: 'Routes', value: loaded ? String(routes.length) : '—', icon: RouteIcon, color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10' },
    { name: 'Helpers awaiting approval', value: loaded ? String(pending) : '—', icon: UserCheck, color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat) => (
          <div key={stat.name} className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6 flex items-center justify-between">
            <div>
              <p className="text-slate-400 text-sm font-medium">{stat.name}</p>
              <h3 className="text-white text-2xl font-bold mt-1">{stat.value}</h3>
            </div>
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${stat.bg}`}>
              <stat.icon className={`w-6 h-6 ${stat.color}`} />
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Live fleet */}
        <div className="lg:col-span-2 bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-white font-semibold">Live fleet</h3>
            <button onClick={() => navigate('/monitoring')} className="text-sm text-[#3B82F6] font-medium hover:text-white">Open monitoring</button>
          </div>
          {!fleet ? (
            <div className="py-12 flex items-center justify-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading…</div>
          ) : fleet.buses.length === 0 ? (
            <p className="py-12 text-center text-slate-400">No trips running right now.</p>
          ) : (
            <div className="space-y-3">
              <div className="flex gap-4 text-sm">
                <span className="text-[#22C55E]">{fleet.live} live</span>
                <span className="text-[#F59E0B]">{fleet.stale} stale</span>
                <span className="text-slate-400">{fleet.lost} lost</span>
              </div>
              <LiveFleetMap buses={fleet.buses} height="22rem" />
            </div>
          )}
        </div>

        {/* Open alerts */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
            Open alerts {openAlerts.length > 0 && <span className="text-[#F59E0B] text-sm">({openAlerts.length})</span>}
          </h3>
          {!loaded ? (
            <p className="text-slate-400 text-sm">Loading…</p>
          ) : openAlerts.length === 0 ? (
            <p className="text-slate-400 text-sm">No open alerts.</p>
          ) : (
            <div className="space-y-4">
              {openAlerts.slice(0, 5).map((a) => (
                <div key={a.id} className="flex gap-3 items-start">
                  <div className={`w-2 h-2 rounded-full mt-2 shrink-0 ${a.severity === 'critical' ? 'bg-[#EF4444]' : 'bg-[#F59E0B]'}`} />
                  <div className="min-w-0">
                    <p className="text-slate-200 text-sm font-medium capitalize">{a.type.replace(/_/g, ' ')}</p>
                    <p className="text-slate-400 text-xs truncate">{a.message || a.source} · {timeAgo(a.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
          <button onClick={() => navigate('/emergency')} className="w-full mt-4 text-sm text-[#3B82F6] font-medium hover:text-white transition-colors">View all alerts</button>
        </div>
      </div>
    </div>
  );
}
