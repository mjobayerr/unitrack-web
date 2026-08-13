/**
 * Typed access to the UniTrack API from the browser.
 *
 * `paths`/`components` are generated from the backend's own `openapi.json`
 * (`schema.d.ts`) — never hand-written — so a backend shape change becomes a
 * TypeScript error at the call site instead of a 422 found in staging.
 *
 * Every call goes through `apiCall`, which:
 *   1. attaches the current in-memory access token,
 *   2. on a 401, transparently refreshes the token once and retries,
 *   3. throws `ApiError` on any remaining non-2xx, so screens use try/catch
 *      instead of forgetting to check `.error` at every site.
 */

import createClient from "openapi-fetch";

import { API_BASE_URL } from "./config";
import type { components, paths } from "./schema";
import { clearSession, getAccessToken, getRefreshToken, setSession } from "./tokens";

export type { components, paths };
type TokenPair = components["schemas"]["TokenPair"];

export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly detail: unknown,
  ) {
    super(`UniTrack API responded ${status}`);
    this.name = "ApiError";
  }

  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Authenticated but not permitted — refreshing the token will not help; the
   * backend separates 401 and 403 on purpose. */
  get isForbidden(): boolean {
    return this.status === 403;
  }

  /** FastAPI's `detail` string when it sent one, for screens that show it. */
  get detailMessage(): string | null {
    const d = this.detail as { detail?: unknown } | undefined;
    return d && typeof d.detail === "string" ? d.detail : null;
  }
}

type Client = ReturnType<typeof createClient<paths>>;
type Result<T> = { data?: T; error?: unknown; response: Response };

function client(token: string | null): Client {
  return createClient<paths>({
    baseUrl: API_BASE_URL,
    headers: token ? { Authorization: `Bearer ${token}` } : {},
  });
}

// One refresh at a time: a screen firing three requests that all 401 at once
// must not send three refreshes and rotate the token out from under itself.
let refreshInFlight: Promise<boolean> | null = null;

async function doRefresh(refreshToken: string): Promise<boolean> {
  try {
    const res = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ refresh_token: refreshToken }),
    });
    if (!res.ok) {
      clearSession();
      return false;
    }
    setSession((await res.json()) as TokenPair);
    return true;
  } catch {
    // Network error, not an auth failure — keep the refresh token and let the
    // caller surface the error; the session may still be good on retry.
    return false;
  }
}

/** Mint a fresh access token from the stored refresh token. Deduplicated. */
export async function refreshSession(): Promise<boolean> {
  if (refreshInFlight) return refreshInFlight;
  const rt = getRefreshToken();
  if (!rt) return false;
  refreshInFlight = doRefresh(rt).finally(() => {
    refreshInFlight = null;
  });
  return refreshInFlight;
}

/**
 * Run one API call, refreshing-and-retrying once on a 401.
 *
 *     const me = await apiCall((api) => api.GET("/auth/me", {}));
 *     const order = await apiCall((api) =>
 *       api.POST("/shop/orders", { body: { product_id, idempotency_key } }));
 */
export async function apiCall<T>(call: (api: Client) => Promise<Result<T>>): Promise<T> {
  let result = await call(client(getAccessToken()));

  if (result.response.status === 401 && getRefreshToken()) {
    if (await refreshSession()) {
      result = await call(client(getAccessToken()));
    }
  }

  if (result.response.status === 401) {
    clearSession();
    throw new ApiError(401, result.error);
  }
  if (!result.response.ok || result.data === undefined) {
    // 204s legitimately have no body; callers that expect one pass a T that
    // allows undefined. Everything else with no data is a failure.
    if (result.response.ok) return undefined as T;
    throw new ApiError(result.response.status, result.error);
  }
  return result.data;
}
