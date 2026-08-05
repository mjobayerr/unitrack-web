/**
 * Server-side access to the UniTrack API, with refresh handled once per call.
 *
 * Every read here runs on the server: the access token comes out of an
 * httpOnly cookie, is attached as a bearer header, and never reaches the
 * browser.
 *
 * On a 401 this refreshes once and retries. Exactly once — if the freshly
 * minted token is also rejected, the problem is not staleness and retrying
 * again would just loop.
 *
 * Refresh tokens rotate: the backend consumes the token it is given and
 * returns a new pair, so the replacement **must** be persisted or the next
 * refresh presents a dead token. Concurrent refreshes are safe because the
 * backend keeps a short grace window and hands every caller in it the same
 * pair, rather than treating the second one as a replay.
 */

import "server-only";

import { ApiError, createApiClient } from "@unitrack/api-client";

import {
  clearSession,
  readAccessToken,
  readRefreshToken,
  saveSession,
  type TokenPair,
} from "./session";

export const API_BASE_URL = process.env.UNITRACK_API_URL ?? "http://localhost:8000";

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
    this.name = "SessionExpiredError";
  }
}

type Client = ReturnType<typeof createApiClient>;

async function refreshSession(): Promise<string> {
  const refreshToken = await readRefreshToken();
  if (!refreshToken) throw new SessionExpiredError();

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  });

  if (!response.ok) {
    // Expired, revoked, replayed, or the account was suspended. None of these
    // recover by trying again, so drop the cookies and send the user to login.
    await clearSession();
    throw new SessionExpiredError();
  }

  const pair = (await response.json()) as TokenPair;
  await saveSession(pair);
  return pair.access_token;
}

/**
 * Run `call` with an authenticated client, refreshing once on a 401.
 *
 * Usage keeps the retry invisible to callers:
 *
 *     const helpers = await withApi((api) =>
 *       api.GET("/admin/helpers", { params: { query: { helper_status: "pending" } } }),
 *     );
 */
export async function withApi<T>(
  call: (client: Client) => Promise<T>,
): Promise<T> {
  const accessToken = await readAccessToken();

  try {
    return await call(createApiClient({ baseUrl: API_BASE_URL, accessToken }));
  } catch (error) {
    if (!(error instanceof ApiError) || !error.isUnauthorized) throw error;
    // A 403 deliberately does not come through here: the token is fine, the
    // role is wrong, and refreshing would change nothing.
    const fresh = await refreshSession();
    return call(createApiClient({ baseUrl: API_BASE_URL, accessToken: fresh }));
  }
}
