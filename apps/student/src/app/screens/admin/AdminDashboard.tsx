import { Users, Bus, DollarSign, Activity, AlertTriangle, TrendingUp } from "lucide-react";
import { useNavigate } from "react-router";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const revenueData = [
  { name: 'Mon', total: 4000 },
  { name: 'Tue', total: 3000 },
  { name: 'Wed', total: 5000 },
  { name: 'Thu', total: 2780 },
  { name: 'Fri', total: 6890 },
  { name: 'Sat', total: 2390 },
  { name: 'Sun', total: 3490 },
];

export function AdminDashboard() {
  const navigate = useNavigate();
  const stats = [
    { name: "Active Buses", value: "18", icon: Bus, color: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10" },
    { name: "Today's Revenue", value: "৳45,200", icon: DollarSign, color: "text-[#F59E0B]", bg: "bg-[#F59E0B]/10" },
    { name: "Active Trips", value: "6", icon: Activity, color: "text-[#22C55E]", bg: "bg-[#22C55E]/10" },
    { name: "Total Students", value: "12,450", icon: Users, color: "text-[#8B5CF6]", bg: "bg-[#8B5CF6]/10" },
  ];

  return (
    <div className="space-y-6">
      {/* Stats Grid */}
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
        {/* Main Chart */}
        <div className="lg:col-span-2 bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-white font-semibold">Revenue Overview</h3>
            <select className="bg-[#0F172A] border border-slate-700 text-slate-300 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:border-[#3B82F6]">
              <option>This Week</option>
              <option>This Month</option>
            </select>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={revenueData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs key="gradient-defs">
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3B82F6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid key="grid" strokeDasharray="3 3" stroke="#334155" vertical={false} />
                <XAxis key="x-axis" dataKey="name" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis key="y-axis" stroke="#94A3B8" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `৳${value}`} />
                <Tooltip 
                  key="tooltip"
                  contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px' }}
                  itemStyle={{ color: '#E2E8F0' }}
                />
                <Area key="area" type="monotone" dataKey="total" stroke="#3B82F6" strokeWidth={2} fillOpacity={1} fill="url(#colorTotal)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Alerts & Quick Actions */}
        <div className="space-y-6">
          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-[#F59E0B]" />
              Active Alerts
            </h3>
            <div className="space-y-4">
              {[
                { title: "Bus 104 delayed by 15m", route: "Gazipur Route" },
                { title: "Capacity reaching 90%", route: "Mirpur Route" }
              ].map((alert, i) => (
                <div key={i} className="flex gap-3 items-start">
                  <div className="w-2 h-2 rounded-full bg-[#F59E0B] mt-2 shrink-0" />
                  <div>
                    <p className="text-slate-200 text-sm font-medium">{alert.title}</p>
                    <p className="text-slate-400 text-xs">{alert.route}</p>
                  </div>
                </div>
              ))}
            </div>
            <button onClick={() => navigate('/admin/emergency')} className="w-full mt-4 text-sm text-[#3B82F6] font-medium hover:text-white transition-colors">View All Alerts</button>
          </div>

          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
            <h3 className="text-white font-semibold mb-4">Route Performance</h3>
            <div className="space-y-4">
              {[
                { name: "Campus ↔ Gazipur", trend: "+12%", val: "85%" },
                { name: "Campus ↔ Mirpur", trend: "+5%", val: "72%" },
                { name: "Campus ↔ Uttara", trend: "-2%", val: "64%" }
              ].map((route, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-slate-300 text-sm">{route.name}</span>
                  <div className="flex items-center gap-3">
                    <span className="text-white font-medium text-sm">{route.val}</span>
                    <span className={`text-xs font-medium flex items-center ${route.trend.startsWith('+') ? 'text-[#22C55E]' : 'text-[#EF4444]'}`}>
                      <TrendingUp className="w-3 h-3 mr-0.5" /> {route.trend}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}