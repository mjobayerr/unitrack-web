import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, TrendingDown, Clock, CreditCard, Loader2 } from 'lucide-react';
import { Badge } from '../components/ui/badge';
import { apiCall, type components } from '../../lib/api';
import { taka, relativeDateTime } from '../../lib/format';

type Order = components['schemas']['OrderOut'];
type Product = components['schemas']['ProductOut'];

const FILTERS = [
  { id: 'all', label: 'All' },
  { id: 'week', label: 'This Week' },
  { id: 'month', label: 'This Month' },
] as const;
type FilterId = (typeof FILTERS)[number]['id'];

function withinDays(iso: string, days: number): boolean {
  const t = new Date(iso).getTime();
  return !Number.isNaN(t) && Date.now() - t <= days * 86_400_000;
}

export function TransactionHistory() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState<FilterId>('all');
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [products, setProducts] = useState<Record<string, Product>>({});
  const [error, setError] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ords, prods] = await Promise.all([
          apiCall((api) => api.GET('/shop/orders', {})),
          apiCall((api) => api.GET('/shop/products', {})),
        ]);
        if (cancelled) return;
        setOrders(ords);
        setProducts(Object.fromEntries(prods.map((p) => [p.id, p])));
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = useMemo(() => {
    if (!orders) return [];
    return orders.filter((o) => {
      const when = o.paid_at ?? o.created_at;
      if (activeFilter === 'week') return withinDays(when, 7);
      if (activeFilter === 'month') return withinDays(when, 31);
      return true;
    });
  }, [orders, activeFilter]);

  // "This month" summary — paid orders only, so failed attempts do not count as
  // spend. Amounts are paisa integers on the backend; taka() converts.
  const paidThisMonth = (orders ?? []).filter(
    (o) => o.status === 'paid' && withinDays(o.paid_at ?? o.created_at, 31),
  );
  const spentPaisa = paidThisMonth.reduce((acc, o) => acc + o.amount_paisa, 0);

  const productName = (id: string) => products[id]?.name ?? 'Ticket';

  return (
    <div className="min-h-full bg-background max-w-[430px] mx-auto">
      {/* Header */}
      <div className="bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] text-white px-6 pt-8 pb-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            onClick={() => navigate(-1)}
            className="w-10 h-10 bg-white/20 backdrop-blur-sm rounded-full flex items-center justify-center"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-2xl">Transaction History</h1>
            <p className="text-white/80 text-sm">Your payment records</p>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="px-6 py-6 space-y-6">
        {/* Summary Card */}
        <div className="bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] text-white rounded-[16px] shadow-lg p-6 -mt-12">
          <div className="flex items-center gap-2 mb-4 text-white/80">
            <TrendingDown className="w-5 h-5" />
            <span className="text-sm">This Month</span>
          </div>
          <div className="grid grid-cols-2 gap-6">
            <div>
              <p className="text-white/80 text-sm mb-1">Total Spent</p>
              <p className="text-3xl">{taka(spentPaisa)}</p>
            </div>
            <div>
              <p className="text-white/80 text-sm mb-1">Purchases</p>
              <p className="text-3xl">{paidThisMonth.length}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="flex gap-2 overflow-x-auto pb-2">
          {FILTERS.map((filter) => (
            <button
              key={filter.id}
              onClick={() => setActiveFilter(filter.id)}
              className={`px-4 py-2 rounded-[12px] text-sm whitespace-nowrap transition-all ${
                activeFilter === filter.id
                  ? 'bg-[#1A3C8F] text-white shadow-md'
                  : 'bg-white text-gray-600 border border-gray-200'
              }`}
            >
              {filter.label}
            </button>
          ))}
        </div>

        {/* Transactions List */}
        {orders === null && !error && (
          <div className="flex items-center justify-center py-16 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}

        {error && (
          <div className="text-center py-16 text-gray-500 text-sm">
            Couldn't load your transactions. Pull down or try again later.
          </div>
        )}

        {orders !== null && !error && filtered.length === 0 && (
          <div className="text-center py-16 text-gray-500 text-sm">
            No transactions yet. Buy a ticket to get started.
          </div>
        )}

        <div className="space-y-3">
          {filtered.map((order) => (
            <div
              key={order.id}
              className="bg-white rounded-[16px] shadow-sm p-4 border border-gray-100"
            >
              <div className="flex items-start justify-between mb-3">
                <div className="flex items-start gap-3">
                  <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mt-0.5">
                    <CreditCard className="w-6 h-6 text-[#1A3C8F]" />
                  </div>
                  <div>
                    <p className="text-gray-900 mb-1">{productName(order.product_id)}</p>
                    <p className="text-sm text-gray-500 flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {relativeDateTime(order.paid_at ?? order.created_at)}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg text-gray-900 mb-1">{taka(order.amount_paisa)}</p>
                  <Badge
                    variant="outline"
                    className={
                      order.status === 'paid'
                        ? 'bg-[#1DB954]/10 text-[#1DB954] border-[#1DB954]/20 text-xs'
                        : order.status === 'failed'
                          ? 'bg-red-50 text-[#EF4444] border-red-200 text-xs'
                          : 'bg-amber-50 text-amber-600 border-amber-200 text-xs'
                    }
                  >
                    {order.status}
                  </Badge>
                </div>
              </div>

              <div className="flex items-center justify-between pt-3 border-t border-gray-100">
                <div className="flex items-center gap-2 text-sm text-gray-500">
                  <CreditCard className="w-4 h-4" />
                  <span>SSLCommerz</span>
                </div>
                <span className="text-xs text-gray-400 font-mono">{order.tran_id.slice(0, 12)}</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
