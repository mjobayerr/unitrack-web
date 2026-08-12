import { useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, MapPin, Zap, Wrench, HeartPulse } from 'lucide-react';

const initialAlerts = [
  { id: 'ALT-001', type: 'breakdown', bus: '106-E', route: 'Tongi ↔ Campus', helper: 'Hafiz Rahman', location: 'Tongi Bridge, Gazipur', message: 'Engine failure. Bus not operational.', time: '6 Jul, 8:12 AM', status: 'open' },
  { id: 'ALT-002', type: 'traffic', bus: '104-B', route: 'Campus → Gazipur', helper: 'Karim Hossain', location: 'Joydebpur Chowrasta', message: 'Heavy traffic. Estimated 20 min delay.', time: '6 Jul, 7:48 AM', status: 'open' },
  { id: 'ALT-003', type: 'medical', bus: '103-C', route: 'Dhanmondi ↔ Campus', helper: 'Jamal Hossain', location: 'Farmgate, Dhaka', message: 'Passenger unwell. Requires assistance.', time: '5 Jul, 9:05 AM', status: 'resolved' },
  { id: 'ALT-004', type: 'breakdown', bus: '102-B', route: 'Uttara ↔ Campus', helper: 'Salam Khan', location: 'Abdullahpur, Uttara', message: 'Flat tire. Spare change underway.', time: '4 Jul, 8:30 AM', status: 'resolved' },
  { id: 'ALT-005', type: 'traffic', bus: '101-A', route: 'Mirpur ↔ Campus', helper: 'Rahim Uddin', location: 'Mirpur-1, Dhaka', message: 'Road blocked. Taking alternate route.', time: '3 Jul, 7:55 AM', status: 'resolved' },
];

const typeConfig = {
  breakdown: { icon: Wrench, label: 'Breakdown', color: 'text-[#EF4444]', bg: 'bg-[#EF4444]/10', border: 'border-[#EF4444]/30' },
  traffic: { icon: Clock, label: 'Traffic Delay', color: 'text-[#F59E0B]', bg: 'bg-[#F59E0B]/10', border: 'border-[#F59E0B]/30' },
  medical: { icon: HeartPulse, label: 'Medical', color: 'text-[#8B5CF6]', bg: 'bg-[#8B5CF6]/10', border: 'border-[#8B5CF6]/30' },
};

export function EmergencyAlerts() {
  const [alerts, setAlerts] = useState(initialAlerts);
  const [filter, setFilter] = useState<'all' | 'open' | 'resolved'>('all');

  const resolve = (id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, status: 'resolved' } : a));
  };

  const open = alerts.filter(a => a.status === 'open').length;
  const filtered = alerts.filter(a => filter === 'all' || a.status === filter);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open Alerts', value: open, color: 'text-[#EF4444]', icon: AlertTriangle },
          { label: 'Resolved Today', value: alerts.filter(a => a.status === 'resolved').length, color: 'text-[#22C55E]', icon: CheckCircle },
          { label: 'Total Alerts', value: alerts.length, color: 'text-[#F59E0B]', icon: Zap },
        ].map(k => (
          <div key={k.label} className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0">
              <k.icon className={`w-6 h-6 ${k.color}`} />
            </div>
            <div>
              <p className="text-slate-400 text-sm">{k.label}</p>
              <p className={`text-3xl font-bold ${k.color}`}>{k.value}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(['all', 'open', 'resolved'] as const).map(f => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-xl text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-[#1A3C8F] text-white' : 'bg-[#1E293B] text-slate-400 hover:text-white border border-slate-800'}`}>
            {f}
          </button>
        ))}
      </div>

      <div className="space-y-3">
        {filtered.map(alert => {
          const cfg = typeConfig[alert.type as keyof typeof typeConfig];
          const Icon = cfg.icon;
          return (
            <div key={alert.id} className={`bg-[#1E293B] border rounded-2xl p-5 ${alert.status === 'open' ? cfg.border : 'border-slate-800'}`}>
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${cfg.bg}`}>
                  <Icon className={`w-6 h-6 ${cfg.color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${cfg.bg} ${cfg.color}`}>{cfg.label}</span>
                    <span className="text-white font-semibold text-sm">Bus {alert.bus}</span>
                    <span className="text-slate-500 text-xs">{alert.id}</span>
                  </div>
                  <p className="text-slate-200 text-sm font-medium">{alert.message}</p>
                  <div className="flex items-center gap-4 mt-2 flex-wrap">
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <MapPin className="w-3 h-3" /> {alert.location}
                    </span>
                    <span className="text-slate-400 text-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" /> {alert.time}
                    </span>
                    <span className="text-slate-500 text-xs">Helper: {alert.helper}</span>
                  </div>
                </div>
                <div className="shrink-0 flex flex-col items-end gap-2">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${alert.status === 'open' ? 'bg-[#EF4444]/10 text-[#EF4444]' : 'bg-[#22C55E]/10 text-[#22C55E]'}`}>
                    {alert.status === 'open' ? 'Open' : 'Resolved'}
                  </span>
                  {alert.status === 'open' && (
                    <button onClick={() => resolve(alert.id)} className="text-xs font-semibold text-[#3B82F6] hover:text-white transition-colors bg-[#3B82F6]/10 hover:bg-[#3B82F6]/20 px-3 py-1.5 rounded-lg">
                      Mark Resolved
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
        {filtered.length === 0 && (
          <div className="text-center py-12 text-slate-500">No {filter === 'all' ? '' : filter} alerts found.</div>
        )}
      </div>
    </div>
  );
}
