/** Admin route guards. RequireAdmin keeps the console behind a valid admin
 * session; RedirectIfAuthed keeps a signed-in admin off the login screen. Both
 * wait out the boot `loading` state so a reload does not flash the login screen
 * before the refresh-token bootstrap runs. Dark, to match the console. */

import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { Bus } from "lucide-react";

import { useAuth } from "./auth";

function BootSplash() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[#0F172A] text-slate-300 gap-4">
      <div className="w-14 h-14 rounded-2xl bg-[#1A3C8F] flex items-center justify-center animate-pulse">
        <Bus className="w-7 h-7 text-white" />
      </div>
      <p className="text-slate-500 text-sm">Loading console…</p>
    </div>
  );
}

export function RequireAdmin({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === "loading") return <BootSplash />;
  if (status === "anon") return <Navigate to="/login" replace />;
  return <>{children}</>;
}

export function RedirectIfAuthed({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  if (status === "loading") return <BootSplash />;
  if (status === "authed") return <Navigate to="/" replace />;
  return <>{children}</>;
}
