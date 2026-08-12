"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

export function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  /// The glyph itself, not a name to look up. Passing the element keeps the icon
  /// set a plain module the bundler can tree-shake, with no registry to keep in
  /// step with the routes.
  icon: ReactNode;
}) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link href={href} aria-current={current ? "page" : undefined}>
      {icon}
      <span>{label}</span>
    </Link>
  );
}
