# UniTrack — Web

Web clients for **UniTrack**, a university bus ticketing + live-tracking platform. Two Next.js apps in one repo (shared API client, types, auth, MapLibre setup).

## Apps

- **Student app** — Next.js (App Router). Sign-up with email confirmation, ticket
  shop and checkout through SSLCommerz, a wallet that renders the rotating
  boarding QR, and a live bus map on MapLibre GL JS with free OSM tiles.
- **Admin console** — Next.js. Live fleet map with a GPS-freshness indicator,
  helper approval queue, emergency alerts console, and catalog management for
  products, routes and stops.

## Stack

Next.js 15 (App Router, React 19) · MapLibre GL JS (free OSM tiles, zero quota) ·
pnpm + Turborepo · types generated from the backend's OpenAPI schema.

Live data is **polled**, not pushed — the backend's `/ws/track/{route_id}` is not
built yet, so the map refreshes on an interval. Swapping in a socket later
touches only the map's data hook.

## Contract

No backend code here. Talks only to the **[unitrack-backend](https://github.com/mjobayerr/unitrack-backend)** API. TypeScript types are generated from its OpenAPI schema (`openapi-typescript`) — backend changes shape, regenerate, type errors catch drift.

## Sibling repos

- **[unitrack-backend](https://github.com/mjobayerr/unitrack-backend)** — FastAPI hub + workers (+ full spec).
- **[unitrack-helper](https://github.com/mjobayerr/unitrack-helper)** — Flutter helper app.

## Status

Both apps run against the real backend. `pnpm typecheck`, `pnpm lint` and
`pnpm build` all pass, and run in CI on every push
([`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

**Functional:**

| Area | State |
|---|---|
| Workspace (pnpm + Turborepo), shared API client | ✅ |
| Types generated from the backend's `openapi.json` | ✅ |
| Shared ESLint config (`@unitrack/eslint-config`) | ✅ |
| Auth — login, logout, refresh, httpOnly cookies | ✅ |
| **Admin** — helper approval queue (approve / suspend) | ✅ |
| **Admin** — alerts console (acknowledge / resolve with note) | ✅ |
| **Admin** — catalog: products, routes, stops | ✅ |
| **Admin** — live fleet map, GPS-freshness pins (spec §10.2) | ✅ |
| **Student** — sign-up + email confirmation | ✅ |
| **Student** — ticket shop and SSLCommerz checkout | ✅ |
| **Student** — wallet with the rotating boarding QR | ✅ |
| **Student** — live bus map (MapLibre) | ✅ |

**Not built yet:**

| Area | Notes |
|---|---|
| Live maps over WebSocket | Both maps poll today (student 10 s, admin 5 s); backend `/ws/track` not built |
| Trip drawer on the fleet map | §10.2 also wants route progress %, latest redemptions and seat history per bus |
| Reports / dashboards | Backend has no aggregate tables yet (spec §10) |
| Offline ticket wallet (service worker + IndexedDB) | Wallet needs the network today. The spec wants tickets to render with zero signal |
| Trip playback, bus CRUD UI | Endpoints exist for buses; no screen |

## Running the apps

The backend must be up and reachable first — see `unitrack-backend`, whose dev
compose publishes the API on `127.0.0.1:8000`.

```bash
pnpm install
cp apps/admin/.env.example apps/admin/.env.local
cp apps/student/.env.example apps/student/.env.local

pnpm dev                                    # both apps
pnpm --filter @unitrack/admin run dev       # admin only  → localhost:3000
pnpm --filter @unitrack/student run dev     # student only → localhost:3001
```

Sign in with the seeded accounts (`python -m scripts.seed` in the backend):

| Role | Email | Password |
|---|---|---|
| Admin | `admin@ulab.edu.bd` | `Admin@1234` |
| Student | see the backend's seed output | |

## Checks

```bash
pnpm typecheck      # tsc --noEmit across the workspace
pnpm lint           # eslint, shared flat config
pnpm build          # production compile + prerender
```

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
