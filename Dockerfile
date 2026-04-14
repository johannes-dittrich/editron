# Monorepo Dockerfile — builds apps/web (Next.js 14) and serves on :8080.
# Works for both prod and per-branch staging deployments on Azin.

FROM node:20-alpine AS base
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

# ---------- deps ----------
FROM base AS deps
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
RUN pnpm install --frozen-lockfile --ignore-scripts

# ---------- build ----------
FROM base AS builder
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/web/node_modules ./apps/web/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN pnpm exec turbo run build --filter=@editron/web

# ---------- runtime ----------
FROM node:20-alpine AS runtime
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

ENV NODE_ENV=production
ENV PORT=8080
ENV HOSTNAME=0.0.0.0
ENV NEXT_TELEMETRY_DISABLED=1

# copy the built app plus the minimum node_modules we need to run it
COPY --from=builder /app/apps/web/package.json apps/web/package.json
COPY --from=builder /app/apps/web/.next apps/web/.next
COPY --from=builder /app/apps/web/next.config.js apps/web/next.config.js
COPY --from=builder /app/apps/web/node_modules apps/web/node_modules
COPY --from=builder /app/packages/shared packages/shared
COPY --from=builder /app/node_modules node_modules
COPY --from=builder /app/package.json package.json
COPY --from=builder /app/pnpm-workspace.yaml pnpm-workspace.yaml
COPY --from=builder /app/pnpm-lock.yaml pnpm-lock.yaml

EXPOSE 8080
WORKDIR /app/apps/web
CMD ["pnpm", "exec", "next", "start", "-H", "0.0.0.0", "-p", "8080"]
