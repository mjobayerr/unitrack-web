import Link from "next/link";
import { notFound, redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { ApiError, SessionExpiredError, apiCall } from "../../../../lib/api";
import { StopOrderEditor } from "./StopOrderEditor";

type RouteDetail = components["schemas"]["RouteDetailOut"];
type Stop = components["schemas"]["StopOut"];

export const dynamic = "force-dynamic";

export default async function RouteDetailPage({
  params,
}: {
  params: Promise<{ routeId: string }>;
}) {
  const { routeId } = await params;

  let route: RouteDetail;
  let stops: Stop[];
  try {
    // Both in parallel: the editor cannot render until it knows the current
    // order *and* every stop available to add, and one waiting on the other
    // doubles the time to first paint for no reason.
    [route, stops] = await Promise.all([
      apiCall<RouteDetail>((api) =>
        api.GET("/fleet/routes/{route_id}", { params: { path: { route_id: routeId } } }),
      ),
      apiCall<Stop[]>((api) => api.GET("/fleet/stops", {})),
    ]);
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    if (error instanceof ApiError && error.status === 404) notFound();
    throw error;
  }

  return (
    <>
      <header className="topbar">
        <h1>{route.name}</h1>
        <span className="who">Administrator</span>
      </header>

      <main>
        <div className="page-head">
          <Link className="back" href="/routes">
            ← All routes
          </Link>
          <h2>
            {route.name} <span className="muted-inline">{route.direction}</span>
          </h2>
          <p className="sub">
            {route.is_active
              ? "Active — helpers can start trips on this route."
              : "Retired — no new trips can start on it."}
          </p>
        </div>

        <StopOrderEditor routeId={route.id} initial={route.stops} allStops={stops} />
      </main>
    </>
  );
}
