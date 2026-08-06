import { NextResponse } from "next/server";

import { API_BASE_URL } from "../../../lib/api";
import { readAccessToken } from "../../../lib/session";

/**
 * Proxy `/track/nearby`, attaching the token the browser cannot see.
 *
 * The map polls this every ten seconds. It exists for the same reason as the
 * QR proxy: with the session in an httpOnly cookie, client-side code has no
 * bearer token to send, and giving it one would undo the whole point of the BFF.
 */
export async function GET(request: Request) {
  const token = await readAccessToken();
  if (!token) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const lat = searchParams.get("lat");
  const lng = searchParams.get("lng");
  const radius = searchParams.get("radius_km") ?? "5";

  if (!lat || !lng) {
    return NextResponse.json({ error: "lat and lng are required" }, { status: 400 });
  }

  const upstream = await fetch(
    `${API_BASE_URL}/track/nearby?lat=${encodeURIComponent(lat)}&lng=${encodeURIComponent(lng)}&radius_km=${encodeURIComponent(radius)}`,
    { headers: { authorization: `Bearer ${token}` }, cache: "no-store" },
  );

  if (!upstream.ok) {
    return NextResponse.json({ error: "Upstream error" }, { status: upstream.status });
  }
  return NextResponse.json(await upstream.json(), {
    // Positions are stale within seconds; caching them shows a bus where it
    // used to be, which is worse than showing nothing.
    headers: { "cache-control": "no-store" },
  });
}
