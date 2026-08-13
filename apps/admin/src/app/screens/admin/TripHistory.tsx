import { useState } from 'react';
import { Search, Bus, Users, Clock, Banknote } from 'lucide-react';

const trips = [
  { id: 'TRP-0842', bus: '104-B', route: 'Campus → Gazipur Chowrasta', helper: 'Karim Hossain', date: '6 Jul 2026', startTime: '6:15 AM', endTime: '7:08 AM', duration: '53 min', passengers: 42, revenue: 630, status: 'Completed' },
  { id: 'TRP-0841', bus: '101-A', route: 'Mirpur → Campus', helper: 'Rahim Uddin', date: '6 Jul 2026', startTime: '6:30 AM', endTime: '7:55 AM', duration: '85 min', passengers: 38, revenue: 570, status: 'Completed' },
  { id: 'TRP-0840', bus: '102-B', route: 'Uttara → Campus', helper: 'Salam Khan', date: '6 Jul 2026', startTime: '6:45 AM', endTime: '8:20 AM', duration: '95 min', passengers: 45, revenue: 900, status: 'Completed' },
  { id: 'TRP-0839', bus: '103-C', route: 'Dhanmondi → Campus', helper: 'Jamal Hossain', date: '6 Jul 2026', startTime: '7:00 AM', endTime: '8:40 AM', duration: '100 min', passengers: 29, revenue: 725, status: 'Completed' },
  { id: 'TRP-0838', bus: '104-B', route: 'Gazipur → Campus', helper: 'Karim Hossain', date: '5 Jul 2026', startTime: '6:10 AM', endTime: '7:05 AM', duration: '55 min', passengers: 44, revenue: 660, status: 'Completed' },
  { id: 'TRP-0837', bus: '101-A', route: 'Mirpur → Campus', helper: 'Rahim Uddin', date: '5 Jul 2026', startTime: '6:28 AM', endTime: '7:52 AM', duration: '84 min', passengers: 40, revenue: 600, status: 'Completed' },
  { id: 'TRP-0836', bus: '106-E', route: 'Tongi → Campus', helper: 'Hafiz Rahman', date: '5 Jul 2026', startTime: '7:00 AM', endTime: '—', duration: '—', passengers: 0, revenue: 0, status: 'Cancelled' },
];

export function TripHistory() {
  const [query, setQuery] = useState('');

  const filtered = trips.filter(t =>
    t.id.toLowerCase().includes(query.toLowerCase()) ||
    t.bus.toLowerCase().includes(query.toLowerCase()) ||
    t.route.toLowerCase().includes(query.toLowerCase()) ||
    t.helper.toLowerCase().includes(query.toLowerCase())
  );

  const totalPassengers = trips.filter(t => t.status === 'Completed').reduce((s, t) => s + t.passengers, 0);
  const totalRevenue = trips.filter(t => t.status === 'Completed').reduce((s, t) => s + t.revenue, 0);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { label: 'Total Trips', value: String(trips.length), icon: Bus, color: 'text-[#3B82F6]' },
          { label: 'Completed', value: String(trips.filter(t => t.status === 'Completed').length), icon: Bus, color: 'text-[#22C55E]' },
          { label: 'Total Passengers', value: totalPassengers.toLocaleString(), icon: Users, color: 'text-[#F59E0B]' },
          { label: 'Total Revenue', value: `৳${totalRevenue.toLocaleString()}`, icon: Banknote, color: 'text-[#8B5CF6]' },
        ].map(k => (
          <div key={k.label} className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
          </div>
        ))}
      </div>

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={query} onChange={e => setQuery(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#3B82F6] placeholder-slate-500"
              placeholder="Search trips..." />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-slate-800">
                {['Trip ID', 'Bus / Route', 'Helper', 'Date', 'Duration', 'Passengers', 'Revenue', 'Status'].map(h => (
                  <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filtered.map(trip => (
                <tr key={trip.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4 text-slate-300 text-sm font-mono">{trip.id}</td>
                  <td className="px-6 py-4">
                    <p className="text-white text-sm font-semibold">Bus {trip.bus}</p>
                    <p className="text-slate-400 text-xs">{trip.route}</p>
                  </td>
                  <td className="px-6 py-4 text-slate-300 text-sm">{trip.helper}</td>
                  <td className="px-6 py-4">
                    <p className="text-slate-300 text-sm">{trip.date}</p>
                    <p className="text-slate-500 text-xs">{trip.startTime}{trip.endTime !== '—' ? ` – ${trip.endTime}` : ''}</p>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                      <Clock className="w-3.5 h-3.5 text-slate-500" /> {trip.duration}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-1.5 text-slate-300 text-sm">
                      <Users className="w-3.5 h-3.5 text-slate-500" /> {trip.passengers}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-[#22C55E] font-semibold text-sm">
                    {trip.revenue > 0 ? `৳${trip.revenue}` : '—'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${trip.status === 'Completed' ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-[#EF4444] bg-[#EF4444]/10'}`}>
                      {trip.status}
                    </span>
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
