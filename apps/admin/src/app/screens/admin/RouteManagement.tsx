import { useCallback, useEffect, useState } from 'react';
import { Plus, MapPin, ChevronDown, ChevronRight, Loader2, Route as RouteIcon } from 'lucide-react';
import { apiCall, ApiError, type components } from '../../../lib/api';

type RouteDetail = components['schemas']['RouteDetailOut'];
type RouteDirection = components['schemas']['RouteDirection'];

export function RouteManagement() {
  const [routes, setRoutes] = useState<RouteDetail[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [direction, setDirection] = useState<RouteDirection>('outbound');
  const [active, setActive] = useState(true);
  const [saving, setSaving] = useState(false);

  const load = useCallback(async () => {
    try {
      setRoutes(await apiCall((api) => api.GET('/fleet/route-shapes', { params: { query: { only_active: false } } })));
    } catch {
      setError('Could not load routes.');
      setRoutes([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function save() {
    if (saving) return;
    setError(null);
    if (!name.trim()) {
      setError('Route name is required.');
      return;
    }
    setSaving(true);
    try {
      await apiCall((api) => api.POST('/admin/routes', { body: { name: name.trim(), direction, is_active: active } }));
      setName('');
      setShowForm(false);
      await load();
    } catch (e) {
      setError(e instanceof ApiError && e.detailMessage ? e.detailMessage : 'Could not add the route.');
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">Route Management</h2>
          <p className="text-slate-400 text-sm mt-0.5">{routes ? `${routes.length} routes configured` : 'Loading…'}</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center gap-2 bg-[#1A3C8F] text-white px-4 py-2.5 rounded-xl text-sm font-semibold">
          <Plus className="w-4 h-4" /> Add Route
        </button>
      </div>

      {showForm && (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl p-6">
          <h3 className="text-white font-semibold mb-4">Add New Route</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase mb-1.5 block">Route Name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6]" placeholder="Campus Shuttle" />
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase mb-1.5 block">Direction</label>
              <select value={direction} onChange={(e) => setDirection(e.target.value as RouteDirection)} className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6]">
                <option value="outbound">outbound</option>
                <option value="inbound">inbound</option>
              </select>
            </div>
            <div>
              <label className="text-slate-400 text-xs font-semibold uppercase mb-1.5 block">Active</label>
              <select value={active ? 'yes' : 'no'} onChange={(e) => setActive(e.target.value === 'yes')} className="w-full bg-[#0F172A] border border-slate-700 rounded-xl px-4 py-2.5 text-white text-sm focus:outline-none focus:border-[#3B82F6]">
                <option value="yes">active</option>
                <option value="no">inactive</option>
              </select>
            </div>
          </div>
          <p className="text-slate-500 text-xs mt-3">Stops are attached to a route after it is created.</p>
          {error && <p className="text-[#EF4444] text-sm mt-2">{error}</p>}
          <div className="flex gap-3 mt-5">
            <button onClick={save} disabled={saving} className="bg-[#1A3C8F] text-white px-5 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-60">{saving ? 'Saving…' : 'Save Route'}</button>
            <button onClick={() => setShowForm(false)} className="text-slate-400 hover:text-white px-5 py-2.5 text-sm font-semibold">Cancel</button>
          </div>
        </div>
      )}

      {error && !showForm && <p className="text-[#EF4444] text-sm">{error}</p>}

      {routes === null ? (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl px-6 py-16 flex items-center justify-center text-slate-400"><Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading routes…</div>
      ) : routes.length === 0 ? (
        <div className="bg-[#1E293B] border border-slate-800 rounded-2xl px-6 py-16 text-center text-slate-400"><RouteIcon className="w-8 h-8 mx-auto mb-2 text-slate-600" />No routes yet. Add one above.</div>
      ) : (
        <div className="space-y-3">
          {routes.map((r) => (
            <div key={r.id} className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
              <button onClick={() => setExpanded(expanded === r.id ? null : r.id)} className="w-full px-6 py-4 flex items-center justify-between hover:bg-slate-800/40 transition-colors">
                <div className="flex items-center gap-3 text-left">
                  {expanded === r.id ? <ChevronDown className="w-4 h-4 text-slate-400" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
                  <div>
                    <p className="text-white font-medium">{r.name} <span className="text-slate-400 font-normal capitalize">· {r.direction}</span></p>
                    <p className="text-slate-400 text-xs">{r.stops.length} stops</p>
                  </div>
                </div>
                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${r.is_active ? 'text-[#22C55E] bg-[#22C55E]/10' : 'text-slate-400 bg-slate-700/40'}`}>{r.is_active ? 'Active' : 'Inactive'}</span>
              </button>
              {expanded === r.id && (
                <div className="px-6 pb-5 pt-1 border-t border-slate-800">
                  {r.stops.length === 0 ? (
                    <p className="text-slate-400 text-sm pt-3">No stops attached to this route yet.</p>
                  ) : (
                    <ol className="mt-3 space-y-2">
                      {r.stops.map((rs) => (
                        <li key={rs.seq} className="flex items-center gap-3 text-sm">
                          <span className="w-6 h-6 rounded-full bg-[#3B82F6]/15 text-[#3B82F6] text-xs font-bold flex items-center justify-center shrink-0">{rs.seq}</span>
                          <MapPin className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                          <span className="text-slate-200">{rs.stop.name}</span>
                        </li>
                      ))}
                    </ol>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
