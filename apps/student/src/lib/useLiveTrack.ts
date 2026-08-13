/**
 * Subscribe to a route's live positions over the backend WebSocket
 * (/ws/track/{route_id}, spec §7.3). Pushes a fresh frame every few seconds;
 * this hook exposes the current bus list and the connection state, and quietly
 * reconnects with backoff if the socket drops.
 *
 * A browser WebSocket can't send an Authorization header, so the access token
 * rides in the query string, refreshed just before connecting so a 15-minute
 * token that expired mid-session doesn't get the handshake closed (4401).
 */

import { useEffect, useRef, useState } from "react";

import { refreshSession } from "./api";
import { apiWsUrl } from "./config";
import { getAccessToken } from "./tokens";

export interface TrackBus {
  trip_id: string;
  bus_id: string;
  reg_no: string;
  nickname: string | null;
  lat: number | null;
  lng: number | null;
  heading: number | null;
  speed_kmh: number | null;
  fix_ts: string | null;
  fix_age_s: number | null;
  freshness: "live" | "stale" | "lost";
  occupied: number | null;
  capacity: number | null;
  next_stop_eta_minutes: number | null;
}

interface TrackFrame {
  type: string;
  route_id: string;
  buses: TrackBus[];
}

export function useLiveTrack(routeId: string | null): { buses: TrackBus[]; connected: boolean } {
  const [buses, setBuses] = useState<TrackBus[]>([]);
  const [connected, setConnected] = useState(false);

  useEffect(() => {
    if (!routeId) {
      setBuses([]);
      return;
    }

    let disposed = false;
    let ws: WebSocket | null = null;
    let retryTimer: ReturnType<typeof setTimeout> | null = null;
    let attempts = 0;

    // Application close code from the backend handler for a bad/expired token.
    const WS_UNAUTHORIZED = 4401;

    async function connect() {
      if (disposed) return;
      let token = getAccessToken();
      if (!token) {
        // No access token in memory yet (e.g. straight after a reload) — mint
        // one from the refresh token, once.
        token = (await refreshSession()) ? getAccessToken() : null;
      }
      if (!token || disposed) return;

      ws = new WebSocket(apiWsUrl(`/ws/track/${routeId}?token=${encodeURIComponent(token)}`));

      ws.onopen = () => {
        attempts = 0;
        setConnected(true);
      };
      ws.onmessage = (e) => {
        try {
          const frame = JSON.parse(e.data) as TrackFrame;
          if (frame.type === "positions") setBuses(frame.buses);
        } catch {
          /* ignore a malformed frame rather than tearing down the stream */
        }
      };
      ws.onclose = (ev) => {
        setConnected(false);
        if (disposed) return;
        attempts += 1;
        const delay = Math.min(1000 * 2 ** attempts, 15_000);
        // Only spend a token refresh when the close was specifically an auth
        // rejection — refreshing on every reconnect would churn (and eventually
        // break) the rotating refresh token.
        retryTimer = setTimeout(async () => {
          if (ev.code === WS_UNAUTHORIZED) await refreshSession().catch(() => {});
          connect();
        }, delay);
      };
      ws.onerror = () => ws?.close();
    }

    connect();

    return () => {
      disposed = true;
      if (retryTimer) clearTimeout(retryTimer);
      ws?.close();
    };
  }, [routeId]);

  return { buses, connected };
}
