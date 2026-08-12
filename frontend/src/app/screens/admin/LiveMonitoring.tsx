import { useState } from 'react';
import { Bus, Circle, Filter } from 'lucide-react';

const buses = [
  { id: '101-A', route: 'Mirpur → Campus', status: 'on-route', passengers: 34, capacity: 50, lat: 23.82, lng: 90.36, eta: '5 min', driver: 'Rahim Uddin' },
  { id: '102-B', route: 'Uttara → Campus', status: 'on-route', passengers: 48, capacity: 50, lat: 23.86, lng: 90.38, eta: '12 min', driver: 'Salam Khan' },
  { id: '103-C', route: 'Dhanmondi → Campus', status: 'on-route', passengers: 22, capacity: 40, lat: 23.75, lng: 90.37, eta: '8 min', driver: 'Jamal Hossain' },
  { id: '104-B', route: 'Campus → Gazipur', status: 'on-route', passengers: 42, capacity: 50, lat: 23.98, lng: 90.42, eta: '—', driver: 'Karim Ali' },
  { id: '105-D', route: 'Azimpur → Campus', status: 'idle', passengers: 0, capacity: 40, lat: 23.72, lng: 90.40, eta: '—', driver: 'Faruk Mia' },
  { id: '106-E', route: 'Tongi → Campus', status: 'breakdown', passengers: 0, capacity: 50, lat: 23.89, lng: 90.40, eta: '—', driver: 'Hafiz Rahman' },
];

const statusConfig = {
  'on-route': { label: 'On Route', color: 'text-[#22C55E]', bg: 'bg-[#22C55E]/10', dot: 'bg-[#22C55E]' },
  'idle': { label: 'Idle', color: 'text-slate-400', bg: 'bg-slate-800', dot: 'bg-slate-400' },
  'breakdown': { label: 'Breakdown', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', dot: 'bg-[#EF4444]' },
};

type FilterType = 'all' | 'on-route' | 'idle' | 'breakdown';

export function LiveMonitoring() {
  const [filter, setFilter] = useState<FilterType>('all');

  const filtered = buses.filter(b => filter === 'all' || b.status === filter);

  return (
    <div className="space-y-6">
      {/* KPI Row */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'On Route', value: buses.filter(b => b.status === 'on-route').length, color: 'text-[#22C55E]' },
          { label: 'Idle', value: buses.filter(b => b.status === 'idle').length, color: 'text-slate-400' },
          { label: 'Breakdown', value: buses.filter(b => b.status === 'breakdown').length, color: 'text-[#EF4444]' },
        ].map(k => (
          <div key={k.label} className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 text-center">
            <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
            <p className="text-slate-400 text-sm mt-1">{k.label}</p>
          </div>
        ))}
      </div>

      {/* Map placeholder */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-white font-semibold flex items-center gap-2">
            <Bus className="w-5 h-5 text-[#3B82F6]" /> Live GPS Map
          </h3>
          <span className="text-xs text-[#22C55E] font-semibold flex items-center gap-1.5">
            <Circle className="w-2 h-2 fill-current" /> Live
          </span>
        </div>
        <div className="h-72 bg-[#0F172A] relative flex items-center justify-center">
          <div className="absolute inset-0 opacity-10">
            {/* Grid lines */}
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="absolute border-t border-slate-600" style={{ top: `${(i + 1) * 12.5}%`, left: 0, right: 0 }} />
            ))}
            {Array.from({ length: 8 }, (_, i) => (
              <div key={i} className="absolute border-l border-slate-600" style={{ left: `${(i + 1) * 12.5}%`, top: 0, bottom: 0 }} />
            ))}
          </div>
          {buses.filter(b => b.status === 'on-route').map((bus, i) => (
            <div
              key={bus.id}
              className="absolute"
              style={{ left: `${20 + i * 13}%`, top: `${25 + (i % 3) * 20}%` }}
            >
              <div className="relative">
                <div className="w-8 h-8 bg-[#1A3C8F] rounded-full flex items-center justify-center border-2 border-[#3B82F6] shadow-lg">
                  <Bus className="w-4 h-4 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-[#22C55E] rounded-full border border-[#0F172A] animate-pulse" />
                <div className="absolute top-9 left-1/2 -translate-x-1/2 whitespace-nowrap bg-slate-900 border border-slate-700 rounded px-1.5 py-0.5 text-white text-xs font-bold">
                  {bus.id}
                </div>
              </div>
            </div>
          ))}
          <p className="text-slate-600 text-sm">Interactive map — GPS coordinates updating live</p>
        </div>
      </div>

      {/* Bus List */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800 flex items-center justify-between flex-wrap gap-3">
          <h3 className="text-white font-semibold">Fleet Status</h3>
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-slate-400" />
            {(['all', 'on-route', 'idle', 'breakdown'] as const).map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize transition-colors ${filter === f ? 'bg-[#1A3C8F] text-white' : 'text-slate-400 hover:text-white'}`}
              >
                {f === 'all' ? 'All' : f.replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>
        <div className="divide-y divide-slate-800">
          {filtered.map(bus => {
            const cfg = statusConfig[bus.status as keyof typeof statusConfig];
            const occ = Math.round((bus.passengers / bus.capacity) * 100);
            return (
              <div key={bus.id} className="px-6 py-4 flex items-center gap-4">
                <div className="w-10 h-10 bg-[#1A3C8F]/20 rounded-xl flex items-center justify-center shrink-0">
                  <Bus className="w-5 h-5 text-[#3B82F6]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-white font-semibold text-sm">Bus {bus.id}</span>
                    <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>
                      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot}`} /> {cfg.label}
                    </span>
                  </div>
                  <p className="text-slate-400 text-xs truncate mt-0.5">{bus.route}</p>
                  <div className="mt-1.5 w-32 h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${occ > 80 ? 'bg-[#EF4444]' : occ > 60 ? 'bg-[#F59E0B]' : 'bg-[#22C55E]'}`} style={{ width: `${occ}%` }} />
                  </div>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-white text-sm font-semibold">{bus.passengers}/{bus.capacity}</p>
                  <p className="text-slate-500 text-xs">seats</p>
                  {bus.eta !== '—' && <p className="text-[#F59E0B] text-xs font-semibold mt-0.5">ETA {bus.eta}</p>}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
