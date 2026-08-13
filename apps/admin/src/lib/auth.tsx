/**
 * Admin authentication. Same backend endpoints as the student app, with one
 * extra rule: the account must have the **admin** role. `/auth/login` will
 * happily issue tokens for a student, so this checks `/auth/me` and refuses a
 * non-admin — the console must not open for the wrong role even with valid
 * credentials. There is no self-registration; admins are seeded or invited.
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

import { apiCall, type components } from "./api";
import { clearSession, getRefreshToken, hasRefreshToken, setSession } from "./tokens";
import { refreshSession } from "./api";

type MeOut = components["schemas"]["MeOut"];
type TokenPair = components["schemas"]["TokenPair"];

export class NotAdminError extends Error {
  constructor() {
    super("This account is not an administrator.");
    this.name = "NotAdminError";
  }
}

type Status = "loading" | "authed" | "anon";

interface AuthContextValue {
  status: Status;
  user: MeOut | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

async function fetchMe(): Promise<MeOut> {
  return apiCall((api) => api.GET("/auth/me", {}));
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<Status>("loading");
  const [user, setUser] = useState<MeOut | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!hasRefreshToken() || !(await refreshSession())) {
        if (!cancelled) setStatus("anon");
        return;
      }
      try {
        const me = await fetchMe();
        if (cancelled) return;
        if (me.role !== "admin") {
          clearSession();
          setStatus("anon");
          return;
        }
        setUser(me);
        setStatus("authed");
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
    const me = await fetchMe();
    if (me.role !== "admin") {
      // Valid credentials, wrong role. Revoke what we just minted and refuse.
      clearSession();
      throw new NotAdminError();
    }
    setUser(me);
    setStatus("authed");
  }, []);

  const logout = useCallback(async () => {
    const refresh_token = getRefreshToken();
    try {
      await apiCall((api) => api.POST("/auth/logout", { body: { refresh_token } }));
    } catch {
      /* revoke best-effort; local state clears regardless */
    }
    clearSession();
    setUser(null);
    setStatus("anon");
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ status, user, login, logout }),
    [status, user, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>");
  return ctx;
}
