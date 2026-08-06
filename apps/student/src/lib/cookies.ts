/**
 * Cookie names and options, shared between `session.ts` (Node runtime) and
 * `middleware.ts` (Edge runtime).
 *
 * Kept separate because `session.ts` imports `next/headers`, which middleware
 * cannot use — importing it there would break the Edge build.
 */

export const ACCESS_COOKIE = "ut_s_access";
export const REFRESH_COOKIE = "ut_s_refresh";

/** Refresh tokens last 30 days server-side; the cookie should not outlive it. */
export const REFRESH_MAX_AGE_S = 30 * 24 * 60 * 60;

export interface TokenPair {
  access_token: string;
  refresh_token: string;
  expires_in: number;
}

/**
 * `sameSite: "lax"` is the CSRF control. Because the credential is a cookie
 * rather than a header, a form on another origin could otherwise make the
 * browser attach it; "lax" withholds it on cross-site POSTs — the shape of a
 * CSRF attack — while still allowing normal navigation into the console.
 *
 * `secure` is off outside production because a Secure cookie is simply not
 * stored over plain http, which would break local development silently.
 */
export function cookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax" as const,
    path: "/",
    maxAge,
  };
}
