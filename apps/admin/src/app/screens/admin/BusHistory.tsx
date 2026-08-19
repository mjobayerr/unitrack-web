import { useCallback, useEffect, useState } from 'react';
import { Bus, MapPin, Clock, Loader2, Route as RouteIcon, Gauge } from 'lucide-react';
import { apiCall, ApiError, type components } from '../../../lib/api';

type BusT = components['schemas']['BusOut'];
type History = components['schemas']['BusHistoryPathOut'];

function fmt(iso: string): string {
  return new Date(iso).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', second: '2-digit' });
}

export function BusHistory() {
  const [buses, setBuses] = useState<BusT[]>([]);
  const [busId, setBusId] = useState('');
  const [history, setHistory] = useState<History | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    void apiCall((api) => api.GET('/admin/buses', {})).then(setBuses).catch(() => setBuses([]));
  }, []);

  const load = useCallback(async () => {
    if (!busId || loading) return;
    setLoading(true);
    setError(null);
    setHistory(null);
    try {
      const h = await apiCall((api) => api.GET('/track/bus/{bus_id}/history', { params: { path: { bus_id: busId } } }));
      setHistory(h);
    } catch (e) {
      setError(e instanceof ApiError && e.detailMessage ? e.detailMessage : 'Could not load GPS history.');
    } finally {
      setLoading(false);
    }
  }, [busId, loading]);

  const busLabel = (b: BusT) => `${b.reg_no}${b.nickname ? ` · ${b.nickname}` : ''}`;

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-white text-xl font-bold">GPS History</h2>
        <p className="text-slate-400 text-sm mt-0.5">The recorded path of a bus, straight from the tracking store.</p>
      </div>

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
        <div className="flex flex-col md:flex-row gap-4 md:items-end">
          <div className="flex-1">
            <label className="text-slate-400 text-xs font-semibold uppercase mb-1.5 block">Bus</label>
            <select value={busId} onChange={(e) => setBusId(e.target.value)} className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6]">
              <option value="">Select a bus…</option>
              {buses.map((b) => (
                <option key={b.id} value={b.id}>{busLabel(b)}</option>
              ))}
            </select>
          </div>
          <button onClick={load} disabled={!busId || loading} className="bg-[#1A3C8F] hover:bg-[#2952b3] text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50">{loading ? 'Loading…' : 'Load history'}</button>
        </div>
        {error && <p className="text-[#EF4444] text-sm mt-3">{error}</p>}
      </div>

      {loading ? (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl px-6 py-16 flex items-center justify-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading GPS points…</div>
      ) : history === null ? (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl px-6 py-16 text-center text-slate-400"><RouteIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />Pick a bus and load its recorded path.</div>
      ) : history.point_count === 0 ? (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl px-6 py-16 text-center text-slate-400"><MapPin className="w-8 h-8 mx-auto mb-2 text-slate-600" />No GPS recorded for this bus in the window.</div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5"><p className="text-slate-400 text-sm">Points</p><p className="text-white text-2xl font-bold mt-1">{history.point_count}</p></div>
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5"><p className="text-slate-400 text-sm">First fix</p><p className="text-white text-sm font-medium mt-1">{fmt(history.from_timestamp)}</p></div>
            <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-5"><p className="text-slate-400 text-sm">Last fix</p><p className="text-white text-sm font-medium mt-1">{fmt(history.to_timestamp)}</p></div>
          </div>

          <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
            <div className="px-6 py-4 border-b border-slate-800"><h3 className="text-white font-semibold">Track ({history.path.length} points)</h3></div>
            <div className="max-h-[26rem] overflow-y-auto">
              <table className="w-full">
                <thead className="sticky top-0 bg-[#1E293B]">
                  <tr className="border-b border-slate-800">
                    {['#', 'Time', 'Latitude', 'Longitude', 'Speed'].map((h) => (
                      <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800">
                  {history.path.map((p, i) => (
                    <tr key={i} className="hover:bg-slate-800/40">
                      <td className="px-6 py-2.5 text-slate-500 text-xs">{i + 1}</td>
                      <td className="px-6 py-2.5 text-slate-300 text-sm flex items-center gap-1.5"><Clock className="w-3.5 h-3.5 text-slate-600" />{fmt(p.timestamp)}</td>
                      <td className="px-6 py-2.5 text-slate-300 text-sm font-mono">{p.latitude.toFixed(5)}</td>
                      <td className="px-6 py-2.5 text-slate-300 text-sm font-mono">{p.longitude.toFixed(5)}</td>
                      <td className="px-6 py-2.5 text-slate-300 text-sm">{p.speed != null ? <span className="flex items-center gap-1"><Gauge className="w-3.5 h-3.5 text-slate-600" />{Math.round(p.speed * 3.6)} km/h</span> : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
