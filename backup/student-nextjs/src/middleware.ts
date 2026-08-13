/**
 * Route protection and token refresh, before any page renders.
 *
 * This is the only place refresh can live. A Server Component cannot write
 * cookies, so a refresh triggered mid-render would fetch a new pair and then be
 * unable to keep it — every subsequent request would refresh again, burning a
 * rotation each time. Middleware runs first and can set cookies on the
 * response, so the new pair actually sticks.
 *
 * Expiry is detected by the access cookie being *absent* rather than by
 * decoding the JWT: the cookie is written with `maxAge = expires_in`, so the
 * browser drops it at exactly the moment the token stops being useful.
 */

import { NextResponse, type NextRequest } from "next/server";

import {
  ACCESS_COOKIE,
  REFRESH_COOKIE,
  REFRESH_MAX_AGE_S,
  cookieOptions,
  type TokenPair,
} from "./lib/cookies";

const API_BASE_URL = process.env.UNITRACK_API_URL ?? "http://localhost:8000";

// Reachable without a session, by necessity. `/register` is for people who have
// no account; `/verify` is opened from an emailed link by someone who cannot
// sign in yet — that is precisely what the link is for. Guarding either would
// bounce every new student to a login they cannot pass.
const PUBLIC_PATHS = new Set(["/login", "/register", "/verify"]);

/**
 * Turn away an unauthenticated request in whatever form its caller understands.
 *
 * A page navigation gets a redirect to the sign-in screen. A request under
 * `/api` gets a 401, because those are fetched by `<img>` and `fetch()` — a
 * redirect there resolves to the login *page*, so the browser would try to
 * render HTML as a PNG and the boarding code would just silently fail to
 * appear, with nothing in the console to explain it.
 */
function refuse(request: NextRequest): NextResponse {
  const isApi = request.nextUrl.pathname.startsWith("/api/");

  const response = isApi
    ? NextResponse.json({ error: "Not signed in" }, { status: 401 })
    : NextResponse.redirect(new URL("/login", request.url));

  // Clear both, so a dead refresh token cannot send the next request back into
  // this branch forever.
  response.cookies.delete(ACCESS_COOKIE);
  response.cookies.delete(REFRESH_COOKIE);
  return response;
}

export async function middleware(request: NextRequest): Promise<NextResponse> {
  if (PUBLIC_PATHS.has(request.nextUrl.pathname)) return NextResponse.next();

  const accessToken = request.cookies.get(ACCESS_COOKIE)?.value;
  if (accessToken) return NextResponse.next();

  const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
  if (!refreshToken) return refuse(request);

  const refreshed = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
    cache: "no-store",
  }).catch(() => null);

  // Expired, revoked, replayed, or the account was suspended — none of which
  // recover by trying again.
  if (!refreshed?.ok) return refuse(request);

  const pair = (await refreshed.json()) as TokenPair;

  // The new access token has to reach *this* request's render too, not just the
  // browser. Forwarding a patched cookie header is what makes the current page
  // load succeed instead of 401-ing once before the next one works.
  const headers = new Headers(request.headers);
  const jar = request.cookies;
  jar.set(ACCESS_COOKIE, pair.access_token);
  jar.set(REFRESH_COOKIE, pair.refresh_token);
  headers.set(
    "cookie",
    jar
      .getAll()
      .map((c) => `${c.name}=${c.value}`)
      .join("; "),
  );

  const response = NextResponse.next({ request: { headers } });
  // Refresh tokens rotate: the backend consumed the one we sent, so persisting
  // the replacement is mandatory. Keeping the old one would present a revoked
  // token on the next refresh and sign the admin out.
  response.cookies.set(ACCESS_COOKIE, pair.access_token, cookieOptions(pair.expires_in));
  response.cookies.set(REFRESH_COOKIE, pair.refresh_token, cookieOptions(REFRESH_MAX_AGE_S));
  return response;
}

export const config = {
  // Everything except Next's own assets and the favicon. Static files do not
  // need a session, and refreshing a token to serve a .png would be absurd.
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
