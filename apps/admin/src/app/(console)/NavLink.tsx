"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

/** Sidebar link that marks itself current, with an optional queue badge. */
export function NavLink({
  href,
  label,
  icon,
  count,
}: {
  href: string;
  label: string;
  /// The glyph element rather than a name to look up, so the icon set stays a
  /// plain module with nothing to keep in step with the route list.
  icon?: ReactNode;
  count?: number;
}) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} aria-current={current ? "page" : undefined}>
      {icon}
      <span className="nav-label">{label}</span>
      {count ? <span className="nav-count">{count}</span> : null}
    </Link>
  );
}
