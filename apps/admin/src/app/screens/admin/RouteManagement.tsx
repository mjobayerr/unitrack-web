import { useState } from 'react';
import { Plus, Edit2, MapPin, ChevronDown, ChevronRight } from 'lucide-react';

const routes = [
  {
    id: 'R01', name: 'Mirpur Route', from: 'Mirpur-10', to: 'DUET Campus',
    fare: 15, buses: ['101-A'], status: 'Active', stops: ['Mirpur-10', 'Mirpur-1', 'Pallabi', 'Matikata', 'Campus'],
  },
  {
    id: 'R02', name: 'Uttara Route', from: 'Uttara Sector-7', to: 'DUET Campus',
    fare: 20, buses: ['102-B'], status: 'Active', stops: ['Uttara Sector-7', 'Abdullahpur', 'Tongi Bridge', 'Joydebpur', 'Campus'],
  },
  {
    id: 'R03', name: 'Gazipur Route', from: 'DUET Campus', to: 'Gazipur Chowrasta',
    fare: 15, buses: ['104-B'], status: 'Active', stops: ['Campus', 'Joydebpur', 'Board Bazar', 'Gazipur Chowrasta'],
  },
  {
    id: 'R04', name: 'Dhanmondi Route', from: 'Dhanmondi-27', to: 'DUET Campus',
    fare: 25, buses: ['103-C'], status: 'Active', stops: ['Dhanmondi-27', 'Farmgate', 'Airport Road', 'Uttara', 'Joydebpur', 'Campus'],
  },
  {
    id: 'R05', name: 'Azimpur Route', from: 'Azimpur', to: 'DUET Campus',
    fare: 20, buses: ['105-D'], status: 'Inactive', stops: ['Azimpur', 'New Market', 'Farmgate', 'Tongi', 'Campus'],
  },
];

export function RouteManagement() {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">Route Management</h2>
          <p className="text-slate-400 text-sm mt-0.5">{routes.length} routes configured</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-[#1A3C8F] text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add Route
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Add New Route</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {['Route Name', 'From', 'To', 'Fare (৳)', 'Assign Bus'].map(f => (
              <div key={f}>
                <label className="text-slate-400 text-xs font-semibold uppercase mb-1.5 block">{f}</label>
                <input className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6]" placeholder={f} />
              </div>
            ))}
            <div className="md:col-span-2">
              <label className="text-slate-400 text-xs font-semibold uppercase mb-1.5 block">Stops (comma-separated)</label>
              <input className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6]" placeholder="Stop 1, Stop 2, Stop 3..." />
            </div>
          </div>
          <div className="flex gap-3 mt-5">
            <button className="bg-[#1A3C8F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">Save Route</button>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white px-5 py-2.5 text-sm font-semibold">Cancel</button>
          </div>
        </div>
      )}

      <div className="space-y-3">
        {routes.map(route => (
          <div key={route.id} className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
            <div
              className="w-full px-6 py-4 flex items-center gap-4 text-left hover:bg-slate-800/50 transition-colors cursor-pointer"
              onClick={() => setExpanded(expanded === route.id ? null : route.id)}
            >
              <div className="w-10 h-10 bg-[#1A3C8F]/20 rounded-xl flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#3B82F6]" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-white font-semibold text-sm">{route.name}</span>
                  <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${route.status === 'Active' ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-slate-400 bg-slate-700'}`}>
                    {route.status}
                  </span>
                </div>
                <p className="text-slate-400 text-xs mt-0.5">{route.from} → {route.to} • Fare: ৳{route.fare}</p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <button
                  className="text-[#3B82F6] text-xs font-semibold flex items-center gap-1 hover:text-white transition-colors"
                  onClick={(e) => {
                    e.stopPropagation();
                    // Edit logic here
                  }}
                >
                  <Edit2 className="w-3.5 h-3.5" /> Edit
                </button>
                {expanded === route.id ? <ChevronDown className="w-4 h-4 text-slate-500" /> : <ChevronRight className="w-4 h-4 text-slate-500" />}
              </div>
            </div>

            {expanded === route.id && (
              <div className="px-6 pb-5 border-t border-slate-800">
                <p className="text-slate-400 text-xs font-semibold uppercase mt-4 mb-3">Stops</p>
                <div className="flex flex-col gap-0">
                  {route.stops.map((stop, i) => (
                    <div key={i} className="flex items-center gap-3">
                      <div className="flex flex-col items-center">
                        <div className="w-3 h-3 rounded-full bg-[#1A3C8F] border-2 border-[#3B82F6]" />
                        {i < route.stops.length - 1 && <div className="w-0.5 h-6 bg-slate-700" />}
                      </div>
                      <span className="text-slate-300 text-sm py-1">{stop}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
