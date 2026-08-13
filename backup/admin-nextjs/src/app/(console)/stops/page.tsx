import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { NewStop } from "./NewStop";
import { StopRow } from "./StopRow";

type Stop = components["schemas"]["StopOut"];

export const dynamic = "force-dynamic";

export default async function StopsPage() {
  let stops: Stop[];
  try {
    stops = await apiCall((api) => api.GET("/fleet/stops", {}));
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  return (
    <>
      <header className="topbar">
        <h1>Stops</h1>
        <span className="who">Administrator</span>
      </header>

      <main>
        <div className="page-head">
          <h2>Stop registry</h2>
          <p className="sub">
            Every route is built from these. A stop lives here once, so six
            routes through Farmgate all agree where it is.
          </p>
        </div>

        <section className="card">
          <div className="card-head">
            <span>All stops</span>
            <NewStop />
          </div>

          {stops.length === 0 ? (
            <p className="empty">No stops yet. Routes need these before they can be drawn.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Name</th>
                    <th scope="col">Latitude</th>
                    <th scope="col">Longitude</th>
                    <th scope="col" className="actions">
                      Action
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {stops.map((stop) => (
                    <StopRow key={stop.id} stop={stop} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <p className="footnote">
          A stop cannot be deleted while a route uses it — remove it from the
          route first, on the route&rsquo;s own page.
        </p>
      </main>
    </>
  );
}
