import { NextResponse } from "next/server";

import { API_BASE_URL } from "../../../../lib/api";
import { readAccessToken } from "../../../../lib/session";

/**
 * Proxy the boarding QR image, attaching the token the browser cannot see.
 *
 * The whole point of the BFF is that page scripts never hold a bearer token —
 * which also means an `<img src>` cannot authenticate itself. So the image is
 * fetched here, server-side, with the token read from the httpOnly cookie.
 *
 * Nothing about *which* ticket is trusted from this request beyond passing the
 * id along: the API checks the ticket belongs to the caller, so a student
 * guessing another's uuid gets the same 404 they would get for one that does
 * not exist.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ ticketId: string }> },
) {
  const { ticketId } = await params;
  const token = await readAccessToken();

  if (!token) {
    return NextResponse.json({ error: "Not signed in" }, { status: 401 });
  }

  const upstream = await fetch(
    `${API_BASE_URL}/shop/tickets/${encodeURIComponent(ticketId)}/qr.png`,
    { headers: { authorization: `Bearer ${token}` }, cache: "no-store" },
  );

  if (!upstream.ok) {
    return NextResponse.json({ error: "Could not render code" }, { status: upstream.status });
  }

  return new NextResponse(await upstream.arrayBuffer(), {
    headers: {
      "content-type": "image/png",
      // A code lives for one 30-second slice. Anything cached here is a
      // rejected passenger, and this is the last hop before the phone.
      "cache-control": "no-store, max-age=0",
    },
  });
}
