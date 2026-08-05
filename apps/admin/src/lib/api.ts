/**
 * Server-side access to the UniTrack API.
 *
 * Every call runs on the server: the access token comes out of an httpOnly
 * cookie, goes out as a bearer header, and never reaches the browser.
 *
 * Refreshing does **not** happen here. Two reasons, both load-bearing:
 *
 * 1. Next.js forbids writing cookies during a Server Component render, so a
 *    refresh triggered mid-render could not persist the new pair anyway.
 * 2. `middleware.ts` runs before the render and can set cookies on the
 *    response, which is the only place the token swap can actually stick.
 *
 * So by the time a page runs, the token is either fresh or the session is
 * genuinely over. A 401 here means the latter, and the caller redirects.
 */

import "server-only";

import { createApiClient } from "@unitrack/api-client";

import { readAccessToken } from "./session";

export const API_BASE_URL = process.env.UNITRACK_API_URL ?? "http://localhost:8000";

export class SessionExpiredError extends Error {
  constructor() {
    super("Session expired");
    this.name = "SessionExpiredError";
  }
}

/** Any non-2xx that is not an expired session. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly detail: unknown,
  ) {
    super(`UniTrack API responded ${status}`);
    this.name = "ApiError";
  }

  /** Authenticated but not permitted. Distinct from 401 on purpose — the
   * backend separates them, and refreshing a token would not help. */
  get isForbidden(): boolean {
    return this.status === 403;
  }
}

type Client = ReturnType<typeof createApiClient>;

interface FetchResult<T> {
  data?: T;
  error?: unknown;
  response: Response;
}

/**
 * Run an API call and return its payload, throwing on failure.
 *
 * openapi-fetch reports failures on `result.error` rather than throwing, which
 * is easy to forget at a call site — miss it and a 403 renders as an empty
 * table instead of an error. Funnelling every call through here makes that
 * impossible.
 *
 *     const helpers = await apiCall((api) => api.GET("/admin/helpers", {}));
 *
 * Endpoints returning 204 have no body; `T` is `undefined` for those and the
 * `response.ok` check keeps them from being mistaken for failures.
 */
export async function apiCall<T>(
  call: (client: Client) => Promise<FetchResult<T>>,
): Promise<T> {
  const accessToken = await readAccessToken();
  const result = await call(createApiClient({ baseUrl: API_BASE_URL, accessToken }));

  if (result.response.status === 401) throw new SessionExpiredError();
  if (!result.response.ok) throw new ApiError(result.response.status, result.error);

  return result.data as T;
}
