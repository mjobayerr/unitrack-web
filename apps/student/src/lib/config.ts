/**
 * Where the API lives.
 *
 * Default `/api` is same-origin: the Vite dev server (and nginx in production)
 * proxies `/api/*` to the FastAPI service, so the browser makes no cross-origin
 * request and there is no CORS to configure. Override with `VITE_API_URL` only
 * to point a build straight at an absolute API origin (which then needs the
 * backend's `CORS_ORIGINS` to include this app).
 */
export const API_BASE_URL: string =
  (import.meta.env.VITE_API_URL as string | undefined)?.replace(/\/$/, "") || "/api";

/** WebSocket URL for the live-tracking feed. `path` is the backend path itself
 * (e.g. `/ws/track/{id}?token=…`), NOT under the `/api` prefix: Vite's proxy
 * does not apply its path rewrite to WebSocket upgrades, so the socket is
 * proxied on its own `/ws` entry that forwards straight through. In production
 * nginx proxies `/ws` to the API the same way. */
export function apiWsUrl(path: string): string {
  if (API_BASE_URL.startsWith("http")) {
    const u = new URL(API_BASE_URL);
    const proto = u.protocol === "https:" ? "wss:" : "ws:";
    return `${proto}//${u.host}${path}`;
  }
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}${path}`;
}
