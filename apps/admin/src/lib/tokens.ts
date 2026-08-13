/**
 * Browser session store for the admin console. Same design as the student app:
 * access token in memory only (gone on reload, unreadable from storage), refresh
 * token in localStorage so a reload survives, bounded by the backend's rotation
 * and revocation. A distinct storage key keeps an admin session separate from a
 * student one on the same machine.
 */

import type { components } from "./schema";

type TokenPair = components["schemas"]["TokenPair"];

const REFRESH_KEY = "unitrack.admin.refresh";

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
    /* private mode: session works for this tab, just not across reloads */
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
