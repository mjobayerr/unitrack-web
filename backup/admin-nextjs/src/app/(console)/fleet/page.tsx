import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";
import type { RouteShape } from "@unitrack/map";

import { Card, CardContent } from "@/components/ui/card";

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
  let routes: RouteShape[] = [];
  try {
    // Both at once: the two are independent, and awaiting them in sequence
    // adds the slower one's latency to the faster one's for nothing.
    [fleet, routes] = await Promise.all([
      apiCall((api) => api.GET("/admin/fleet")),
      // Route geometry is decoration on this screen, not the point of it. A
      // failure here loses the lines and keeps the fleet, rather than 500ing
      // the page an operator is watching an incident on.
      apiCall<RouteShape[]>((api) => api.GET("/fleet/route-shapes", {})).catch(() => []),
    ]);
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  const quiet = fleet.stale + fleet.lost;

  return (
    <main className="max-w-7xl p-4 md:p-7">
      <div className="mb-5">
        <h2 className="text-xl font-bold tracking-tight">Live fleet</h2>
        <p className="text-muted-foreground">
          {fleet.total === 0
            ? "No trips are running."
            : quiet > 0
              ? // The noun agrees with the total, the verb with the quiet count —
                // they are different numbers, and pluralising only the noun read
                // "2 of 2 buses has stopped reporting."
                `${quiet} of ${fleet.total} bus${fleet.total === 1 ? "" : "es"}` +
                ` ${quiet === 1 ? "has" : "have"} stopped reporting.`
              : `${fleet.total} bus${fleet.total === 1 ? "" : "es"} on trip, all reporting.`}
        </p>
      </div>

      {/* Counts come from the API so every client agrees on them, and so "2 have
          gone quiet" is visible without reading the whole list. */}
      <section className="mb-6 grid grid-cols-2 gap-3.5 lg:grid-cols-4">
        <Stat label="On trip" value={fleet.total} />
        <Stat label="Reporting" value={fleet.live} />
        <Stat label="Gone quiet" value={fleet.stale} attention={fleet.stale > 0} />
        <Stat label="No signal" value={fleet.lost} attention={fleet.lost > 0} />
      </section>

      <FleetMap initial={fleet} routes={routes} />
    </main>
  );
}

function Stat({
  label,
  value,
  attention = false,
}: {
  label: string;
  value: number;
  attention?: boolean;
}) {
  return (
    <Card className="rounded-2xl">
      <CardContent className="px-6">
        <div className="text-xs font-medium text-muted-foreground">{label}</div>
        <div
          className={`mt-0.5 text-2xl font-bold tracking-tight ${attention ? "text-warning" : ""}`}
        >
          {value}
        </div>
      </CardContent>
    </Card>
  );
}
