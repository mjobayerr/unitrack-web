import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { AlertRow } from "./AlertRow";

type Alert = components["schemas"]["AlertOut"];

export const dynamic = "force-dynamic";

const SEVERITY_ORDER = { critical: 0, warning: 1, info: 2 } as const;

/**
 * Everything still being worked on: open *and* acknowledged.
 *
 * `GET /admin/alerts` defaults to `open` only, so a single call would make an
 * alert vanish the moment someone claimed it — leaving no way to resolve it
 * from this page. Passing no status at all is the other extreme: it pulls in
 * resolved and dismissed history and buries the live ones. Two targeted calls
 * keep each an index scan over the status the backend has an index for.
 */
async function loadActiveAlerts(): Promise<Alert[]> {
  const [open, acknowledged] = await Promise.all([
    apiCall((api) => api.GET("/admin/alerts", { params: { query: { alert_status: "open" } } })),
    apiCall((api) =>
      api.GET("/admin/alerts", { params: { query: { alert_status: "acknowledged" } } }),
    ),
  ]);

  return [...open, ...acknowledged].sort(
    (a, b) =>
      SEVERITY_ORDER[a.severity] - SEVERITY_ORDER[b.severity] ||
      Date.parse(b.created_at) - Date.parse(a.created_at),
  );
}

export default async function AlertsPage() {
  let alerts: Alert[];
  try {
    alerts = await loadActiveAlerts();
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  const critical = alerts.filter((a) => a.severity === "critical").length;
  const open = alerts.filter((a) => a.status === "open").length;
  const acknowledged = alerts.filter((a) => a.status === "acknowledged").length;

  return (
    <>
      <header className="topbar">
        <h1>Alerts</h1>
        <span className="who">Administrator</span>
      </header>

      <main>
        <div className="page-head">
          <h2>Emergency console</h2>
          <p className="sub">
            {critical > 0
              ? critical === 1
                ? "1 critical alert needs attention."
                : `${critical} critical alerts need attention.`
              : open > 0
                ? `${open} alert${open === 1 ? "" : "s"} not yet claimed.`
                : "Nothing outstanding."}
          </p>
        </div>

        <section className="stats">
          <div className="stat">
            <div className="label">Critical</div>
            <div className={`value${critical ? " attention" : ""}`}>{critical}</div>
          </div>
          <div className="stat">
            <div className="label">Unclaimed</div>
            <div className={`value${open ? " attention" : ""}`}>{open}</div>
          </div>
          <div className="stat">
            <div className="label">Acknowledged</div>
            <div className="value">{acknowledged}</div>
          </div>
          <div className="stat">
            <div className="label">Active total</div>
            <div className="value">{alerts.length}</div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">Active alerts, most severe first</div>

          {alerts.length === 0 ? (
            <p className="empty">Nothing active. Every alert has been resolved.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th scope="col">Alert</th>
                    <th scope="col">Severity</th>
                    <th scope="col">Status</th>
                    <th scope="col">Raised</th>
                    <th scope="col" className="actions">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {alerts.map((alert) => (
                    <AlertRow key={alert.id} alert={alert} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </>
  );
}
