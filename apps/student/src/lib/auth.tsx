/**
 * Authentication state for the student app.
 *
 * Wraps the raw API in a small context: who is signed in (`user`), whether we
 * are still working that out (`status`), and the actions that change it. Screens
 * call `useAuth()` and never touch tokens directly.
 *
 * The login/register/logout logic mirrors the old server-action flow one-for-one
 * — same endpoints, same "register does not sign you in until the email link is
 * clicked" rule, same revoke-on-logout — moved to the client because this app
 * has no server to run it on.
 */

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { apiCall, refreshSession, type components } from "./api";
import { clearSession, getRefreshToken, hasRefreshToken, setSession } from "./tokens";

type MeOut = components["schemas"]["MeOut"];
type TokenPair = components["schemas"]["TokenPair"];

/** Kept in step with `ALLOWED_STUDENT_EMAIL_DOMAINS` on the backend. Duplicated,
 * not fetched: the API exposes no endpoint for it, and the server is the real
 * gate — this only lets a mistyped address fail before a round trip. */
export const ALLOWED_DOMAINS = ["ulab.edu.bd"];

export function domainOf(email: string): string {
  // Everything after the FINAL "@": splitting on the first reads a@b@evil.com
  // as "b", which is how a lookalike slips through.
  return email.trim().toLowerCase().split("@").pop() ?? "";
}

export interface StudentRegisterInput {
  email: string;
  password: string;
  name: string;
  student_id_no: string;
  phone?: string;
}

type Status = "loading" | "authed" | "anon";

interface AuthContextValue {
  status: Status;
  user: MeOut | null;
  login: (email: string, password: string) => Promise<void>;
  register: (input: StudentRegisterInput) => Promise<void>;
  resendVerification: (email: string) => Promise<void>;
  logout: () => Promise<void>;
  reloadMe: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<MeOut> {
  return apiCall((api) => api.GET("/auth/me", {}));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<MeOut | null>(null);

  const reloadMe = useCallback(async () => {
    const me = await fetchMe();
    setUser(me);
    setStatus("authed");
  }, []);

  // Boot: if a refresh token survived the last session, mint an access token
  // from it and load the profile. Any failure lands as a clean signed-out state.
  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!hasRefreshToken()) {
        if (!cancelled) setStatus("anon");
        return;
      }
      const ok = await refreshSession();
      if (!ok) {
        if (!cancelled) setStatus("anon");
        return;
      }
      try {
        const me = await fetchMe();
        if (!cancelled) {
          setUser(me);
          setStatus("authed");
        }
      } catch {
        clearSession();
        if (!cancelled) setStatus("anon");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    const pair = await apiCall<TokenPair>((api) =>
      api.POST("/auth/login", { body: { email, password } }),
    );
    setSession(pair);
    await reloadMe();
  }, [reloadMe]);

  const register = useCallback(async (input: StudentRegisterInput) => {
    // No session on success: the account exists but cannot be used until the
    // emailed link is clicked. The caller shows a "check your inbox" state.
    await apiCall((api) => api.POST("/auth/register/student", { body: input }));
  }, []);

  const resendVerification = useCallback(async (email: string) => {
    // Always resolves: the backend answers identically for an address that does
    // not exist, and surfacing a difference here rebuilds the enumeration oracle
    // it exists to prevent.
    try {
      await apiCall((api) => api.POST("/auth/resend-verification", { body: { email } }));
    } catch {
      /* swallow — a failed resend is not worth an error screen */
    }
  }, []);

  const logout = useCallback(async () => {
    const refresh_token = getRefreshToken();
    try {
      // Revoke both tokens server-side. Dropping local state alone would leave a
      // 30-day refresh token valid for anyone who had already copied it.
      await apiCall((api) => api.POST("/auth/logout", { body: { refresh_token } }));
    } catch {
      // A failed revoke must not strand the user in a session they asked to end.
    }
    clearSession();
    setUser(null);
    setStatus("anon");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, register, resendVerification, logout, reloadMe }),
    [status, user, login, register, resendVerification, logout, reloadMe],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
