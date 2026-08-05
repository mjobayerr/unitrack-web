"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

/** Sidebar link that marks itself current, with an optional queue badge. */
export function NavLink({
  href,
  label,
  count,
}: {
  href: string;
  label: string;
  count?: number;
}) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} aria-current={current ? "page" : undefined}>
      <span>{label}</span>
      {count ? <span className="nav-count">{count}</span> : null}
    </Link>
  );
}
