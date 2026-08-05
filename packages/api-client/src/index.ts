/**
 * Typed client for the UniTrack API.
 *
 * Types come from `schema.d.ts`, generated out of the backend's own
 * `openapi.json` — never hand-written. When the backend changes shape,
 * regenerate and the type errors show every call site that needs attention.
 * That is the entire point of the contract: drift becomes a failed build
 * instead of a 422 someone finds in staging.
 *
 * This module is **server-only**. Tokens are held in httpOnly cookies that the
 * browser cannot read, so every call goes through the admin app's route
 * handlers. Importing this into a client component would mean shipping a
 * bearer token to the browser, which is the thing the architecture exists to
 * prevent.
 */

import createClient from "openapi-fetch";

import type { paths } from "./schema.js";

export type { paths };
export type { components } from "./schema.js";

/** Thrown for any non-2xx response, carrying enough to branch on. */
export class ApiError extends Error {
  constructor(
    readonly status: number,
    readonly detail: unknown,
  ) {
    super(`UniTrack API responded ${status}`);
    this.name = "ApiError";
  }

  /** The caller's access token is missing, expired, or revoked. */
  get isUnauthorized(): boolean {
    return this.status === 401;
  }

  /** Authenticated, but the role or helper status is wrong. Refreshing a
   * token will not help — the backend distinguishes these deliberately. */
  get isForbidden(): boolean {
    return this.status === 403;
  }
}

export interface ClientOptions {
  /** Base URL of the FastAPI service, e.g. http://localhost:8000 */
  baseUrl: string;
  /** Access token to send as `Authorization: Bearer …`, when there is one. */
  accessToken?: string;
}

export function createApiClient({ baseUrl, accessToken }: ClientOptions) {
  return createClient<paths>({
    baseUrl,
    headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
  });
}

/** Narrow an openapi-fetch result, throwing `ApiError` so callers can use
 * try/catch rather than checking `.error` at every site. */
export function unwrap<T>(result: {
  data?: T;
  error?: unknown;
  response: Response;
}): T {
  if (result.error !== undefined || result.data === undefined) {
    throw new ApiError(result.response.status, result.error);
  }
  return result.data;
}
