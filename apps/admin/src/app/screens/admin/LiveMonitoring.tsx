import { useEffect, useMemo, useState } from 'react';
import { Bus, Circle, Users, Clock, MapPin, Loader2 } from 'lucide-react';
import { apiCall, type components } from '../../../lib/api';
import { LiveFleetMap } from '../../components/LiveFleetMap';

type Fleet = components['schemas']['FleetOut'];
type FleetBus = components['schemas']['FleetBusOut'];
type Freshness = components['schemas']['GpsFreshness'];

const FRESH: Record<Freshness, { label: string; color: string; bg: string; dot: string }> = {
  live: { label: 'Live', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10', dot: 'bg-[#22C55E]' },
  stale: { label: 'Stale', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', dot: 'bg-[#F59E0B]' },
  lost: { label: 'Lost', color: 'text-slate-400', bg: 'bg-slate-700/40', dot: 'bg-slate-400' },
};

type FilterType = 'all' | Freshness;

export function LiveMonitoring() {
  const [fleet, setFleet] = useState<Fleet | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      const f = await apiCall((api) => api.GET('/admin/fleet', {})).catch(() => null);
      if (!cancelled && f) setFleet(f);
      else if (!cancelled) setFleet((prev) => prev ?? { generated_at: '', total: 0, live: 0, stale: 0, lost: 0, buses: [] });
    };
    void load();
    const id = window.setInterval(load, 10_000);
    return () => {
      cancelled = true;
      window.clearInterval(id);
    };
  }, []);

  const buses = fleet?.buses ?? [];
  const filtered = useMemo(() => buses.filter((b) => filter === 'all' || b.freshness === filter), [buses, filter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {([['live', fleet?.live], ['stale', fleet?.stale], ['lost', fleet?.lost]] as [Freshness, number | undefined][]).map(([k, v]) => (
          <button key={k} onClick={() => setFilter(filter === k ? 'all' : k)} className={`bg-[#1E293B] border rounded-2xl p-5 text-center transition-colors ${filter === k ? 'border-[#3B82F6]' : 'border-slate-800'}`}>
            <p className={`text-3xl font-bold ${FRESH[k].color}`}>{fleet ? v : '—'}</p>
            <p className="text-slate-400 text-sm mt-1">{FRESH[k].label}</p>
          </button>
        ))}
      </div>

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-3">
        <LiveFleetMap buses={buses} selectedId={selected} onSelect={setSelected} height="30rem" />
      </div>

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2"><Bus className="w-5 h-5 text-[#3B82F6]" /> Live trips</h3>
          <span className="text-xs text-[#22C55E] font-semibold flex items-center gap-1.5"><Circle className="w-2 h-2 fill-current" /> Auto-refreshing</span>
        </div>

        {fleet === null ? (
          <div className="px-6 py-16 flex items-center justify-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading fleet…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-400"><Bus className="w-8 h-8 mx-auto mb-2 text-slate-600" />{buses.length === 0 ? 'No trips running right now.' : `No ${filter} buses.`}</div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filtered.map((b: FleetBus) => {
              const free = b.capacity != null && b.occupied != null ? Math.max(b.capacity - b.occupied, 0) : null;
              return (
                <div
                  key={b.trip_id}
                  onClick={() => setSelected(b.bus_id)}
                  className={`px-6 py-4 flex items-center justify-between gap-4 cursor-pointer transition-colors ${selected === b.bus_id ? 'bg-[#3B82F6]/10' : 'hover:bg-slate-800/40'}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-full bg-[#3B82F6]/15 flex items-center justify-center shrink-0"><Bus className="w-4 h-4 text-[#3B82F6]" /></div>
                    <div className="min-w-0">
                      <p className="text-white text-sm font-medium truncate">{b.nickname || b.reg_no}</p>
                      <p className="text-slate-400 text-xs truncate">{b.route_name} · {b.route_direction} · {b.helper_name}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 shrink-0 text-sm">
                    {free != null && (
                      <span className="text-slate-300 flex items-center gap-1"><Users className="w-3.5 h-3.5 text-slate-500" />{free}/{b.capacity}</span>
                    )}
                    {b.next_stop_eta_minutes != null && (
                      <span className="text-slate-300 flex items-center gap-1"><Clock className="w-3.5 h-3.5 text-slate-500" />{b.next_stop_eta_minutes}m</span>
                    )}
                    {b.lat != null && b.lng != null && (
                      <span className="text-slate-500 flex items-center gap-1 text-xs"><MapPin className="w-3.5 h-3.5" />{b.lat.toFixed(3)},{b.lng.toFixed(3)}</span>
                    )}
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${FRESH[b.freshness].color} ${FRESH[b.freshness].bg}`}>{FRESH[b.freshness].label}</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
