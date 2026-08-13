import { redirect } from "next/navigation";

import type { RouteShape } from "@unitrack/map";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { LiveMap } from "./LiveMap";

export const dynamic = "force-dynamic";

/**
 * Live map.
 *
 * The routes are fetched here, on the server, rather than by the map component.
 * They are the one thing on this screen that does not change minute to minute,
 * so fetching them on the client would mean a second round trip on a phone
 * connection before the corridor appears — the map would open blank and then
 * redraw. Positions stay client-side, because those do change.
 *
 * A failure to load them is not fatal: the map still shows live buses, just
 * without the line they follow. Losing the whole screen over decoration would
 * be the wrong trade for someone standing at a stop.
 */
export default async function TrackPage() {
  let routes: RouteShape[] = [];
  try {
    routes = await apiCall((api) => api.GET("/fleet/route-shapes", {}));
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    routes = [];
  }

  // Full-bleed: no navy band, no page padding. The map is the screen.
  return <LiveMap routes={routes} />;
}
