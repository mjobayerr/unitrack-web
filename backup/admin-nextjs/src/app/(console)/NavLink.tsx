"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/** Rail link that marks itself current, with an optional queue badge. */
export function NavLink({
  href,
  label,
  icon,
  count,
}: {
  href: string;
  label: string;
  icon?: ReactNode;
  count?: number;
}) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        "flex min-h-9 items-center gap-3 rounded-2xl px-3 py-2 text-sm font-medium transition-colors",
        "[&_svg]:size-[18px] [&_svg]:shrink-0",
        current
          ? "bg-sidebar-primary text-sidebar-primary-foreground font-semibold"
          : "text-sidebar-foreground hover:bg-white/[0.07] hover:text-white",
      )}
    >
      {icon}
      <span className="min-w-0 flex-1 truncate">{label}</span>
      {count ? (
        <span className="min-w-5 rounded-full bg-warning px-1.5 text-center text-[11px] font-bold text-warning-foreground">
          {count}
        </span>
      ) : null}
    </Link>
  );
}
