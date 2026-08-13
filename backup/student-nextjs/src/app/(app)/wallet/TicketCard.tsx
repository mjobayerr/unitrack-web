"use client";

import { useEffect, useState } from "react";

import type { components } from "@unitrack/api-client";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

type Ticket = components["schemas"]["TicketOut"];

/// How often the displayed code is replaced.
///
/// The code is valid for a 30-second slice with one slice of tolerance either
/// side, so ten seconds keeps a shown code comfortably far from expiry while
/// someone queues at the door. Refreshing every second would just burn battery
/// and data for no extra safety.
const REFRESH_MS = 10_000;

/// The fleet's timezone, matching the backend's `SERVICE_TIMEZONE`.
///
/// Not the browser's: a student checking their wallet from abroad, or a phone
/// with the wrong region set, must still see the date the ticket actually stops
/// working in Dhaka.
const SERVICE_TZ = "Asia/Dhaka";

const DATE_FORMAT = new Intl.DateTimeFormat("en-GB", {
  timeZone: SERVICE_TZ,
  day: "numeric",
  month: "short",
  year: "numeric",
});

/// The expiry date as the student experiences it.
///
/// `valid_to.slice(0, 10)` was wrong, not just unpolished: the API sends UTC, and
/// Dhaka is UTC+6. Anything expiring after 18:00 UTC therefore displayed a day
/// *early* — a ticket good until midnight on the 13th read "Valid to
/// 2026-08-12", so a student would believe it had run out while it still worked.
function expiryLabel(validTo: string): string {
  const parsed = new Date(validTo);
  // A malformed timestamp must not blank the card the student is trying to
  // board with.
  if (Number.isNaN(parsed.getTime())) return validTo.slice(0, 10);
  return DATE_FORMAT.format(parsed);
}

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const [showing, setShowing] = useState(false);

  return (
    <Card className="mb-3 rounded-2xl">
      <CardContent className="px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <strong className="font-semibold">
              {ticket.rides_total === null ? "Unlimited pass" : "Ride ticket"}
            </strong>
            <div className="text-[13px] text-muted-foreground">
              Valid to {expiryLabel(ticket.valid_to)}
            </div>
          </div>
          <div className="shrink-0 text-right text-2xl font-bold tracking-tight">
            {ticket.rides_remaining === null ? "∞" : ticket.rides_remaining}
            <span className="ml-1 text-[13px] font-normal text-muted-foreground">left</span>
          </div>
        </div>

        {showing ? (
          <BoardingCode ticketId={ticket.id} onHide={() => setShowing(false)} />
        ) : (
          <Button className="mt-3.5 min-h-[46px] w-full" onClick={() => setShowing(true)}>
            Show boarding code
          </Button>
        )}
      </CardContent>
    </Card>
  );
}

function BoardingCode({ ticketId, onHide }: { ticketId: string; onHide: () => void }) {
  // Bumped on a timer purely to change the URL. The image itself is fetched
  // through this app's own route handler, which attaches the bearer token the
  // browser cannot see.
  const [tick, setTick] = useState(() => Date.now());

  useEffect(() => {
    const id = setInterval(() => setTick(Date.now()), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <div className="mt-3.5">
      {/* Always on white, whatever the page theme: a scanner reading a dark-mode
          QR off a dim phone in a moving bus is the failure nobody tests for. */}
      <div className="grid place-items-center rounded-xl bg-white p-3">
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image would
            cache and optimise a code that is only valid for 30 seconds. */}
        <img src={`/api/qr/${ticketId}?t=${tick}`} alt="Boarding code" className="w-full max-w-56" />
      </div>
      <p className="mt-2 text-center text-[13px] text-muted-foreground">
        Show this to the helper. It refreshes automatically.
      </p>
      <Button variant="secondary" className="mt-2.5 min-h-[46px] w-full" onClick={onHide}>
        Hide
      </Button>
    </div>
  );
}
