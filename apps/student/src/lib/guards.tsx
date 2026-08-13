/** Route guards: keep signed-out users out of the app shell, and signed-in
 * users off the login/signup screens. Both wait out the initial `loading`
 * state so a reload does not flash the login screen before the refresh-token
 * bootstrap has run. */

import type { ReactNode } from "react";
import { Navigate } from "react-router";
import { Bus } from "lucide-react";

import { useAuth } from "./auth";

function BootSplash() {
  return (
    <div className="min-h-screen max-w-[430px] mx-auto flex flex-col items-center justify-center bg-gradient-to-br from-[#1A3C8F] to-[#2d5bb7] text-white gap-4">
      <div className="w-16 h-16 rounded-2xl bg-white/20 flex items-center justify-center animate-pulse">
        <Bus className="w-8 h-8" />
      </div>
      <p className="text-white/80 text-sm">Loading…</p>
    </div>
  );
}

export function RequireAuth({ children }: { children: ReactNode }) {
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
