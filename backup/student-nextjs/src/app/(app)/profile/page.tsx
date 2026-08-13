import { GraduationCap, IdCard, LogOut, Mail, Phone, Users } from "lucide-react";
import { redirect } from "next/navigation";
import type { ReactNode } from "react";

import { ThemeToggle } from "@unitrack/theme";
import type { components } from "@unitrack/api-client";

import { Card } from "@/components/ui/card";
import { UNIVERSITY, initialsOf } from "@/lib/demo";

import { SessionExpiredError, apiCall } from "../../../lib/api";
import { logout } from "../../login/actions";
import { ScreenHeader } from "../ScreenHeader";

type Me = components["schemas"]["MeOut"];

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  let me: Me;
  try {
    me = await apiCall((api) => api.GET("/auth/me", {}));
  } catch (error) {
    if (error instanceof SessionExpiredError) redirect("/login");
    throw error;
  }

  const s = me.student;

  return (
    <main>
      <ScreenHeader title="Profile" className="pb-7">
        <div className="mt-5 flex items-center gap-4">
          <span
            aria-hidden="true"
            className="grid size-16 shrink-0 place-items-center rounded-full bg-vibrant-green text-xl font-bold text-white"
          >
            {initialsOf(me.name)}
          </span>
          <div className="min-w-0">
            <div className="truncate text-xl font-bold tracking-tight">{me.name}</div>
            <div className="truncate text-[15px] text-white/80 capitalize">{me.role}</div>
            {s ? (
              <span className="mt-1.5 inline-block rounded-md bg-vibrant-green/25 px-2 py-0.5 text-xs font-semibold text-white">
                {s.student_id_no}
              </span>
            ) : null}
          </div>
        </div>

        {s ? (
          <div className="mt-5 grid grid-cols-3 gap-2.5">
            <Stat value={s.department ?? "—"} label="Department" />
            <Stat value={s.batch ?? "—"} label="Batch" />
            <Stat value={me.status === "active" ? "Active" : me.status} label="Status" />
          </div>
        ) : null}
      </ScreenHeader>

      <div className="px-4 pt-4">
        <Card className="gap-0 overflow-hidden rounded-2xl py-0">
          <h2 className="px-4 pt-4 pb-2 text-xs font-bold tracking-[0.08em] text-primary uppercase">
            Student information
          </h2>
          <dl>
            <Row icon={<GraduationCap />} label="University" value={UNIVERSITY} />
            {s ? (
              <>
                <Row icon={<IdCard />} label="Student ID" value={s.student_id_no} />
                <Row icon={<GraduationCap />} label="Department" value={s.department ?? "Not set"} />
                <Row icon={<Users />} label="Batch" value={s.batch ?? "Not set"} />
              </>
            ) : null}
            <Row icon={<Mail />} label="Email" value={me.email} />
            <Row icon={<Phone />} label="Phone" value={me.phone ?? "Not provided"} last />
          </dl>
        </Card>

        <div className="mt-4 flex justify-center">
          <ThemeToggle className="h-10 gap-2 rounded-full border border-border bg-card px-4 text-[13px] font-semibold" />
        </div>

        <p className="mt-4 text-center text-[13px] text-muted-foreground">
          UniTrack BD v1.0.0 · ULAB Campus
        </p>

        <form action={logout} className="mt-3">
          <button
            type="submit"
            className="flex min-h-[52px] w-full items-center justify-center gap-2 rounded-2xl bg-destructive/10 text-[15px] font-semibold text-destructive hover:bg-destructive/15"
          >
            <LogOut className="size-5" />
            Logout
          </button>
        </form>
      </div>
    </main>
  );
}

function Stat({ value, label }: { value: string; label: string }) {
  return (
    <div className="rounded-xl bg-white/15 px-2 py-3 text-center">
      <div className="truncate text-[15px] font-bold capitalize">{value}</div>
      <div className="text-[11px] text-white/70">{label}</div>
    </div>
  );
}

function Row({
  icon,
  label,
  value,
  last,
}: {
  icon: ReactNode;
  label: string;
  value: string;
  /// Suppresses the divider, so the card does not end on a hairline.
  last?: boolean;
}) {
  return (
    <div className={`flex items-start gap-3 px-4 py-3.5 ${last ? "" : "border-b border-border"}`}>
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-primary/10 text-primary [&_svg]:size-[18px]"
      >
        {icon}
      </span>
      <div className="min-w-0">
        <dt className="text-[13px] text-muted-foreground">{label}</dt>
        <dd className="text-[15px] font-medium break-words">{value}</dd>
      </div>
    </div>
  );
}
