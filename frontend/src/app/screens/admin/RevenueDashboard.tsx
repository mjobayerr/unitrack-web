import { useState } from 'react';
import { AreaChart, Area, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

const dailyData = [
  { name: 'Mon', total: 12400 },
  { name: 'Tue', total: 9800 },
  { name: 'Wed', total: 15600 },
  { name: 'Thu', total: 11200 },
  { name: 'Fri', total: 18900 },
  { name: 'Sat', total: 7400 },
  { name: 'Sun', total: 5200 },
];

const routeRevenue = [
  { name: 'Mirpur', value: 32400 },
  { name: 'Uttara', value: 28100 },
  { name: 'Gazipur', value: 41200 },
  { name: 'Dhanmondi', value: 19500 },
  { name: 'Azimpur', value: 14800 },
  { name: 'Tongi', value: 22300 },
];

const paymentSplit = [
  { name: 'QR Payment', value: 87, color: '#3B82F6' },
  { name: 'Manual', value: 13, color: '#F59E0B' },
];

const tooltipStyle = { backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px' };
const itemStyle = { color: '#E2E8F0' };

export function RevenueDashboard() {
  const [period, setPeriod] = useState<'week' | 'month'>('week');

  const kpis = [
    { label: "Today's Revenue", value: '৳45,200', sub: '+12% vs yesterday', color: 'text-[#22C55E]' },
    { label: 'This Week', value: '৳2,80,500', sub: '+8% vs last week', color: 'text-[#3B82F6]' },
    { label: 'QR Payments', value: '৳2,43,835', sub: '87% of total', color: 'text-[#8B5CF6]' },
    { label: 'Avg per Trip', value: '৳16.40', sub: 'Per passenger', color: 'text-[#F59E0B]' },
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Daily Revenue */}
        <div className="lg:col-span-2 bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-5">
            <h3 className="text-white font-semibold">Revenue by Date</h3>
            <div className="flex gap-1">
              {(['week', 'month'] as const).map(p => (
                <button key={p} onClick={() => setPeriod(p)} className={`px-3 py-1 rounded-lg text-xs font-semibold capitalize ${period === p ? 'bg-[#1A3C8F] text-white' : 'text-slate-400'}`}>{p === 'week' ? 'This Week' : 'This Month'}</button>
              ))}
            </div>
          </div>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={dailyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs key="defs">
                  <linearGradient id="revGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis key="x-axis" dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis key="y-axis" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
                <Tooltip key="tooltip" contentStyle={tooltipStyle} itemStyle={itemStyle} formatter={(v: number) => [`৳${v.toLocaleString()}`, 'Revenue']} />
                <Area key="area" type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} fill="url(#revGrad)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Payment Split */}
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-5">Payment Methods</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
                <Pie key="pie" data={paymentSplit} cx="50%" cy="50%" innerRadius={50} outerRadius={75} dataKey="value">
                  {paymentSplit.map((e, i) => <Cell key={`cell-${i}`} fill={e.color} />)}
                </Pie>
                <Legend key="legend" formatter={(v) => <span style={{ color: '#94A3B8', fontSize: 12 }}>{v}</span>} />
                <Tooltip key="tooltip" contentStyle={tooltipStyle} formatter={(v: number) => [`${v}%`]} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="space-y-2 mt-2">
            {paymentSplit.map(p => (
              <div key={p.name} className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: p.color }} />
                  <span className="text-slate-400 text-sm">{p.name}</span>
                </div>
                <span className="text-white font-semibold text-sm">{p.value}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Revenue by Route */}
      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
        <h3 className="text-white font-semibold mb-5">Revenue by Route</h3>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={routeRevenue} barSize={32} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#334155" vertical={false} />
              <XAxis key="x-axis" dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis key="y-axis" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={v => `৳${(v / 1000).toFixed(0)}k`} />
              <Tooltip key="tooltip" contentStyle={tooltipStyle} itemStyle={itemStyle} formatter={(v: number) => [`৳${v.toLocaleString()}`, 'Revenue']} />
              <Bar key="bar" dataKey="value" fill="#1A3C8F" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
