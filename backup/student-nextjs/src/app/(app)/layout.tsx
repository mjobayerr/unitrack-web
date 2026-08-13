import { House, Map, QrCode, User, WalletCards } from "lucide-react";
import type { ReactNode } from "react";

import { NavLink } from "./NavLink";

export const dynamic = "force-dynamic";

/**
 * Signed-in student shell.
 *
 * Phone-first: a 430px cap so the app keeps its shape on a desktop browser, and
 * a fixed five-tab bar. The shell deliberately draws **no** header — the screens
 * differ too much for a shared one. Track is a full-bleed map with no band at
 * all, Wallet's band carries the balance, Profile's carries an avatar and three
 * stat tiles. Each screen renders its own via `ScreenHeader`.
 */
export default function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="mx-auto flex min-h-dvh w-full max-w-[430px] flex-col bg-background">
      {/* pb clears the fixed tab bar, plus the iOS home indicator under it. */}
      <div className="flex-1 pb-[calc(5rem+env(safe-area-inset-bottom))]">{children}</div>

      <nav className="fixed inset-x-0 bottom-0 z-30 mx-auto flex max-w-[430px] border-t border-border bg-card pb-[env(safe-area-inset-bottom)] shadow-[0_-2px_12px_rgba(15,23,42,0.08)]">
        <NavLink href="/home" label="Home" icon={<House />} />
        <NavLink href="/track" label="Track" icon={<Map />} />
        <NavLink href="/wallet" label="Wallet" icon={<WalletCards />} />
        <NavLink href="/qr" label="QR Pay" icon={<QrCode />} />
        <NavLink href="/profile" label="Profile" icon={<User />} />
      </nav>
    </div>
  );
}
