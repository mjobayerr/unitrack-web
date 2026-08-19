import { useCallback, useEffect, useMemo, useState } from 'react';
import { Search, Check, Ban, RotateCcw, Users, Loader2 } from 'lucide-react';
import { apiCall, ApiError, type components } from '../../../lib/api';

type Helper = components['schemas']['HelperOut'];
type HelperStatus = components['schemas']['HelperStatus'];

const STATUS_STYLE: Record<HelperStatus, string> = {
  pending: 'text-[#F59E0B] bg-[#F59E0B]/10',
  approved: 'text-[#22C55E] bg-[#22C55E]/10',
  suspended: 'text-[#EF4444] bg-[#EF4444]/10',
};

// Pending first (they need action), then approved, then suspended.
const STATUS_ORDER: Record<HelperStatus, number> = { pending: 0, approved: 1, suspended: 2 };

function initials(name: string): string {
  return name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]!.toUpperCase()).join('') || '?';
}

export function UserManagement() {
  const [helpers, setHelpers] = useState<Helper[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [query, setQuery] = useState('');
  const [busyId, setBusyId] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      setError(null);
      setHelpers(await apiCall((api) => api.GET('/admin/helpers', {})));
    } catch {
      setError('Could not load helpers.');
      setHelpers([]);
    }
  }, []);

  useEffect(() => {
    void load();
  }, [load]);

  async function act(h: Helper, run: () => Promise<unknown>) {
    if (busyId) return;
    setBusyId(h.helper_id);
    setError(null);
    try {
      await run();
      await load();
    } catch (e) {
      setError(e instanceof ApiError && e.detailMessage ? e.detailMessage : 'Action failed. Try again.');
    } finally {
      setBusyId(null);
    }
  }

  const approve = (h: Helper) =>
    act(h, () => apiCall((api) => api.POST('/admin/helpers/{helper_id}/approve', { params: { path: { helper_id: h.helper_id } } })));
  const suspend = (h: Helper) =>
    act(h, () => apiCall((api) => api.POST('/admin/users/{user_id}/suspend', { params: { path: { user_id: h.user_id } } })));
  const reinstate = (h: Helper) =>
    act(h, () => apiCall((api) => api.POST('/admin/users/{user_id}/reinstate', { params: { path: { user_id: h.user_id } } })));

  const rows = useMemo(() => {
    const q = query.trim().toLowerCase();
    return (helpers ?? [])
      .filter((h) => !q || h.name.toLowerCase().includes(q) || h.email.toLowerCase().includes(q))
      .sort((a, b) => STATUS_ORDER[a.helper_status] - STATUS_ORDER[b.helper_status] || a.name.localeCompare(b.name));
  }, [helpers, query]);

  const pending = (helpers ?? []).filter((h) => h.helper_status === 'pending').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-white text-xl font-bold">Helper Management</h2>
          <p className="text-slate-400 text-sm mt-0.5">
            {helpers ? `${helpers.length} helpers` : 'Loading…'}
            {pending > 0 && <span className="text-[#F59E0B]"> · {pending} awaiting approval</span>}
          </p>
        </div>
      </div>

      <div className="bg-[#1E293B] border border-slate-800 rounded-2xl overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-800">
          <div className="relative max-w-xs">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full bg-[#0F172A] border border-slate-700 rounded-xl pl-9 pr-4 py-2 text-white text-sm focus:outline-none focus:border-[#3B82F6] placeholder-slate-500"
              placeholder="Search by name or email…"
            />
          </div>
          {error && <p className="mt-3 text-sm text-[#EF4444]">{error}</p>}
        </div>

        {helpers === null ? (
          <div className="px-6 py-16 flex items-center justify-center text-slate-400">
            <Loader2 className="w-5 h-5 animate-spin mr-2" /> Loading helpers…
          </div>
        ) : rows.length === 0 ? (
          <div className="px-6 py-16 text-center text-slate-400">
            <Users className="w-8 h-8 mx-auto mb-2 text-slate-600" />
            {query ? 'No helpers match your search.' : 'No helper accounts yet. They appear here after registering in the helper app.'}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-800">
                  {['Helper', 'Email', 'Phone', 'Status', 'Actions'].map((h) => (
                    <th key={h} className="px-6 py-3 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800">
                {rows.map((h) => (
                  <tr key={h.helper_id} className="hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-[#F59E0B]/20 rounded-full flex items-center justify-center text-[#F59E0B] text-xs font-bold shrink-0">
                          {initials(h.name)}
                        </div>
                        <span className="text-white text-sm font-medium">{h.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{h.email}</td>
                    <td className="px-6 py-4 text-slate-300 text-sm">{h.phone ?? '—'}</td>
                    <td className="px-6 py-4">
                      <span className={`text-xs font-semibold px-2.5 py-1 rounded-full capitalize ${STATUS_STYLE[h.helper_status]}`}>
                        {h.helper_status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {busyId === h.helper_id ? (
                          <Loader2 className="w-4 h-4 animate-spin text-slate-400" />
                        ) : h.helper_status === 'pending' ? (
                          <button onClick={() => approve(h)} className="text-[#22C55E] hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors">
                            <Check className="w-3.5 h-3.5" /> Approve
                          </button>
                        ) : h.helper_status === 'approved' ? (
                          <button onClick={() => suspend(h)} className="text-[#EF4444] hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors">
                            <Ban className="w-3.5 h-3.5" /> Suspend
                          </button>
                        ) : (
                          <button onClick={() => reinstate(h)} className="text-[#3B82F6] hover:text-white text-xs font-semibold flex items-center gap-1 transition-colors">
                            <RotateCcw className="w-3.5 h-3.5" /> Reinstate
                          </button>
                        )}
                      </div>
                    </td>
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
