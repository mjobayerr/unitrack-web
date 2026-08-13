import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';

const occupancyTrend = [
  { day: 'Mon', morning: 82, afternoon: 65, evening: 78 },
  { day: 'Tue', morning: 78, afternoon: 58, evening: 72 },
  { day: 'Wed', morning: 91, afternoon: 70, evening: 85 },
  { day: 'Thu', morning: 76, afternoon: 62, evening: 69 },
  { day: 'Fri', morning: 95, afternoon: 80, evening: 90 },
  { day: 'Sat', morning: 45, afternoon: 38, evening: 40 },
  { day: 'Sun', morning: 30, afternoon: 25, evening: 28 },
];

const peakHours = [
  { hour: '6 AM', passengers: 120 }, { hour: '7 AM', passengers: 380 },
  { hour: '8 AM', passengers: 520 }, { hour: '9 AM', passengers: 290 },
  { hour: '10 AM', passengers: 145 }, { hour: '11 AM', passengers: 98 },
  { hour: '12 PM', passengers: 210 }, { hour: '1 PM', passengers: 310 },
  { hour: '2 PM', passengers: 480 }, { hour: '3 PM', passengers: 390 },
  { hour: '4 PM', passengers: 260 }, { hour: '5 PM', passengers: 180 },
];

const routePassengers = [
  { name: 'Gazipur', value: 1840 },
  { name: 'Mirpur', value: 1560 },
  { name: 'Uttara', value: 1290 },
  { name: 'Dhanmondi', value: 980 },
  { name: 'Tongi', value: 820 },
  { name: 'Azimpur', value: 640 },
];

const tooltipStyle = { backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px' };
const itemStyle = { color: '#E2E8F0' };

export function RidershipDashboard() {
  const kpis = [
    { label: "Today's Passengers", value: '3,240', sub: '+6% vs yesterday', color: 'text-[#3B82F6]' },
    { label: 'Peak Hour', value: '8:00 AM', sub: '520 passengers', color: 'text-[#F59E0B]' },
    { label: 'Avg Occupancy', value: '78%', sub: 'Fleet average', color: 'text-[#22C55E]' },
    { label: 'Busiest Route', value: 'Gazipur', sub: '1,840 passengers', color: 'text-[#8B5CF6]' },
  ];

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {kpis.map(k => (
          <div key={k.label} className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5">
            <p className="text-slate-400 text-sm">{k.label}</p>
            <p className={`text-2xl font-bold mt-1 ${k.color}`}>{k.value}</p>
            <p className="text-slate-500 text-xs mt-1">{k.sub}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Trends */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">Occupancy Trends (%)</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={occupancyTrend} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis key="x-axis" dataKey="day" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis key="y-axis" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `${v}%`} />
                <Tooltip key="tooltip" contentStyle={tooltipStyle} itemStyle={itemStyle} formatter={(v: number) => [`${v}%`]} />
                <Line key="line-morning" type="monotone" dataKey="morning" stroke="#3B82F6" strokeWidth={2} dot={false} name="Morning" />
                <Line key="line-afternoon" type="monotone" dataKey="afternoon" stroke="#F59E0B" strokeWidth={2} dot={false} name="Afternoon" />
                <Line key="line-evening" type="monotone" dataKey="evening" stroke="#8B5CF6" strokeWidth={2} dot={false} name="Evening" />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <div className="flex gap-4 mt-3">
            {[{ label: 'Morning', color: '#3B82F6' }, { label: 'Afternoon', color: '#F59E0B' }, { label: 'Evening', color: '#8B5CF6' }].map(l => (
              <div key={l.label} className="flex items-center gap-1.5">
                <div className="w-3 h-0.5" style={{ backgroundColor: l.color }} />
                <span className="text-slate-400 text-xs">{l.label}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Peak Hours */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">Peak Hours</h3>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={peakHours} barSize={20} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis key="x-axis" dataKey="hour" stroke="#94A3B8" fontSize={10} tickLine={false} axisLine={false} />
                <YAxis key="y-axis" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip key="tooltip" contentStyle={tooltipStyle} itemStyle={itemStyle} formatter={(v: number) => [v, 'Passengers']} />
                <Bar key="bar" dataKey="passengers" fill="#1A3C8F" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Passengers per Route */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-5">Passengers per Route (Today)</h3>
        <div className="space-y-3">
          {routePassengers.map((r) => {
            const pct = Math.round((r.value / routePassengers[0].value) * 100);
            return (
              <div key={r.name} className="flex items-center gap-4">
                <span className="text-slate-300 text-sm w-24 font-medium">{r.name}</span>
                <div className="flex-1 h-2.5 bg-slate-700 rounded-full overflow-hidden">
                  <div className="h-full bg-[#1A3C8F] rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-white text-sm font-semibold w-16 text-right">{r.value.toLocaleString()}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
