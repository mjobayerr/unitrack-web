import type { ReactNode } from "react";

import { logout } from "../login/actions";
import { NavLink } from "./NavLink";

export const dynamic = "force-dynamic";

/// Shell for the signed-in student.
///
/// Bottom navigation rather than a sidebar: this is used one-handed, on a
/// phone, often while standing on a moving bus. The two destinations are the
/// only two things a student does — show a ticket, and find their bus.
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="phone-shell">
      <header className="topbar">
        <h1>UniTrack</h1>
        <form action={logout}>
          <button className="secondary" type="submit">
            Sign out
          </button>
        </form>
      </header>

      <div className="phone-content">{children}</div>

      <nav className="tabbar">
        <NavLink href="/wallet" label="Tickets" icon="🎫" />
        <NavLink href="/shop" label="Buy" icon="🛒" />
        <NavLink href="/map" label="Buses" icon="🚌" />
      </nav>
    </div>
  );
}
