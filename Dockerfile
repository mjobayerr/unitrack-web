# One Dockerfile, both apps. `--build-arg APP=admin` or `APP=student`.
#
# Two apps in one monorepo sharing a workspace package means two Dockerfiles
# would drift — a Node bump applied to one and not the other is the kind of
# difference that only shows up in production. The apps differ by a name and a
# port, so that is all the build argument carries.
#
# Built from the repo root, not from apps/<name>: pnpm workspaces symlink
# `@unitrack/api-client` from packages/, and a build context that cannot see it
# fails at the import.

FROM node:22-alpine AS base
# Corepack ships with Node and pins pnpm to the version in package.json, so the
# image resolves dependencies exactly as a developer's machine does.
RUN corepack enable
WORKDIR /repo


# --- dependencies ----------------------------------------------------------
# Only the manifests, so this layer is reused across source changes. A full
# install takes minutes on a small VPS; rebuilding it for a CSS edit is minutes
# of deploy downtime for nothing.
FROM base AS deps
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/admin/package.json apps/admin/
COPY apps/student/package.json apps/student/
COPY packages/api-client/package.json packages/api-client/
COPY packages/map/package.json packages/map/
COPY packages/theme/package.json packages/theme/
RUN pnpm install --frozen-lockfile


# --- build -----------------------------------------------------------------
FROM base AS build
ARG APP
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/admin/node_modules ./apps/admin/node_modules
COPY --from=deps /repo/apps/student/node_modules ./apps/student/node_modules
COPY --from=deps /repo/packages/api-client/node_modules ./packages/api-client/node_modules
COPY --from=deps /repo/packages/map/node_modules ./packages/map/node_modules
COPY --from=deps /repo/packages/theme/node_modules ./packages/theme/node_modules
COPY . .
# Fails loudly here rather than at runtime. A type error reaching a container is
# a page that 500s for a real visitor.
RUN pnpm --filter "@unitrack/${APP}" run build


# --- runtime ---------------------------------------------------------------
# The apps are static Vite SPAs, so the runtime is just nginx: it serves the
# built bundle and reverse-proxies the two dynamic paths the browser calls on
# the same origin — /api to the backend (prefix stripped) and /ws for the
# live-tracking WebSocket (passed through). This is the production half of each
# app's vite.config.ts dev proxy, so the app behaves the same in both.
FROM nginx:1.27-alpine AS runner
ARG APP
# The tunnel routes to this port (admin:3000, student:3001); compose sets PORT.
# The nginx image's entrypoint envsubst's ${PORT} into the template below.
ENV PORT=3000
COPY --from=build /repo/apps/${APP}/dist /usr/share/nginx/html
COPY deploy/web.nginx.conf.template /etc/nginx/templates/default.conf.template
