"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function NavLink({
  href,
  label,
  icon,
}: {
  href: string;
  label: string;
  /// The glyph itself, not a name to look up, so the icon set stays a plain
  /// module the bundler can tree-shake.
  icon: ReactNode;
}) {
  const pathname = usePathname();
  const current = pathname === href || pathname.startsWith(`${href}/`);

  return (
    <Link
      href={href}
      aria-current={current ? "page" : undefined}
      className={cn(
        // min-h-16 keeps every tab past the 44px touch minimum even at five
        // across, where each one is only ~75px wide on a small phone.
        "flex min-h-16 flex-1 flex-col items-center justify-center gap-1 text-[11px] font-semibold",
        "[&_svg]:size-[22px]",
        // A heavier stroke on the current tab, so the selected one still reads
        // as selected to someone who cannot separate the two colours.
        current
          ? "text-primary [&_svg]:stroke-[2.4]"
          : "text-muted-foreground [&_svg]:stroke-2",
      )}
    >
      {icon}
      <span>{label}</span>
    </Link>
  );
}
