import { Bus, QrCode, ShoppingCart, WalletCards } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import type { components } from "@unitrack/api-client";

import { Card, CardContent } from "@/components/ui/card";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { ScreenHeader } from "../ScreenHeader";

type Ticket = components["schemas"]["TicketOut"];
type User = components["schemas"]["UserOut"];

export const dynamic = "force-dynamic";

/** Dhaka time-of-day, so the greeting matches the city the fleet runs in. */
function greeting(): string {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      timeZone: "Asia/Dhaka",
      hour: "numeric",
      hour12: false,
    }).format(new Date()),
  );
  if (hour < 12) return "Good morning";
  if (hour < 17) return "Good afternoon";
  return "Good evening";
}

/** First name only — a dashboard greeting is not a formal address. */
function firstName(name: string): string {
  return name.split(/\s+/)[0] || name;
}

export default async function HomePage() {
  let me: User;
  let tickets: Ticket[];
  try {
    [me, tickets] = await Promise.all([
      apiCall((api) => api.GET("/auth/me", {})),
      apiCall((api) => api.GET("/shop/tickets", {})),
    ]);
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  const active = tickets.filter((t) => t.status === "active");
  const hasUnlimited = active.some((t) => t.rides_remaining === null);
  const ridesLeft = active.reduce((sum, t) => sum + (t.rides_remaining ?? 0), 0);

  return (
    <main>
      <ScreenHeader title={`${greeting()},`} subtitle={firstName(me.name)} className="pb-9">
        {/* The one card pulled over the band edge, matching the reference. */}
      </ScreenHeader>

      <div className="-mt-6 px-4">
        <Card className="rounded-2xl">
          <CardContent className="px-5">
            <div className="flex items-center justify-between gap-3">
              <div>
                <div className="text-[13px] text-muted-foreground">Rides remaining</div>
                <div className="text-3xl font-bold tracking-tight">
                  {active.length === 0 ? "0" : hasUnlimited ? "∞" : ridesLeft}
                </div>
                <div className="text-[13px] text-muted-foreground">
                  {active.length} active {active.length === 1 ? "ticket" : "tickets"}
                </div>
              </div>
              {active.length > 0 ? (
                <Link
                  href="/qr"
                  className="flex min-h-[46px] items-center gap-2 rounded-xl bg-primary px-4 font-semibold text-primary-foreground hover:bg-primary/90"
                >
                  <QrCode className="size-5" />
                  Show QR
                </Link>
              ) : (
                <Link
                  href="/shop"
                  className="flex min-h-[46px] items-center gap-2 rounded-xl bg-vibrant-green px-4 font-semibold text-white hover:bg-vibrant-green/90"
                >
                  <ShoppingCart className="size-5" />
                  Buy
                </Link>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-2 gap-3 px-4 pt-4">
        <Action href="/track" icon={<Bus />} title="Track buses" hint="Live map & ETA" />
        <Action href="/qr" icon={<QrCode />} title="QR Pay" hint="Board with a code" />
        <Action href="/wallet" icon={<WalletCards />} title="My wallet" hint="Rides & history" />
        <Action href="/shop" icon={<ShoppingCart />} title="Buy a ticket" hint="Single & passes" />
      </div>
    </main>
  );
}

function Action({
  href,
  icon,
  title,
  hint,
}: {
  href: string;
  icon: ReactNode;
  title: string;
  hint: string;
}) {
  return (
    <Link href={href}>
      <Card className="h-full rounded-2xl transition-colors hover:bg-accent">
        <CardContent className="px-4">
          <span
            aria-hidden="true"
            className="grid size-11 place-items-center rounded-xl bg-primary/10 text-primary [&_svg]:size-6"
          >
            {icon}
          </span>
          <div className="mt-3 font-semibold">{title}</div>
          <div className="text-[13px] text-muted-foreground">{hint}</div>
        </CardContent>
      </Card>
    </Link>
  );
}
