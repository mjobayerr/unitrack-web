import { redirect } from "next/navigation";

import type { components } from "@unitrack/api-client";

import { SessionExpiredError, withApi } from "../../lib/api";
import { logout } from "../login/actions";
import { HelperRow } from "./HelperRow";

type Helper = components["schemas"]["HelperOut"];

export const dynamic = "force-dynamic";

async function loadHelpers(): Promise<Helper[]> {
  const result = await withApi((api) => api.GET("/admin/helpers", {}));
  // openapi-fetch reports failures on `.error` rather than throwing, so an
  // unwrapped read here would silently render an empty table on a 403.
  if (result.error !== undefined || result.data === undefined) {
    throw new Error(`Could not load helpers (HTTP ${result.response.status})`);
  }
  return result.data;
}

export default async function HelpersPage() {
  let helpers: Helper[];
  try {
    helpers = await loadHelpers();
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  // Pending first: this page exists to clear that queue, and an approved
  // helper is not something anyone came here to look at.
  const ordered = [...helpers].sort((a, b) =>
    a.helper_status === b.helper_status
      ? a.name.localeCompare(b.name)
      : a.helper_status === "pending"
        ? -1
        : 1,
  );
  const pending = ordered.filter((h) => h.helper_status === "pending").length;

  return (
    <>
      <nav>
        <div>
          <strong>UniTrack Admin</strong>
          <a href="/helpers">Helpers</a>
          <span className="spacer" />
          <form action={logout}>
            <button className="secondary" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </nav>

      <main>
        <h1>Helpers</h1>
        <p className="sub">
          {pending === 0
            ? "No helpers are waiting for approval."
            : `${pending} helper${pending === 1 ? "" : "s"} waiting for approval.`}
        </p>

        {ordered.length === 0 ? (
          <p className="empty">No helper accounts yet.</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Helper</th>
                <th>Account</th>
                <th />
              </tr>
            </thead>
            <tbody>
              {ordered.map((helper) => (
                <HelperRow key={helper.helper_id} helper={helper} />
              ))}
            </tbody>
          </table>
        )}
      </main>
    </>
  );
}
