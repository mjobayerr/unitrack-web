import { NextResponse } from "next/server";

import { API_BASE_URL } from "../../../lib/api";
import { readAccessToken } from "../../../lib/session";

/**
 * Proxy `GET /admin/fleet`, attaching the token the browser cannot see.
 *
 * The map polls this every few seconds. Every other admin screen is a Server
 * Component that fetches during render, but a live map cannot be — it has to
 * refresh without navigating, and client-side code has no bearer token to send
 * because the session lives in an httpOnly cookie. Handing one to the browser
 * would undo the BFF.
 *
 * Middleware runs before this handler and refreshes an expired access token, so
 * a console left open on the map overnight keeps polling rather than silently
 * freezing once the 15-minute token lapses.
 */
export async function GET() {
  const token = await readAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const upstream = await fetch(`${API_BASE_URL}/admin/fleet`, {
    headers: { authorization: `Bearer ${token}` },
    cache: "no-store",
  });

  if (!upstream.ok) {
    return NextResponse.json({ error: "Upstream error" }, { status: upstream.status });
  }

  return NextResponse.json(await upstream.json(), {
    // Positions are stale within seconds. A cached fleet response would draw
    // buses where they used to be, which is the bug this map exists to avoid.
    headers: { "cache-control": "no-store" },
  });
}
