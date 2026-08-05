import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { HelperRow } from "./HelperRow";

type Helper = components["schemas"]["HelperOut"];

export const dynamic = "force-dynamic";

export default async function HelpersPage() {
  let helpers: Helper[];
  try {
    helpers = await apiCall((api) => api.GET("/admin/helpers", {}));
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  // Pending first: clearing that queue is why this page exists, and an approved
  // helper is not what anyone came here to look at.
  const ordered = [...helpers].sort((a, b) =>
    a.helper_status === b.helper_status
      ? a.name.localeCompare(b.name)
      : a.helper_status === "pending"
        ? -1
        : 1,
  );

  const pending = ordered.filter((h) => h.helper_status === "pending").length;
  const approved = ordered.filter((h) => h.helper_status === "approved").length;
  const suspended = ordered.filter((h) => h.helper_status === "suspended").length;

  return (
    <>
      <header className="topbar">
        <h1>Helpers</h1>
        <span className="who">Administrator</span>
      </header>

      <main>
        <div className="page-head">
          <h2>Helper accounts</h2>
          <p className="sub">
            {pending === 0
              ? "Nothing waiting for approval."
              : `${pending} account${pending === 1 ? "" : "s"} waiting for approval.`}
          </p>
        </div>

        <section className="stats">
          <div className="stat">
            <div className="label">Awaiting approval</div>
            <div className={`value${pending ? " attention" : ""}`}>{pending}</div>
          </div>
          <div className="stat">
            <div className="label">Approved</div>
            <div className="value">{approved}</div>
          </div>
          <div className="stat">
            <div className="label">Suspended</div>
            <div className="value">{suspended}</div>
          </div>
          <div className="stat">
            <div className="label">Total</div>
            <div className="value">{ordered.length}</div>
          </div>
        </section>

        <section className="card">
          <div className="card-head">All helpers</div>

          {ordered.length === 0 ? (
            <p className="empty">No helper accounts yet.</p>
          ) : (
            <div className="table-wrap">
              <table>
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Phone</th>
                    <th>Helper</th>
                    <th>Account</th>
                    <th className="actions">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {ordered.map((helper) => (
                    <HelperRow key={helper.helper_id} helper={helper} />
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
