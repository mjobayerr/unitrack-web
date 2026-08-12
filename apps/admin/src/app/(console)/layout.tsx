import type { ReactNode } from "react";

import { apiCall } from "../../lib/api";
import { logout } from "../login/actions";
import {
  AlertsIcon,
  FleetIcon,
  HelpersIcon,
  ProductsIcon,
  RoutesIcon,
  SignOutIcon,
  StopsIcon,
} from "./icons";
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
          <span className="brand-text">
            UniTrack
            <small>Admin console</small>
          </span>
        </div>

        {/* Two groups: what needs attention today, then what gets configured
            occasionally. Products first in the second group — an empty
            catalogue means nobody can buy a ticket at all. */}
        <nav className="nav-links">
          <p className="nav-group" aria-hidden="true">
            Operations
          </p>
          {/* First: it is the only page that shows what is happening right now. */}
          <NavLink href="/fleet" label="Live fleet" icon={<FleetIcon />} />
          <NavLink
            href="/helpers"
            label="Helpers"
            icon={<HelpersIcon />}
            count={pending}
          />
          <NavLink href="/alerts" label="Alerts" icon={<AlertsIcon />} />
          <p className="nav-group" aria-hidden="true">
            Configuration
          </p>
          <NavLink href="/products" label="Products" icon={<ProductsIcon />} />
          <NavLink href="/routes" label="Routes" icon={<RoutesIcon />} />
          <NavLink href="/stops" label="Stops" icon={<StopsIcon />} />
        </nav>

        <form action={logout}>
          <button className="ghost-light" type="submit">
            <SignOutIcon />
            Sign out
          </button>
        </form>
      </aside>

      <div className="content">{children}</div>
    </div>
  );
}
