/**
 * Where the admin session actually lives.
 *
 * The tokens sit in httpOnly cookies, so page scripts cannot read them: an XSS
 * bug on this site cannot exfiltrate a session that can approve helpers and
 * suspend accounts. The browser never sends a bearer token anywhere — it talks
 * to this Next.js app, and this app talks to FastAPI. That is the only reason
 * `@unitrack/api-client` is server-only.
 *
 * `sameSite: "lax"` is the CSRF control. Because the credential is a cookie
 * rather than a header, a form on another origin could otherwise make the
 * browser attach it. "lax" withholds the cookie on cross-site POSTs, which is
 * exactly the shape of a CSRF attack, while still allowing normal top-level
 * navigation into the console.
 */

import { cookies } from "next/headers";

const ACCESS = "ut_access";
const REFRESH = "ut_refresh";

/** Refresh tokens last 30 days server-side; the cookie should not outlive it. */
const REFRESH_MAX_AGE_S = 30 * 24 * 60 * 60;

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    // Off on localhost, on everywhere else. A Secure cookie is simply not
    // stored over plain http, which would break local development silently.
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}

export async function saveSession(pair: TokenPair): Promise<void> {
  const jar = await cookies();
  // The access cookie is given the token's own lifetime, so an expired session
  // presents no cookie at all rather than a token the API will reject.
  jar.set(ACCESS, pair.access_token, cookieOptions(pair.expires_in));
  jar.set(REFRESH, pair.refresh_token, cookieOptions(REFRESH_MAX_AGE_S));
}

export async function clearSession(): Promise<void> {
  const jar = await cookies();
  jar.delete(ACCESS);
  jar.delete(REFRESH);
}

export async function readAccessToken(): Promise<string | undefined> {
  return (await cookies()).get(ACCESS)?.value;
}

export async function readRefreshToken(): Promise<string | undefined> {
  return (await cookies()).get(REFRESH)?.value;
}
