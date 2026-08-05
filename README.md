# UniTrack — Web

Web clients for **UniTrack**, a university bus ticketing + live-tracking platform. Two Next.js apps in one repo (shared API client, types, auth, MapLibre setup).

## Apps

- **Student PWA** — Next.js (App Router). MapLibre GL JS + free OSM tiles. Offline ticket wallet (IndexedDB) with a rotating TOTP-style QR. Live map, per-stop ETA, SOS button. Service worker so tickets work with zero network.
- **Admin dashboard** — Next.js. Live fleet map, emergency console, CRUD, reports, trip playback. Report pages use pre-aggregated tables — never scan raw data.

## Stack

Next.js · MapLibre GL JS (free OSM tiles, zero quota) · IndexedDB (offline wallet) · WebSocket for live position/ETA/seat frames · Recharts (admin).

## Contract

No backend code here. Talks only to the **[unitrack-backend](https://github.com/mjobayerr/unitrack-backend)** API. TypeScript types are generated from its OpenAPI schema (`openapi-typescript`) — backend changes shape, regenerate, type errors catch drift.

## Sibling repos

- **[unitrack-backend](https://github.com/mjobayerr/unitrack-backend)** — FastAPI hub + workers (+ full spec).
- **[unitrack-helper](https://github.com/mjobayerr/unitrack-helper)** — Flutter helper app.

## Status

**Admin dashboard: working.** Helper approval queue and the emergency alerts
console run against the real backend. **Student PWA: not started** — its core
is the ticket wallet, which is blocked on the backend's bKash-gated ticketing.

| Area | State |
|---|---|
| Workspace (pnpm + Turborepo), shared API client | ✅ |
| Types generated from the backend's `openapi.json` | ✅ |
| Admin auth — login, logout, refresh | ✅ |
| Helper approval queue (approve / suspend) | ✅ |
| Alerts console (acknowledge / resolve with note) | ✅ |
| Bus creation | ⬜ endpoints exist, no UI yet |
| Route / stop management | ⛔ backend has no CRUD for these |
| Student PWA, live map, ticket wallet | ⬜ / ⛔ bKash-gated |

## Running the admin app

The backend must be up and reachable first — see `unitrack-backend`, whose dev
compose publishes the API on `127.0.0.1:8000`.

```bash
pnpm install
cp apps/admin/.env.example apps/admin/.env.local
pnpm --filter @unitrack/admin run dev      # http://localhost:3000
```

Sign in with the seeded admin: `admin@ulab.edu.bd` / `Admin@1234`.

Regenerate the API types whenever the backend contract changes:

```bash
docker compose exec api python -c "import urllib.request; print(urllib.request.urlopen('http://localhost:8000/openapi.json').read().decode())" > openapi.json
pnpm gen:api
```

## Auth

The admin app is a **backend-for-frontend**. Tokens live in httpOnly cookies
the browser cannot read, so page scripts never hold a bearer token: an XSS bug
on a console that can approve helpers and suspend accounts cannot walk away
with the session. The browser talks to Next.js; Next.js talks to FastAPI.

Two consequences worth knowing:

- **No CORS is involved.** All browser requests are same-origin, so the
  backend's `CORS_ORIGINS` setting is irrelevant to this architecture.
- **Refresh happens in `middleware.ts`, not in page code.** Next.js forbids
  writing cookies during a Server Component render, so a refresh triggered
  mid-render could never persist the new pair. Since refresh tokens rotate, a
  lost replacement means the next refresh presents a revoked token.
