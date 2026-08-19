import { useCallback, useEffect, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle, Clock, MapPin, Loader2, ShieldCheck } from 'lucide-react';
import { apiCall, type components } from '../../../lib/api';

type Alert = components['schemas']['AlertOut'];
type AlertStatus = components['schemas']['AlertStatus'];
type AlertSeverity = components['schemas']['AlertSeverity'];

const SEVERITY: Record<AlertSeverity, string> = {
  critical: 'text-[#EF4444] bg-[#EF4444]/10 border-[#EF4444]/30',
  warning: 'text-[#F59E0B] bg-[#F59E0B]/10 border-[#F59E0B]/30',
  info: 'text-[#3B82F6] bg-[#3B82F6]/10 border-[#3B82F6]/30',
};

const STATUS_STYLE: Record<AlertStatus, string> = {
  open: 'text-[#EF4444] bg-[#EF4444]/10',
  acknowledged: 'text-[#F59E0B] bg-[#F59E0B]/10',
  resolved: 'text-[#22C55E] bg-[#22C55E]/10',
  dismissed: 'text-slate-400 bg-slate-700/40',
};

function when(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
}

type Filter = 'all' | 'open' | 'acknowledged' | 'resolved';

export function EmergencyAlerts() {
  const [alerts, setAlerts] = useState<Alert[] | null>(null);
  const [filter, setFilter] = useState<Filter>('all');
  const [busyId, setBusyId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setAlerts(await apiCall((api) => api.GET('/admin/alerts', {})));
    } catch {
      setError('Could not load alerts.');
      setAlerts([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(id: string, run: () => Promise<unknown>) {
    if (busyId) return;
    setBusyId(id);
    setError(null);
    try {
      await run();
      await load();
    } catch {
      setError('Action failed. Try again.');
    } finally {
      setBusyId(null);
    }
  }
  const acknowledge = (a: Alert) => act(a.id, () => apiCall((api) => api.POST('/admin/alerts/{alert_id}/acknowledge', { params: { path: { alert_id: a.id } } })));
  const resolve = (a: Alert) => act(a.id, () => apiCall((api) => api.POST('/admin/alerts/{alert_id}/resolve', { params: { path: { alert_id: a.id } } })));

  const list = alerts ?? [];
  const open = list.filter((a) => a.status === 'open').length;
  const resolved = list.filter((a) => a.status === 'resolved').length;
  const filtered = useMemo(() => list.filter((a) => filter === 'all' || a.status === filter), [list, filter]);

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Open', value: open, color: 'text-[#EF4444]', icon: AlertTriangle },
          { label: 'Resolved', value: resolved, color: 'text-[#22C55E]', icon: CheckCircle },
          { label: 'Total', value: list.length, color: 'text-[#F59E0B]', icon: Clock },
        ].map((k) => (
          <div key={k.label} className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-slate-800 flex items-center justify-center shrink-0"><k.icon className={`w-6 h-6 ${k.color}`} /></div>
            <div>
              <p className="text-white text-2xl font-bold">{alerts ? k.value : '—'}</p>
              <p className="text-slate-400 text-sm">{k.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex gap-2">
        {(['all', 'open', 'acknowledged', 'resolved'] as Filter[]).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={`px-4 py-2 rounded-lg text-sm font-semibold capitalize transition-colors ${filter === f ? 'bg-[#1A3C8F] text-white' : 'bg-[#1E293B] text-slate-400 hover:text-white'}`}>{f}</button>
        ))}
      </div>

      {error && <p className="text-[#EF4444] text-sm">{error}</p>}

      {alerts === null ? (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl px-6 py-16 flex items-center justify-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading alerts…</div>
      ) : filtered.length === 0 ? (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl px-6 py-16 text-center text-slate-400"><ShieldCheck className="w-8 h-8 mx-auto mb-2 text-slate-600" />No {filter === 'all' ? '' : filter} alerts.</div>
      ) : (
        <div className="space-y-3">
          {filtered.map((a) => (
            <div key={a.id} className={`bg-[#1E293B] border rounded-2xl p-5 ${a.status === 'open' ? SEVERITY[a.severity].split(' ').pop() : 'border-slate-800'}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full border capitalize ${SEVERITY[a.severity]}`}>{a.type.replace(/_/g, ' ')}</span>
                    <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[a.status]}`}>{a.status}</span>
                    <span className="text-slate-500 text-xs capitalize">from {a.source}</span>
                  </div>
                  {a.message && <p className="text-slate-200 text-sm mt-2">{a.message}</p>}
                  <div className="flex items-center gap-4 mt-2 text-slate-400 text-xs">
                    <span>{when(a.created_at)}</span>
                    {a.lat != null && a.lng != null && (
                      <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" />{a.lat.toFixed(4)}, {a.lng.toFixed(4)}</span>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  {busyId === a.id ? (
                    <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                  ) : (
                    <>
                      {a.status === 'open' && (
                        <button onClick={() => acknowledge(a)} className="text-[#F59E0B] hover:text-white text-xs font-semibold">Acknowledge</button>
                      )}
                      {(a.status === 'open' || a.status === 'acknowledged') && (
                        <button onClick={() => resolve(a)} className="text-[#22C55E] hover:text-white text-xs font-semibold">Resolve</button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
