import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

/**
 * The navy band every screen except Track opens with.
 *
 * The decoration is two CSS circles rather than an image: there is no asset that
 * can fail to load, and it costs nothing on a phone connection.
 *
 * `back` takes an href, not a history pop. A student who lands on `/qr` from a
 * shared link or a cold start has no history to go back to, and a dead arrow in
 * the corner is worse than one that always goes somewhere sensible.
 */
export function ScreenHeader({
  title,
  subtitle,
  back,
  className,
  children,
}: {
  title: string;
  subtitle?: string;
  back?: string;
  className?: string;
  children?: ReactNode;
}) {
  return (
    <header
      className={cn(
        "relative overflow-hidden bg-deep-blue px-4 pt-6 pb-6 text-white",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -top-14 -right-12 size-44 rounded-full bg-white/10"
      />
      <span
        aria-hidden="true"
        className="pointer-events-none absolute -right-4 bottom-8 size-24 rounded-full bg-white/[0.07]"
      />

      <div className="relative flex items-center gap-3">
        {back ? (
          <Link
            href={back}
            aria-label="Back"
            className="grid size-10 shrink-0 place-items-center rounded-full bg-white/15 text-white hover:bg-white/25"
          >
            <ArrowLeft className="size-5" />
          </Link>
        ) : null}

        <div className="min-w-0">
          <h1 className="truncate text-xl font-bold tracking-tight">{title}</h1>
          {subtitle ? <p className="text-[13px] text-white/70">{subtitle}</p> : null}
        </div>
      </div>

      {children ? <div className="relative">{children}</div> : null}
    </header>
  );
}
