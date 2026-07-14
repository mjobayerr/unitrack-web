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

Pre-code (greenfield). Comes online in roadmap **P1** (ticket wallet + admin CRUD) and **P2** (live fleet map). Full spec lives in the backend repo.
