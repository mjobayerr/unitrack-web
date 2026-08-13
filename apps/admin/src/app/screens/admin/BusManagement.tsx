import { useState } from 'react';
import { Plus, Search, Edit2, Bus } from 'lucide-react';

const buses = [
  { id: '101-A', model: 'Tata Starbus', capacity: 50, route: 'Mirpur ↔ Campus', status: 'Active', year: 2020, helper: 'Rahim Uddin' },
  { id: '102-B', model: 'Ashok Leyland', capacity: 50, route: 'Uttara ↔ Campus', status: 'Active', year: 2019, helper: 'Salam Khan' },
  { id: '103-C', model: 'Tata Starbus', capacity: 40, route: 'Dhanmondi ↔ Campus', status: 'Active', year: 2021, helper: 'Jamal Hossain' },
  { id: '104-B', model: 'Eicher Bus', capacity: 50, route: 'Campus ↔ Gazipur', status: 'Active', year: 2022, helper: 'Karim Ali' },
  { id: '105-D', model: 'Tata Starbus', capacity: 40, route: 'Azimpur ↔ Campus', status: 'Idle', year: 2020, helper: 'Faruk Mia' },
  { id: '106-E', model: 'Ashok Leyland', capacity: 50, route: 'Tongi ↔ Campus', status: 'Breakdown', year: 2018, helper: 'Hafiz Rahman' },
];

const statusColor: Record<string, string> = {
  Active: 'text-[#22C55E] bg-[#22C55E]/10',
  Idle: 'text-slate-400 bg-slate-700',
  Breakdown: 'text-[#EF4444] bg-[#EF4444]/10',
};

export function BusManagement() {
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);

  const filtered = buses.filter(b =>
    b.id.toLowerCase().includes(query.toLowerCase()) ||
    b.route.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">Bus Management</h2>
          <p className="text-slate-400 text-sm mt-0.5">{buses.length} buses in fleet</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center gap-2 bg-[#1A3C8F] hover:bg-[#2952b3] text-white px-4 py-2.5 rounded-xl text-sm font-semibold transition-colors"
        >
          <Plus className="w-4 h-4" /> Add Bus
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Add New Bus</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {['Bus ID', 'Model', 'Capacity', 'Assign Route', 'Helper Name', 'Year'].map(f => (
              <div key={f}>
                <label className="text-slate-400 text-xs font-semibold uppercase mb-1.5 block">{f}</label>
                <input className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6]" placeholder={f} />
              </div>
            ))}
          </div>
          <div className="flex gap-3 mt-5">
            <button className="bg-[#1A3C8F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold">Save Bus</button>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white px-5 py-2.5 text-sm font-semibold">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={query} onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#3B82F6] placeholder-slate-500"
              placeholder="Search by bus ID or route..."
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Bus ID', 'Model', 'Capacity', 'Route', 'Helper', 'Status', 'Actions'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(bus => (
                <tr key={bus.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-[#1A3C8F]/20 rounded-lg flex items-center justify-center">
                        <Bus className="w-4 h-4 text-[#3B82F6]" />
                      </div>
                      <span className="text-white font-semibold text-sm">{bus.id}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{bus.model}</td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{bus.capacity} seats</td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{bus.route}</td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{bus.helper}</td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${statusColor[bus.status]}`}>{bus.status}</span>
                  </td>
                  <td className="px-6 py-4">
                    <button className="flex items-center gap-1.5 text-[#3B82F6] hover:text-white text-xs font-semibold transition-colors">
                      <Edit2 className="w-3.5 h-3.5" /> Edit
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
