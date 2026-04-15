# Single-stage monorepo build — next.js 14 on :8080.
# Single stage avoids Azin builder's cross-stage COPY limits.
# --no-frozen-lockfile tolerates lockfile drift from merged PRs.

FROM node:20-alpine
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# install deps (dev included — turbo/typescript needed for build)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
RUN NODE_ENV=development pnpm install --no-frozen-lockfile --ignore-scripts

# copy source and build
COPY . .
RUN pnpm exec turbo run build --filter=@editron/web

EXPOSE 8080
WORKDIR /app/apps/web
CMD ["pnpm", "exec", "next", "start", "-H", "0.0.0.0", "-p", "8080"]
