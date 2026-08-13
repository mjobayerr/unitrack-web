import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { NewRoute } from "./NewRoute";
import { RouteRow } from "./RouteRow";

type Route = components["schemas"]["RouteOut"];

export const dynamic = "force-dynamic";

export default async function RoutesPage() {
  let routes: Route[];
  try {
    // `only_active=false` so retired routes are visible here. Helpers and
    // students see the filtered list; an operator has to see what they retired
    // in order to bring it back.
    routes = await apiCall((api) =>
      api.GET("/fleet/routes", { params: { query: { only_active: false } } }),
    );
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  const ordered = [...routes].sort((a, b) =>
    a.is_active === b.is_active
      ? a.name.localeCompare(b.name) || a.direction.localeCompare(b.direction)
      : a.is_active
        ? -1
        : 1,
  );
  const active = ordered.filter((r) => r.is_active).length;

  return (
    <>
      <header className="topbar">
        <h1>Routes</h1>
        <span className="who">Administrator</span>
      </header>

      <main>
        <div className="page-head">
          <h2>Route network</h2>
          <p className="sub">
            {active === 0
              ? "No active routes — helpers cannot start a trip."
              : `${active} active route${active === 1 ? "" : "s"}.`}
          </p>
        </div>

        <section className="card">
          <div className="card-head">
            <span>All routes</span>
            <NewRoute />
          </div>

          {ordered.length === 0 ? (
            <p className="empty">No routes yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Direction</th>
                    <th scope="col">Status</th>
                    <th scope="col" className="actions">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {ordered.map((route) => (
                    <RouteRow key={route.id} route={route} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="footnote">
          Routes are retired, never deleted — completed trips reference them and
          a retired route still has to resolve in a report.
        </p>
      </main>
    </>
  );
}
