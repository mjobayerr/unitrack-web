/**
 * Where the session tokens live in a browser-only SPA.
 *
 * The old Next.js student app kept both tokens in httpOnly cookies the browser
 * could not read, because it had a server to hold them. This app is a static
 * Vite bundle with no server of its own, so the tokens have to live in the page.
 * The split below is the best a pure SPA can do against a bearer-token backend:
 *
 * - **Access token — in memory only.** Never written to storage, so it is gone
 *   on reload and cannot be read out of localStorage by injected script. It is
 *   short-lived (15 min) and re-minted from the refresh token on boot.
 * - **Refresh token — localStorage.** It has to survive a reload or every
 *   refresh would log the student out, and a SPA has nowhere hidden to put it.
 *   This is the real exposure: an XSS bug could read it. It is bounded by the
 *   backend's own defences — rotation on every use and server-side revocation
 *   (see `/auth/refresh`, `/auth/logout`) — and by this app shipping no
 *   `dangerouslySetInnerHTML` of untrusted data. A future hardening is a small
 *   token-broker backend that restores the httpOnly-cookie model.
 */

import type { components } from "./schema";

type TokenPair = components["schemas"]["TokenPair"];

const REFRESH_KEY = "unitrack.student.refresh";

let accessToken: string | null = null;

export function getAccessToken(): string | null {
  return accessToken;
}

export function getRefreshToken(): string | null {
  try {
    return localStorage.getItem(REFRESH_KEY);
  } catch {
    return null;
  }
}

export function setSession(pair: TokenPair): void {
  accessToken = pair.access_token;
  try {
    localStorage.setItem(REFRESH_KEY, pair.refresh_token);
  } catch {
    // Private-mode or storage-disabled: the session still works for this tab,
    // it just will not survive a reload. Better than refusing to log in.
  }
}

export function clearSession(): void {
  accessToken = null;
  try {
    localStorage.removeItem(REFRESH_KEY);
  } catch {
    /* nothing to clear */
  }
}

export function hasRefreshToken(): boolean {
  return getRefreshToken() !== null;
}
