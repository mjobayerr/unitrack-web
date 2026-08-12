import type { ReactNode } from "react";

import { logout } from "../login/actions";
import { BusIcon, BuyIcon, TicketIcon } from "./icons";
import { NavLink } from "./NavLink";

export const dynamic = "force-dynamic";

/// Shell for the signed-in student.
///
/// Bottom navigation rather than a sidebar: this is used one-handed, on a phone,
/// often while standing on a moving bus. The three destinations are the only
/// three things a student does — show a ticket, buy one, and find their bus.
///
/// The header is a deep-blue band, and the page's first card is pulled up over
/// its lower edge. That overlap is the design's signature (see the reference in
/// `design/figma-reference`) and it earns its keep on a phone: it puts the thing
/// the student came for above the fold while the band still carries the brand and
/// the sign-out control. The decorative circles are drawn in CSS rather than
/// shipped as an image — three gradients cost nothing and cannot fail to load.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="phone-shell">
      <header className="topbar">
        <div className="topbar-row">
          <span className="wordmark">
            <span className="wordmark-badge" aria-hidden="true">
              UT
            </span>
            UniTrack
          </span>
          <form action={logout}>
            <button className="ghost" type="submit">
              Sign out
            </button>
          </form>
        </div>
      </header>

      <div className="phone-content">{children}</div>

      <nav className="tabbar">
        <NavLink href="/wallet" label="Tickets" icon={<TicketIcon />} />
        <NavLink href="/shop" label="Buy" icon={<BuyIcon />} />
        <NavLink href="/map" label="Buses" icon={<BusIcon />} />
      </nav>
    </div>
  );
}
