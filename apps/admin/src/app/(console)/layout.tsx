import type { ReactNode } from "react";

import { apiCall } from "../../lib/api";
import { logout } from "../login/actions";
import { NavLink } from "./NavLink";

export const dynamic = "force-dynamic";

/**
 * Shell for every signed-in page.
 *
 * The pending-helper count is fetched here rather than on the helpers page so
 * it shows in the sidebar from anywhere — the queue is the thing an operator
 * needs to notice without going looking for it. A failure is swallowed: a
 * missing badge is not worth taking down the whole console.
 */
async function pendingHelperCount(): Promise<number> {
  try {
    const helpers = await apiCall((api) =>
      api.GET("/admin/helpers", { params: { query: { helper_status: "pending" } } }),
    );
    return helpers?.length ?? 0;
  } catch {
    return 0;
  }
}

export default async function ConsoleLayout({ children }: { children: ReactNode }) {
  const pending = await pendingHelperCount();

  return (
    <div className="shell">
      <aside className="sidebar">
        <div className="brand">
          <span className="dot" aria-hidden="true">
            UT
          </span>
          UniTrack
        </div>

        <nav className="nav-links">
          <NavLink href="/helpers" label="Helpers" count={pending} />
          <NavLink href="/alerts" label="Alerts" />
        </nav>

        <form action={logout}>
          <button className="ghost-light" type="submit">
            Sign out
          </button>
        </form>
      </aside>

      <div className="content">{children}</div>
    </div>
  );
}
