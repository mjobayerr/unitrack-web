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

/** WebSocket origin for the live-tracking feed. Derived from the page origin so
 * the same proxy that carries `/api` carries `/api/ws` too. */
export function apiWsUrl(path: string): string {
  if (API_BASE_URL.startsWith("http")) {
    return API_BASE_URL.replace(/^http/, "ws") + path;
  }
  const proto = window.location.protocol === "https:" ? "wss:" : "ws:";
  return `${proto}//${window.location.host}${API_BASE_URL}${path}`;
}
