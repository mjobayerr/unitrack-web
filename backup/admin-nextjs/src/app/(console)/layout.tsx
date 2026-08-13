import type { ReactNode } from "react";

import { ThemeToggle } from "@unitrack/theme";

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
 * Console shell. Rail width and pill radius follow the reference (w-64, r16).
 *
 * The pending-helper count is fetched here so it shows from any page — the queue
 * is what an operator needs to notice without going looking. A failure is
 * swallowed: a missing badge is not worth taking down the console.
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
    <div className="grid min-h-dvh grid-cols-1 md:grid-cols-[16rem_1fr]">
      <aside className="flex min-w-0 flex-col gap-2 bg-sidebar pb-3 md:border-r md:border-sidebar-border">
        <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-4 font-bold tracking-tight text-white">
          <span
            aria-hidden="true"
            className="grid size-[30px] shrink-0 place-items-center rounded-[9px] bg-sidebar-primary text-xs font-extrabold"
          >
            UT
          </span>
          <span className="grid min-w-0 leading-tight">
            UniTrack
            <small className="text-[11px] font-medium text-sidebar-foreground/70">
              Admin console
            </small>
          </span>
        </div>

        {/* Two groups: what needs attention today, then what gets configured
            occasionally. Products first in the second group — an empty catalogue
            means nobody can buy a ticket at all. */}
        <nav className="flex min-w-0 flex-col gap-0.5 px-3">
          <p className="mt-1 mb-1 px-3 text-[10.5px] font-bold tracking-[0.08em] text-sidebar-foreground uppercase">
            Operations
          </p>
          <NavLink href="/fleet" label="Live fleet" icon={<FleetIcon />} />
          <NavLink href="/helpers" label="Helpers" icon={<HelpersIcon />} count={pending} />
          <NavLink href="/alerts" label="Alerts" icon={<AlertsIcon />} />
          <p className="mt-3 mb-1 px-3 text-[10.5px] font-bold tracking-[0.08em] text-sidebar-foreground uppercase">
            Configuration
          </p>
          <NavLink href="/products" label="Products" icon={<ProductsIcon />} />
          <NavLink href="/routes" label="Routes" icon={<RoutesIcon />} />
          <NavLink href="/stops" label="Stops" icon={<StopsIcon />} />
        </nav>

        <div className="mt-auto px-3 pt-3">
          <ThemeToggle className="w-full gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-white/[0.07] hover:text-white [&_svg]:size-[18px]" />
          <form action={logout}>
            <button
              type="submit"
              className="mt-1 flex min-h-9 w-full items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium text-sidebar-foreground hover:bg-white/[0.07] hover:text-white [&_svg]:size-[18px]"
            >
              <SignOutIcon />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <div className="min-w-0">{children}</div>
    </div>
  );
}
