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
RUN pnpm install --frozen-lockfile


# --- build -----------------------------------------------------------------
FROM base AS build
ARG APP
COPY --from=deps /repo/node_modules ./node_modules
COPY --from=deps /repo/apps/admin/node_modules ./apps/admin/node_modules
COPY --from=deps /repo/apps/student/node_modules ./apps/student/node_modules
COPY --from=deps /repo/packages/api-client/node_modules ./packages/api-client/node_modules
COPY . .
# Fails loudly here rather than at runtime. A type error reaching a container is
# a page that 500s for a real visitor.
RUN pnpm --filter "@unitrack/${APP}" run build


# --- runtime ---------------------------------------------------------------
# `output: "standalone"` traced exactly the files that are reached, so this
# stage carries neither the source nor the dev dependencies — about 60 MB
# instead of the better part of a gigabyte.
FROM node:22-alpine AS runner
ARG APP
ENV NODE_ENV=production
# The standalone server binds to localhost by default, which inside a container
# means nothing else can reach it — including cloudflared on the same network.
ENV HOSTNAME=0.0.0.0
WORKDIR /app

# Runs unprivileged. Next needs no write access to its own bundle, so there is
# no reason for this process to be root inside the container.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

COPY --from=build --chown=nextjs:nodejs /repo/apps/${APP}/.next/standalone ./
# Static assets are deliberately excluded from the traced output and have to be
# copied alongside it, or every page renders unstyled with a 404 per chunk.
COPY --from=build --chown=nextjs:nodejs /repo/apps/${APP}/.next/static ./apps/${APP}/.next/static

USER nextjs

# Baked in so the CMD does not need a shell to expand the app name.
ENV APP_ENTRY=apps/${APP}/server.js
CMD ["sh", "-c", "node $APP_ENTRY"]
