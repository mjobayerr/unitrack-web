"use client";

import { useEffect, useState } from "react";

import { Card, CardContent } from "@/components/ui/card";

/// How often the displayed code is replaced. The code is valid for a 30-second
/// slice with one slice of tolerance either side, so ten seconds keeps a shown
/// code far from expiry while someone queues at the door.
const REFRESH_MS = 10_000;

/**
 * The rotating boarding QR, front and centre.
 *
 * The image is fetched through this app's own route handler, which attaches the
 * bearer token the browser cannot see. A timer bumps the query string so the
 * browser re-requests instead of serving a cached, expired slice.
 */
export function QrBoarding({
  ticketId,
  name,
  fareLabel,
  ridesLeft,
}: {
  ticketId: string;
  name: string;
  fareLabel: string;
  ridesLeft: string;
}) {
  // Starts at 0 so the server and the first client render agree on the URL —
  // `Date.now()` here would differ between the two and trip a hydration
  // mismatch. The effect swaps in a real timestamp after mount and keeps it
  // moving; the first frame's code is fresh regardless, so the constant costs
  // nothing.
  const [tick, setTick] = useState(0);

  useEffect(() => {
    setTick(Date.now());
    const id = setInterval(() => setTick(Date.now()), REFRESH_MS);
    return () => clearInterval(id);
  }, []);

  return (
    <Card className="rounded-2xl">
      <CardContent className="px-5 py-2">
        {/* Always on white, whatever the page theme: a scanner reading a
            dark-mode QR off a dim phone in a moving bus is the failure nobody
            tests for. */}
        <div className="mx-auto grid max-w-[260px] place-items-center rounded-2xl bg-white p-4">
          {/* eslint-disable-next-line @next/next/no-img-element -- next/image
              would cache a code that is only valid for 30 seconds. */}
          <img
            src={`/api/qr/${ticketId}?t=${tick}`}
            alt="Boarding code"
            className="w-full"
          />
        </div>

        <div className="mt-3 text-center">
          <div className="text-lg font-bold tracking-tight">{name}</div>
        </div>

        <div className="mt-3 flex items-center justify-between rounded-xl bg-muted px-4 py-3">
          <span className="text-[15px] text-muted-foreground">Single Trip Fare</span>
          <span className="text-lg font-bold tracking-tight">{fareLabel}</span>
        </div>

        <div className="mt-2 flex items-center justify-center gap-2 rounded-xl bg-success/10 px-4 py-3 text-[15px] font-semibold text-success">
          <span className="size-2 rounded-full bg-success" aria-hidden="true" />
          QR ready — refreshes automatically
        </div>

        <p className="mt-2 pb-1 text-center text-[13px] text-muted-foreground">
          {ridesLeft} ride{ridesLeft === "1" ? "" : "s"} on this ticket
        </p>
      </CardContent>
    </Card>
  );
}
