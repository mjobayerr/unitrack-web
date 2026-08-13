import Link from "next/link";
import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { Card, CardContent } from "@/components/ui/card";
import { taka } from "@/lib/demo";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { ScreenHeader } from "../ScreenHeader";
import { QrBoarding } from "./QrBoarding";

type Ticket = components["schemas"]["TicketOut"];
type Product = components["schemas"]["ProductOut"];
type User = components["schemas"]["UserOut"];

export const dynamic = "force-dynamic";

export default async function QrPage() {
  let tickets: Ticket[];
  let products: Product[];
  let me: User;
  try {
    [tickets, products, me] = await Promise.all([
      apiCall((api) => api.GET("/shop/tickets", {})),
      apiCall((api) => api.GET("/shop/products", {})),
      apiCall((api) => api.GET("/auth/me", {})),
    ]);
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  // The ticket about to be used: active, and the soonest to expire so a nearly
  // spent one is shown before a fresh monthly pass.
  const ticket = tickets
    .filter((t) => t.status === "active")
    .sort((a, b) => Date.parse(a.valid_to) - Date.parse(b.valid_to))[0];

  // The real single-trip price, straight off the catalogue.
  const single = products.find((p) => p.type === "single");

  const ridesLeft = tickets
    .filter((t) => t.status === "active")
    .reduce((sum, t) => sum + (t.rides_remaining ?? 0), 0);

  return (
    <main>
      <ScreenHeader title="QR Boarding" subtitle="Show to bus helper" back="/home" />

      <div className="px-4 pt-4">
        {ticket ? (
          <QrBoarding
            ticketId={ticket.id}
            name={me.name}
            fareLabel={single ? taka(single.price_paisa) : "—"}
            ridesLeft={ticket.rides_remaining === null ? "∞" : String(ticket.rides_remaining)}
          />
        ) : (
          <Card className="rounded-2xl">
            <CardContent className="px-4 py-10 text-center text-muted-foreground">
              No active ticket to board with.
              <br />
              <Link href="/shop" className="mt-2 inline-block font-semibold text-primary">
                Buy a ticket
              </Link>
            </CardContent>
          </Card>
        )}

        <Card className="mt-3 rounded-2xl">
          <CardContent className="flex items-center justify-between px-4">
            <div>
              <div className="text-[13px] text-muted-foreground">Rides remaining</div>
              <div className="text-lg font-bold tracking-tight">
                {ridesLeft}
                <span className="ml-1 text-[13px] font-normal text-muted-foreground">left</span>
              </div>
            </div>
            <Link href="/shop" className="text-[13px] font-semibold text-primary">
              Top-Up
            </Link>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
