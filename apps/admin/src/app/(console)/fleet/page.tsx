import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { FleetMap } from "./FleetMap";

type Fleet = components["schemas"]["FleetOut"];

export const dynamic = "force-dynamic";

/**
 * Live fleet monitoring (spec §10.2).
 *
 * Fetched here on the server so the map renders with pins already on it rather
 * than flashing empty for the first poll, then handed to a client component
 * that keeps it fresh. Every other console page is server-rendered and done;
 * this one has to keep moving, which is why it is split.
 */
export default async function FleetPage() {
  let fleet: Fleet;
  try {
    fleet = await apiCall((api) => api.GET("/admin/fleet"));
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  const quiet = fleet.stale + fleet.lost;

  return (
    <>
      <div className="page-head">
        <h2>Live fleet</h2>
        <p className="sub">
          {fleet.total === 0
            ? "No trips are running."
            : quiet > 0
              ? `${quiet} of ${fleet.total} bus${fleet.total === 1 ? "" : "es"} has stopped reporting.`
              : `${fleet.total} bus${fleet.total === 1 ? "" : "es"} on trip, all reporting.`}
        </p>
      </div>

      {/* Counts come from the API so every client agrees on them, and so "2
          have gone quiet" is visible without reading the whole list. */}
      <section className="stats">
        <div className="stat">
          <div className="label">On trip</div>
          <div className="value">{fleet.total}</div>
        </div>
        <div className="stat">
          <div className="label">Reporting</div>
          <div className="value">{fleet.live}</div>
        </div>
        <div className="stat">
          <div className="label">Gone quiet</div>
          <div className={`value${fleet.stale > 0 ? " attention" : ""}`}>
            {fleet.stale}
          </div>
        </div>
        <div className="stat">
          <div className="label">No signal</div>
          <div className={`value${fleet.lost > 0 ? " attention" : ""}`}>
            {fleet.lost}
          </div>
        </div>
      </section>

      <FleetMap initial={fleet} />
    </>
  );
}
