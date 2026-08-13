import { ArrowUpRight, Plus } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { Card, CardContent } from "@/components/ui/card";
import { taka } from "@/lib/demo";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { ScreenHeader } from "../ScreenHeader";

type Ticket = components["schemas"]["TicketOut"];
type Order = components["schemas"]["OrderOut"];
type Product = components["schemas"]["ProductOut"];

export const dynamic = "force-dynamic";

/** Banner tones for the post-checkout return. */
const TONE: Record<string, string> = {
  ok: "bg-success/15 text-success",
  bad: "bg-destructive/15 text-destructive",
  warn: "bg-warning/15 text-warning",
};

/**
 * What to tell someone arriving back from the payment gateway. The status is
 * only a *message* — the balance and history below are loaded fresh and are the
 * real answer.
 */
const OUTCOMES: Record<string, { tone: string; text: string }> = {
  paid: { tone: "ok", text: "Payment received. Your ticket is ready." },
  failed: { tone: "bad", text: "Payment failed. Nothing was charged." },
  cancelled: { tone: "bad", text: "Payment cancelled." },
  under_review: {
    tone: "warn",
    text: "Payment is being reviewed. Your ticket will appear once it clears.",
  },
};

/** How each order status should read in the history list. */
const ORDER_STATUS: Record<string, { label: string; className: string }> = {
  paid: { label: "Paid", className: "text-success" },
  pending: { label: "Pending", className: "text-warning" },
  initiated: { label: "Not completed", className: "text-muted-foreground" },
  failed: { label: "Failed", className: "text-destructive" },
  cancelled: { label: "Cancelled", className: "text-muted-foreground" },
  refunded: { label: "Refunded", className: "text-muted-foreground" },
};

const WHEN = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Asia/Dhaka",
  day: "numeric",
  month: "short",
  hour: "numeric",
  minute: "2-digit",
});

function whenLabel(iso: string): string {
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? iso.slice(0, 10) : WHEN.format(d);
}

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const outcome = status ? OUTCOMES[status] : undefined;

  let tickets: Ticket[];
  let orders: Order[];
  let products: Product[];
  try {
    // Three independent reads — fire them together rather than in series so the
    // screen is one round trip, not three, on a phone connection.
    [tickets, orders, products] = await Promise.all([
      apiCall((api) => api.GET("/shop/tickets", {})),
      apiCall((api) => api.GET("/shop/orders", {})),
      apiCall((api) => api.GET("/shop/products", {})),
    ]);
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  // There is no taka wallet in this system — a student pays per ticket through
  // SSLCommerz. The meaningful "balance" is therefore rides left to use.
  const active = tickets.filter((t) => t.status === "active");
  const ridesLeft = active.reduce(
    (sum, t) => sum + (t.rides_remaining ?? 0),
    0,
  );
  const hasUnlimited = active.some((t) => t.rides_remaining === null);

  const productName = new Map(products.map((p) => [p.id, p.name]));
  const history = [...orders].sort(
    (a, b) => Date.parse(b.created_at) - Date.parse(a.created_at),
  );

  return (
    <main>
      <ScreenHeader title="My Wallet" className="pb-8">
        <p className="mt-5 text-[13px] text-white/70">Rides remaining</p>
        <div className="mt-1 flex items-baseline gap-2">
          <span className="text-4xl font-bold tracking-tight">
            {hasUnlimited ? "∞" : ridesLeft}
          </span>
          <span className="text-[15px] text-white/70">
            across {active.length} {active.length === 1 ? "ticket" : "tickets"}
          </span>
        </div>

        {/* Green, the one colour reserved for taking money. This is the real
            top-up: SSLCommerz hosts the checkout that /shop starts. */}
        <Link
          href="/shop"
          className="mt-5 flex min-h-[52px] items-center justify-center gap-2 rounded-2xl bg-vibrant-green text-[15px] font-bold text-white hover:bg-vibrant-green/90"
        >
          <Plus className="size-5" />
          Top-Up via SSLCommerz
        </Link>
      </ScreenHeader>

      <div className="px-4 pt-4">
        {outcome ? (
          <p className={`mb-3 rounded-xl px-3.5 py-2.5 text-[13px] ${TONE[outcome.tone]}`}>
            {outcome.text}
          </p>
        ) : null}

        <div className="mb-2 flex items-baseline justify-between">
          <h2 className="text-base font-bold tracking-tight">Transaction history</h2>
          <span className="text-[13px] text-muted-foreground">
            {history.length} {history.length === 1 ? "order" : "orders"}
          </span>
        </div>

        {history.length === 0 ? (
          <Card className="rounded-2xl">
            <CardContent className="px-4 py-10 text-center text-muted-foreground">
              No purchases yet.
              <br />
              Buy a ticket to start riding.
            </CardContent>
          </Card>
        ) : (
          <Card className="gap-0 rounded-2xl py-0">
            {history.map((order, i) => {
              const meta = ORDER_STATUS[order.status] ?? {
                label: order.status,
                className: "text-muted-foreground",
              };
              return (
                <div
                  key={order.id}
                  className={`flex items-center gap-3 px-4 py-3.5 ${
                    i === history.length - 1 ? "" : "border-b border-border"
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary"
                  >
                    <ArrowUpRight className="size-[18px]" />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="truncate text-[15px] font-medium">
                      {productName.get(order.product_id) ?? "Ticket purchase"}
                    </div>
                    <div className="text-[13px] text-muted-foreground">
                      {whenLabel(order.created_at)}
                    </div>
                  </div>
                  <div className="shrink-0 text-right">
                    <div className="font-semibold">−{taka(order.amount_paisa)}</div>
                    <div className={`text-[12px] ${meta.className}`}>{meta.label}</div>
                  </div>
                </div>
              );
            })}
          </Card>
        )}
      </div>
    </main>
  );
}
