import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { TicketCard } from "./TicketCard";

type Ticket = components["schemas"]["TicketOut"];

export const dynamic = "force-dynamic";

/**
 * What to tell someone arriving back from the payment gateway.
 *
 * The status comes from the API's own redirect, not from the gateway, so it
 * already reflects a server-side validation. It is still only a *message* — the
 * ticket list below is the real answer, and it is loaded fresh on every view.
 */
const OUTCOMES: Record<string, { tone: string; text: string }> = {
  paid: { tone: "ok", text: "Payment received. Your ticket is ready." },
  failed: { tone: "bad", text: "Payment failed. Nothing was charged." },
  cancelled: { tone: "bad", text: "Payment cancelled." },
  under_review: {
    tone: "warn",
    // Deliberately not "failed": the money may well have moved, and the
    // reconciler will settle it. Telling them it failed would be a lie they
    // act on by paying twice.
    text: "Payment is being reviewed. Your ticket will appear once it clears.",
  },
};

export default async function WalletPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const { status } = await searchParams;
  const outcome = status ? OUTCOMES[status] : undefined;

  let tickets: Ticket[];
  try {
    tickets = await apiCall((api) => api.GET("/shop/tickets", {}));
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  // Active first, then soonest to expire. A student opening this at a bus door
  // wants the ticket they are about to use, not their purchase history.
  const active = tickets
    .filter((t) => t.status === "active")
    .sort((a, b) => Date.parse(a.valid_to) - Date.parse(b.valid_to));
  const inactive = tickets.filter((t) => t.status !== "active");

  return (
    <main>
      <h2>My tickets</h2>

      {outcome ? <p className={`banner banner-${outcome.tone}`}>{outcome.text}</p> : null}

      {active.length === 0 ? (
        <p className="empty">
          No active tickets.
          <br />
          Buy one to start riding.
        </p>
      ) : (
        active.map((ticket) => <TicketCard key={ticket.id} ticket={ticket} />)
      )}

      {inactive.length > 0 ? (
        <>
          <h3 className="section">Past tickets</h3>
          {inactive.map((t) => (
            <div className="card muted-card" key={t.id}>
              <div className="row">
                <span>{t.rides_total === null ? "Unlimited pass" : "Ride ticket"}</span>
                <span className={`tag tag-${t.status}`}>{t.status}</span>
              </div>
            </div>
          ))}
        </>
      ) : null}
    </main>
  );
}
