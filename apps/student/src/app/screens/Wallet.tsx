import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router';
import { ArrowLeft, Plus, ArrowUpRight, Loader2, Ticket, X } from 'lucide-react';
import { apiCall, ApiError, type components } from '../../lib/api';
import { taka, relativeDateTime } from '../../lib/format';

type Order = components['schemas']['OrderOut'];
type Product = components['schemas']['ProductOut'];
type TicketT = components['schemas']['TicketOut'];

/**
 * The "wallet" the backend actually has is a wallet of **tickets**, not a
 * stored-value balance: there is no top-up endpoint, and money only enters as a
 * ticket purchase settled by SSLCommerz (which offers bKash). So the headline is
 * rides remaining, the history is real orders, and "Top-Up" is the real buy
 * flow — pick a product, create an order, hand off to the gateway.
 */
export function Wallet() {
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[] | null>(null);
  const [tickets, setTickets] = useState<TicketT[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [error, setError] = useState(false);
  const [buying, setBuying] = useState(false);
  const [showBuy, setShowBuy] = useState(false);
  const [buyError, setBuyError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const [ords, tks, prods] = await Promise.all([
          apiCall((api) => api.GET('/shop/orders', {})),
          apiCall((api) => api.GET('/shop/tickets', {})),
          apiCall((api) => api.GET('/shop/products', {})),
        ]);
        if (cancelled) return;
        setOrders(ords);
        setTickets(tks);
        setProducts(prods);
      } catch {
        if (!cancelled) setError(true);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const productName = (id: string) =>
    products.find((p) => p.id === id)?.name ?? 'Ticket';

  // Rides left across active tickets. A null ride count is an unlimited pass.
  const active = tickets.filter((t) => t.status === 'active');
  const unlimited = active.some((t) => t.rides_remaining == null);
  const ridesLeft = active.reduce((acc, t) => acc + (t.rides_remaining ?? 0), 0);

  async function buy(product: Product) {
    if (buying) return;
    setBuying(true);
    setBuyError(null);
    try {
      const checkout = await apiCall((api) =>
        api.POST('/shop/orders', {
          body: { product_id: product.id, idempotency_key: crypto.randomUUID() },
        }),
      );
      // Hand off to the gateway's hosted page. The ticket is issued only after
      // the server validates the payment — never on the browser redirect alone.
      window.location.href = checkout.checkout_url;
    } catch (err) {
      setBuyError(
        err instanceof ApiError && err.status === 502
          ? 'Payments are not configured on the server yet.'
          : 'Could not start checkout. Try again in a moment.',
      );
      setBuying(false);
    }
  }

  return (
    <div className="min-h-full bg-gray-50">
      {/* Header */}
      <div className="bg-[#1A3C8F] px-5 pt-10 pb-20 overflow-hidden relative">
        <div className="absolute -top-10 -right-10 w-48 h-48 rounded-full bg-white/5" />
        <div className="absolute top-8 -right-6 w-28 h-28 rounded-full bg-white/5" />
        <div className="flex items-center gap-4 mb-5">
          <button onClick={() => navigate(-1)} className="w-9 h-9 rounded-full bg-white/15 flex items-center justify-center">
            <ArrowLeft className="w-5 h-5 text-white" />
          </button>
          <h1 className="text-white text-xl font-bold">My Wallet</h1>
        </div>
        <div className="relative">
          <p className="text-white/60 text-sm mb-1">Rides Available</p>
          <p className="text-white font-black" style={{ fontSize: 40 }}>
            {unlimited ? 'Unlimited' : ridesLeft}
          </p>
        </div>
      </div>

      <div className="px-4 -mt-10 relative z-10">
        <button
          onClick={() => setShowBuy(true)}
          className="w-full bg-[#1DB954] text-white rounded-2xl h-14 flex items-center justify-center gap-2 shadow-lg shadow-[#1DB954]/30 font-bold text-base"
        >
          <Plus className="w-5 h-5" /> Buy a Ticket
        </button>
      </div>

      <div className="px-4 pt-6 pb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-gray-900 font-bold text-base">Transaction History</h2>
          {orders && (
            <span className="text-gray-400 text-xs">{orders.length} transactions</span>
          )}
        </div>

        {orders === null && !error && (
          <div className="flex items-center justify-center py-12 text-gray-400">
            <Loader2 className="w-6 h-6 animate-spin" />
          </div>
        )}
        {error && (
          <div className="text-center py-12 text-gray-500 text-sm">
            Couldn't load your wallet. Try again later.
          </div>
        )}
        {orders !== null && !error && orders.length === 0 && (
          <div className="text-center py-12 text-gray-500 text-sm">
            No purchases yet. Buy a ticket to get started.
          </div>
        )}

        {orders && orders.length > 0 && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
            {orders.map((order, i) => (
              <div key={order.id} className={`flex items-center gap-3 px-4 py-3.5 ${i < orders.length - 1 ? 'border-b border-gray-50' : ''}`}>
                <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0 bg-[#1A3C8F]/8">
                  <ArrowUpRight className="w-5 h-5 text-[#1A3C8F]" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-gray-800 text-sm font-medium truncate">{productName(order.product_id)}</p>
                  <p className="text-gray-400 text-xs">{relativeDateTime(order.paid_at ?? order.created_at)}</p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-bold text-sm text-gray-900">-{taka(order.amount_paisa)}</span>
                  <p className={`text-xs ${order.status === 'paid' ? 'text-[#1DB954]' : order.status === 'failed' ? 'text-[#EF4444]' : 'text-amber-600'}`}>
                    {order.status}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Buy sheet — real products, real checkout */}
      {showBuy && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-end justify-center" onClick={() => !buying && setShowBuy(false)}>
          <div className="bg-white rounded-t-[24px] w-full max-w-[430px] p-5 pb-8" onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-gray-900 font-bold text-lg">Buy a Ticket</h3>
              <button onClick={() => !buying && setShowBuy(false)} className="w-8 h-8 rounded-full bg-gray-100 flex items-center justify-center">
                <X className="w-4 h-4 text-gray-500" />
              </button>
            </div>

            {buyError && (
              <p className="text-sm text-[#EF4444] bg-red-50 rounded-xl px-4 py-3 mb-3">{buyError}</p>
            )}

            {products.length === 0 ? (
              <p className="text-gray-500 text-sm py-6 text-center">No ticket products available right now.</p>
            ) : (
              <div className="space-y-2">
                {products.map((p) => (
                  <button
                    key={p.id}
                    disabled={buying}
                    onClick={() => buy(p)}
                    className="w-full flex items-center gap-3 p-4 rounded-2xl border border-gray-200 bg-gray-50 disabled:opacity-60 active:bg-gray-100"
                  >
                    <div className="w-10 h-10 rounded-xl bg-[#1DB954]/10 flex items-center justify-center shrink-0">
                      <Ticket className="w-5 h-5 text-[#1DB954]" />
                    </div>
                    <div className="flex-1 min-w-0 text-left">
                      <p className="text-gray-900 text-sm font-semibold truncate">{p.name}</p>
                      <p className="text-gray-400 text-xs">
                        {p.ride_count == null ? 'Unlimited rides' : `${p.ride_count} ride${p.ride_count === 1 ? '' : 's'}`}
                        {' · '}valid {p.validity_days}d
                      </p>
                    </div>
                    <span className="text-[#1A3C8F] font-bold shrink-0">{taka(p.price_paisa)}</span>
                  </button>
                ))}
              </div>
            )}

            {buying && (
              <div className="flex items-center justify-center gap-2 text-gray-500 text-sm mt-4">
                <Loader2 className="w-4 h-4 animate-spin" /> Starting secure checkout…
              </div>
            )}
            <p className="text-center text-gray-400 text-xs mt-4 px-2">
              Payment is completed on SSLCommerz (cards + bKash). Your ticket is issued only after the payment is verified.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
