import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Search, Bus, Loader2 } from 'lucide-react';
import { apiCall, ApiError, type components } from '../../../lib/api';

type BusT = components['schemas']['BusOut'];
type BusStatus = components['schemas']['BusStatus'];

const STATUS_STYLE: Record<BusStatus, string> = {
  active: 'text-[#22C55E] bg-[#22C55E]/10',
  inactive: 'text-slate-400 bg-slate-700/40',
  maintenance: 'text-[#F59E0B] bg-[#F59E0B]/10',
};

export function BusManagement() {
  const [buses, setBuses] = useState<BusT[] | null>(null);
  const [query, setQuery] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [reg, setReg] = useState('');
  const [nickname, setNickname] = useState('');
  const [capacity, setCapacity] = useState('40');
  const [status, setStatus] = useState<BusStatus>('active');
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setBuses(await apiCall((api) => api.GET('/admin/buses', {})));
    } catch {
      setError('Could not load buses.');
      setBuses([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (saving) return;
    setError(null);
    if (!reg.trim() || !Number(capacity)) {
      setError('Registration and a capacity are required.');
      return;
    }
    setSaving(true);
    try {
      await apiCall((api) =>
        api.POST('/admin/buses', {
          body: { reg_no: reg.trim(), nickname: nickname.trim() || null, capacity: Number(capacity), status },
        }),
      );
      setReg('');
      setNickname('');
      setCapacity('40');
      setStatus('active');
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof ApiError && e.detailMessage ? e.detailMessage : 'Could not add the bus.');
    } finally {
      setSaving(false);
    }
  }

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (buses ?? []).filter((b) => !q || b.reg_no.toLowerCase().includes(q) || (b.nickname ?? '').toLowerCase().includes(q));
  }, [buses, query]);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">Bus Management</h2>
          <p className="text-slate-400 text-sm mt-0.5">{buses ? `${buses.length} buses in fleet` : 'Loading…'}</p>
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase mb-1.5 block">Registration</label>
              <input value={reg} onChange={(e) => setReg(e.target.value)} className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6]" placeholder="UA-METRO-07" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase mb-1.5 block">Nickname</label>
              <input value={nickname} onChange={(e) => setNickname(e.target.value)} className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6]" placeholder="Optional" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase mb-1.5 block">Capacity</label>
              <input value={capacity} onChange={(e) => setCapacity(e.target.value.replace(/\D/g, ''))} inputMode="numeric" className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6]" placeholder="40" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase mb-1.5 block">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as BusStatus)} className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6]">
                <option value="active">active</option>
                <option value="inactive">inactive</option>
                <option value="maintenance">maintenance</option>
              </select>
            </div>
          </div>
          {error && <p className="text-[#EF4444] text-sm mt-3">{error}</p>}
          <div className="flex gap-3 mt-5">
            <button onClick={save} disabled={saving} className="bg-[#1A3C8F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">{saving ? 'Saving…' : 'Save Bus'}</button>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white px-5 py-2.5 text-sm font-semibold">Cancel</button>
          </div>
        </div>
      )}

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input value={query} onChange={(e) => setQuery(e.target.value)} className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#3B82F6] placeholder-slate-500" placeholder="Search by registration or nickname…" />
          </div>
          {error && !showForm && <p className="text-[#EF4444] text-sm mt-3">{error}</p>}
        </div>

        {buses === null ? (
          <div className="px-6 py-16 flex items-center justify-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading buses…</div>
        ) : filtered.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-400"><Bus className="w-8 h-8 mx-auto mb-2 text-slate-600" />{query ? 'No buses match.' : 'No buses yet. Add one above.'}</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Bus', 'Nickname', 'Capacity', 'Status'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {filtered.map((b) => (
                  <tr key={b.id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#3B82F6]/15 rounded-full flex items-center justify-center shrink-0"><Bus className="w-4 h-4 text-[#3B82F6]" /></div>
                        <span className="text-white text-sm font-medium font-mono">{b.reg_no}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{b.nickname ?? '—'}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{b.capacity}</td>
                    <td className="px-6 py-4"><span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[b.status]}`}>{b.status}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
