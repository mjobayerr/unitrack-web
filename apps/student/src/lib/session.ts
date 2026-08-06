/**
 * Reading and writing the admin session, for Server Actions and Route Handlers.
 *
 * The tokens live in httpOnly cookies, so page scripts cannot read them: an XSS
 * bug on this site cannot exfiltrate a session that can approve helpers and
 * suspend accounts. The browser never sends a bearer token anywhere — it talks
 * to this Next.js app, and this app talks to FastAPI.
 *
 * Note that `saveSession` only works where Next.js permits cookie writes: a
 * Server Action or Route Handler, never during a Server Component render.
 * Refresh-on-expiry therefore lives in `middleware.ts`, not here.
 */

import { cookies } from "next/headers";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE_S,
  cookieOptions,
  type TokenPair,
} from "./cookies";

export type { TokenPair };

export async function saveSession(pair: TokenPair): Promise<void> {
  const jar = await cookies();
  // The access cookie is given the token's own lifetime, so once it expires no
  // cookie is presented at all. Middleware treats that absence as the signal to
  // refresh, which avoids decoding the JWT just to read `exp`.
  jar.set(ACCESS_COOKIE, pair.access_token, cookieOptions(pair.expires_in));
  jar.set(REFRESH_COOKIE, pair.refresh_token, cookieOptions(REFRESH_MAX_AGE_S));
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS_COOKIE);
  jar.delete(REFRESH_COOKIE);
}

export async function readAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS_COOKIE)?.value;
}

export async function readRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH_COOKIE)?.value;
}
