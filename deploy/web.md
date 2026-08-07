# Deploying the web apps

Two Next.js apps behind the **same** Cloudflare Tunnel the API already uses.

```
adm.kodewithmj.xyz       →  admin:3000    →  api:8000
unitrack.kodewithmj.xyz  →  student:3001  →  api:8000
api.kodewithmj.xyz       →  nginx:80      →  api:8000     (already live)
```

One tunnel, three public hostnames. `cloudflared` runs in the **unitrack-backend**
compose project, so these containers join that project's network as an external
network — which is also how they resolve `api` by name.

No host ports are published. Nothing here is reachable except through the
tunnel, and binding 3000 to the host would quietly undo that.

## Prerequisites

The backend stack must be up first — it owns the network and the tunnel.

```bash
cd ~/unitrack-backend
docker compose -f docker-compose.cloudflared.yml --env-file .env.prod up -d
```

## 1. Add the two hostnames in Cloudflare

Zero Trust → Networks → Tunnels → your tunnel → **Public Hostname** → Add:

| Subdomain | Domain | Type | URL |
|---|---|---|---|
| `adm` | `kodewithmj.xyz` | HTTP | `admin:3000` |
| `unitrack` | `kodewithmj.xyz` | HTTP | `student:3001` |

`http://` is correct: the hop from `cloudflared` to these containers is inside
the Docker network. Cloudflare terminates TLS at the edge, which is why SSL/TLS
mode must stay **Full**, not Full (Strict) — there is no certificate on the
origin to be strict about.

DNS records are created automatically when the hostname is added.

## 2. Bring the apps up

```bash
cd ~/unitrack-web
docker compose -f docker-compose.prod.yml up -d --build
```

First build takes a few minutes; the dependency layer is cached afterwards, so
a code-only redeploy is much faster.

## 3. Point the payment gateway at the student wallet

The backend builds SSLCommerz's return URL from its own environment, so it has
to learn where the student app lives. In `~/unitrack-backend/.env.prod`:

```
CHECKOUT_RETURN_URL=https://unitrack.kodewithmj.xyz/wallet
```

Then restart the API so it is read:

```bash
cd ~/unitrack-backend
docker compose -f docker-compose.cloudflared.yml --env-file .env.prod up -d api
```

Leave it empty and a student who pays lands on the API's own bare JSON
confirmation instead of their wallet. The payment still settles — the IPN and
the reconciler do not depend on the browser — but it looks broken.

## Why the apps talk to `api:8000` and not through nginx

nginx rate-limits on the client IP. For these requests that IP is the app
container, so every operator using the console would share a single 120 r/m
bucket and start collecting 429s under ordinary use. The limiter exists to fend
off the internet; this is a server on the same private network.

`CORS_ORIGINS` stays **empty** for the same structural reason. The browser only
ever talks to the Next.js app, which talks to the API server-side — those
requests are same-origin and need no CORS at all. Adding the web origins here
would widen the API's surface for no benefit.

## Checks

```bash
docker compose -f docker-compose.prod.yml ps
docker compose -f docker-compose.prod.yml logs --tail 20 admin student
curl -s -o /dev/null -w "%{http_code}\n" https://adm.kodewithmj.xyz/login
curl -s -o /dev/null -w "%{http_code}\n" https://unitrack.kodewithmj.xyz/login
```

Both should answer 200. A request to a signed-in page while signed out answers
307 to `/login`, which is the middleware working rather than a fault.

## Troubleshooting

**502 from Cloudflare** — `cloudflared` cannot resolve the container. Confirm
the service name in the dashboard matches the compose service exactly
(`admin:3000`, not `unitrack-web-admin-1:3000`) and that both projects share
`unitrack-backend_default`:

```bash
docker network inspect unitrack-backend_default --format '{{range .Containers}}{{.Name}} {{end}}'
```

**Pages render unstyled** — the static assets did not reach the runtime stage.
They are excluded from Next's traced output on purpose and copied separately in
the Dockerfile; a change there is the first place to look.

**`Cannot find module` at boot** — `outputFileTracingRoot` in
`next.config.mjs`. Without it, tracing starts at the app directory and misses
the workspace package and the pnpm store above it.
