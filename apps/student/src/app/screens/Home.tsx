import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { MapPin, Clock, Users, ArrowRight, Ticket, Bus, CreditCard } from 'lucide-react';
import { useAuth } from '../../lib/auth';
import { apiCall, type components } from '../../lib/api';
import { useLiveTrack, type TrackBus } from '../../lib/useLiveTrack';

type Route = components['schemas']['RouteOut'];
type TicketT = components['schemas']['TicketOut'];
type Order = components['schemas']['OrderOut'];
type Product = components['schemas']['ProductOut'];

const taka = (paisa: number) => `৳${Math.round(paisa / 100).toLocaleString('en-US')}`;

function greetingFor(hour: number): string {
  if (hour < 12) return 'Good morning';
  if (hour < 17) return 'Good afternoon';
  return 'Good evening';
}

function initial(name: string): string {
  return name.trim().charAt(0).toUpperCase() || 'U';
}

/** Freshest first: live before stale, and within each the most recent fix. */
function liveFirst(a: TrackBus, b: TrackBus): number {
  const rank = { live: 0, stale: 1, lost: 2 } as const;
  if (rank[a.freshness] !== rank[b.freshness]) return rank[a.freshness] - rank[b.freshness];
  return (a.fix_age_s ?? 1e9) - (b.fix_age_s ?? 1e9);
}

function busLabel(b: TrackBus): string {
  return b.nickname?.trim() || b.reg_no;
}

function seatColor(available: number, capacity: number): string {
  const pct = capacity > 0 ? (available / capacity) * 100 : 0;
  return pct > 50 ? '#1DB954' : pct > 20 ? '#F59E0B' : '#EF4444';
}

export function Home() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [tickets, setTickets] = useState<TicketT[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [routeId, setRouteId] = useState<string | null>(null);
  const [routeName, setRouteName] = useState<string>('');

  // The live map subscribes per route; the dashboard mirrors that for the one
  // route it features. A null routeId keeps the socket closed until routes load.
  const { buses } = useLiveTrack(routeId);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [t, o, p, r] = await Promise.all([
        apiCall((api) => api.GET('/shop/tickets', {})).catch(() => [] as TicketT[]),
        apiCall((api) => api.GET('/shop/orders', {})).catch(() => [] as Order[]),
        apiCall((api) => api.GET('/shop/products', {})).catch(() => [] as Product[]),
        apiCall((api) => api.GET('/fleet/routes', {})).catch(() => [] as Route[]),
      ]);
      if (cancelled) return;
      setTickets(t);
      setOrders(o);
      setProducts(p);
      if (r.length > 0) {
        setRouteId(r[0].id);
        setRouteName(r[0].name);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const productName = useMemo(() => {
    const m = new Map(products.map((p) => [p.id, p.name]));
    return (id: string) => m.get(id) ?? 'Ticket';
  }, [products]);

  // The real stored value: rides left on active tickets. A pass with no ride
  // cap (rides_remaining null) is unlimited for its validity window.
  const activeTickets = tickets.filter((t) => t.status === 'active');
  const hasUnlimited = activeTickets.some((t) => t.rides_remaining == null);
  const ridesLeft = activeTickets.reduce((n, t) => n + (t.rides_remaining ?? 0), 0);
  const ridesLabel = hasUnlimited ? 'Unlimited' : String(ridesLeft);

  const totalSpent = orders
    .filter((o) => o.status === 'paid')
    .reduce((sum, o) => sum + o.amount_paisa, 0);

  const recentOrders = useMemo(
    () => [...orders].sort((a, b) => b.created_at.localeCompare(a.created_at)).slice(0, 3),
    [orders],
  );

  const liveBuses = useMemo(() => buses.filter((b) => b.freshness !== 'lost').sort(liveFirst), [buses]);
  const activeBus = liveBuses[0] ?? null;
  const nextBus = liveBuses[1] ?? null;

  const greeting = greetingFor(new Date().getHours());
  const name = user?.name ?? 'Student';

  return (
    <div className="min-h-full bg-gray-50">
      {/* ── Header ── */}
      <div className="relative bg-[#1A3C8F] px-5 pt-10 pb-20 overflow-hidden">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-8 -right-6 w-28 h-28 rounded-full bg-white/5" />
        <div className="absolute -bottom-6 -left-8 w-36 h-36 rounded-full bg-white/5" />

        <div className="relative flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div
              className="w-11 h-11 rounded-full bg-[#1DB954] flex items-center justify-center shrink-0"
              style={{ fontSize: 16, fontWeight: 700, color: '#fff' }}
            >
              {initial(name)}
            </div>
            <div>
              <p className="text-white/60" style={{ fontSize: 12 }}>{greeting},</p>
              <p className="text-white truncate" style={{ fontSize: 17, fontWeight: 700, maxWidth: 240 }}>{name}</p>
            </div>
          </div>
        </div>

        {/* Tickets pill — the real stored value, not a cash balance */}
        <div className="relative mt-5 flex items-center justify-between bg-white/10 rounded-2xl px-4 py-3">
          <div>
            <p className="text-white/60" style={{ fontSize: 11 }}>Rides left</p>
            <p className="text-white flex items-baseline gap-1" style={{ fontWeight: 800 }}>
              <span style={{ fontSize: 22 }}>{ridesLabel}</span>
              {!hasUnlimited && <span className="text-white/60" style={{ fontSize: 12, fontWeight: 600 }}>rides</span>}
            </p>
          </div>
          <button
            onClick={() => navigate('/wallet')}
            className="flex items-center gap-1.5 bg-[#1DB954] rounded-xl px-4 py-2"
          >
            <Ticket className="w-4 h-4 text-white" />
            <span className="text-white" style={{ fontSize: 13, fontWeight: 600 }}>Buy ticket</span>
          </button>
        </div>
      </div>

      {/* ── Live bus card ── */}
      <div className="px-4 -mt-12 relative z-10">
        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="bg-[#1A3C8F] px-4 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${activeBus ? 'bg-[#1DB954] animate-pulse' : 'bg-white/30'}`} />
              <span className="text-white" style={{ fontSize: 12, fontWeight: 600 }}>LIVE TRACKING</span>
            </div>
            {routeName && <span className="text-white/60 truncate" style={{ fontSize: 11, maxWidth: 150 }}>{routeName}</span>}
          </div>

          {activeBus ? (
            <div className="p-4 space-y-3">
              <div className="flex items-start justify-between">
                <div>
                  <p className="text-gray-400" style={{ fontSize: 11 }}>Nearest bus</p>
                  <p className="text-gray-900" style={{ fontSize: 20, fontWeight: 800 }}>{busLabel(activeBus)}</p>
                  <div className="flex items-center gap-1 mt-0.5">
                    <MapPin className="w-3.5 h-3.5 text-gray-400" />
                    <p className="text-gray-500" style={{ fontSize: 12 }}>{routeName}</p>
                  </div>
                </div>
                {activeBus.next_stop_eta_minutes != null && (
                  <div className="text-right">
                    <div className="flex items-center gap-1 justify-end bg-[#1DB954]/10 rounded-xl px-3 py-1.5">
                      <Clock className="w-3.5 h-3.5 text-[#1DB954]" />
                      <span className="text-[#1DB954]" style={{ fontSize: 15, fontWeight: 800 }}>{activeBus.next_stop_eta_minutes} min</span>
                    </div>
                    <p className="text-gray-400 mt-1" style={{ fontSize: 11 }}>to next stop</p>
                  </div>
                )}
              </div>

              {activeBus.capacity != null && activeBus.occupied != null && (
                (() => {
                  const available = Math.max(activeBus.capacity - activeBus.occupied, 0);
                  const color = seatColor(available, activeBus.capacity);
                  const pct = activeBus.capacity > 0 ? (available / activeBus.capacity) * 100 : 0;
                  return (
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="flex items-center gap-1 text-gray-500" style={{ fontSize: 12 }}>
                          <Users className="w-3.5 h-3.5" />
                          Seats available
                        </span>
                        <span style={{ fontSize: 12, fontWeight: 600, color }}>{available} / {activeBus.capacity}</span>
                      </div>
                      <div className="h-1.5 rounded-full bg-gray-100 overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
                      </div>
                    </div>
                  );
                })()
              )}

              <button
                onClick={() => navigate('/map')}
                className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl bg-[#1A3C8F] text-white"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                <MapPin className="w-4 h-4" />
                Track on Map
              </button>
            </div>
          ) : (
            <div className="p-5 text-center space-y-3">
              <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mx-auto">
                <Bus className="w-6 h-6 text-gray-400" />
              </div>
              <p className="text-gray-500" style={{ fontSize: 13 }}>
                {routeId ? 'No buses are live right now.' : 'Loading live buses…'}
              </p>
              <button
                onClick={() => navigate('/map')}
                className="w-full flex items-center justify-center gap-1.5 h-10 rounded-xl border border-[#1A3C8F] text-[#1A3C8F]"
                style={{ fontSize: 13, fontWeight: 600 }}
              >
                <MapPin className="w-4 h-4" />
                Open live map
              </button>
            </div>
          )}
        </div>
      </div>

      <div className="px-4 pt-4 pb-6 space-y-4">
        {/* Next bus compact — only when a second live bus exists */}
        {nextBus && (
          <button
            onClick={() => navigate('/map')}
            className="w-full bg-white rounded-2xl shadow-sm border border-gray-100 px-4 py-3 flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-xl bg-[#F59E0B]/10 flex items-center justify-center shrink-0">
              <Bus className="w-5 h-5 text-[#F59E0B]" />
            </div>
            <div className="flex-1 min-w-0 text-left">
              <p className="text-gray-900" style={{ fontSize: 13, fontWeight: 600 }}>
                {busLabel(nextBus)}
                {nextBus.next_stop_eta_minutes != null && ` • ${nextBus.next_stop_eta_minutes} min`}
              </p>
              <p className="text-gray-400 truncate" style={{ fontSize: 12 }}>{routeName}</p>
            </div>
            <ArrowRight className="w-4 h-4 text-gray-300 shrink-0" />
          </button>
        )}

        {/* Stats row — both derived from real orders/tickets */}
        <div className="grid grid-cols-2 gap-3">
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400" style={{ fontSize: 11 }}>Rides remaining</p>
              <Ticket className="w-4 h-4 text-[#1DB954]" />
            </div>
            <p className="text-gray-900" style={{ fontSize: 24, fontWeight: 800 }}>{ridesLabel}</p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: 11 }}>{activeTickets.length} active {activeTickets.length === 1 ? 'ticket' : 'tickets'}</p>
          </div>
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-gray-400" style={{ fontSize: 11 }}>Total spent</p>
              <CreditCard className="w-4 h-4 text-[#1A3C8F]" />
            </div>
            <p className="text-gray-900" style={{ fontSize: 24, fontWeight: 800 }}>{taka(totalSpent)}</p>
            <p className="text-gray-400 mt-0.5" style={{ fontSize: 11 }}>{orders.filter((o) => o.status === 'paid').length} paid orders</p>
          </div>
        </div>

        {/* Recent orders */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
          <div className="px-4 pt-4 pb-2 flex items-center justify-between">
            <p className="text-gray-900" style={{ fontSize: 14, fontWeight: 700 }}>Recent purchases</p>
            <button
              onClick={() => navigate('/history')}
              className="text-[#1A3C8F] flex items-center gap-0.5"
              style={{ fontSize: 12, fontWeight: 600 }}
            >
              See all <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <p className="px-4 pb-4 pt-1 text-gray-400" style={{ fontSize: 13 }}>No purchases yet.</p>
          ) : (
            recentOrders.map((o) => (
              <div key={o.id} className="px-4 py-3 flex items-center gap-3 border-t border-gray-50 first:border-t-0">
                <div className="w-9 h-9 rounded-xl bg-[#1A3C8F]/10 flex items-center justify-center shrink-0">
                  <Ticket className="w-4 h-4 text-[#1A3C8F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-900 truncate" style={{ fontSize: 13, fontWeight: 600 }}>{productName(o.product_id)}</p>
                  <p className="text-gray-400" style={{ fontSize: 11 }}>{new Date(o.created_at).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })}</p>
                </div>
                <div className="text-right shrink-0">
                  <p className="text-gray-900" style={{ fontSize: 13, fontWeight: 700 }}>{taka(o.amount_paisa)}</p>
                  <p className={o.status === 'paid' ? 'text-[#1DB954]' : 'text-gray-400'} style={{ fontSize: 11 }}>{o.status}</p>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
