import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { TicketCard } from "./TicketCard";

type Ticket = components["schemas"]["TicketOut"];

export const dynamic = "force-dynamic";

export default async function WalletPage() {
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
