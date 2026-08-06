"use client";

import { useEffect, useState } from "react";

import type { components } from "@unitrack/api-client";

type Ticket = components["schemas"]["TicketOut"];

/// How often the displayed code is replaced.
///
/// The code is valid for a 30-second slice with one slice of tolerance either
/// side, so ten seconds keeps a shown code comfortably far from expiry while
/// someone queues at the door. Refreshing every second would just burn battery
/// and data for no extra safety.
const REFRESH_MS = 10_000;

export function TicketCard({ ticket }: { ticket: Ticket }) {
  const [showing, setShowing] = useState(false);

  return (
    <div className="card">
      <div className="row">
        <div>
          <strong>{ticket.rides_total === null ? "Unlimited pass" : "Ride ticket"}</strong>
          <div className="meta">Valid to {ticket.valid_to.slice(0, 10)}</div>
        </div>
        <div className="rides">
          {ticket.rides_remaining === null ? "∞" : ticket.rides_remaining}
          <span className="meta"> left</span>
        </div>
      </div>

      {showing ? (
        <BoardingCode ticketId={ticket.id} onHide={() => setShowing(false)} />
      ) : (
        <button type="button" onClick={() => setShowing(true)}>
          Show boarding code
        </button>
      )}
    </div>
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
    <div className="qr-wrap">
      {/* Always on white, whatever the page theme: a scanner reading a dark-mode
          QR off a dim phone in a moving bus is the failure nobody tests for. */}
      <div className="qr">
        {/* eslint-disable-next-line @next/next/no-img-element -- next/image would
            cache and optimise a code that is only valid for 30 seconds. */}
        <img src={`/api/qr/${ticketId}?t=${tick}`} alt="Boarding code" />
      </div>
      <p className="meta center">Show this to the helper. It refreshes automatically.</p>
      <button className="secondary" type="button" onClick={onHide}>
        Hide
      </button>
    </div>
  );
}
