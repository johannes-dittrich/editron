# Single-stage monorepo build — avoids the cross-stage node_modules COPY that
# exceeds Azin's builder limits. Larger image, simpler pipeline. For staging.

FROM node:20-alpine
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

# install deps (including dev deps — turbo build needs typescript etc.)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
RUN NODE_ENV=development pnpm install --frozen-lockfile --ignore-scripts

# copy source and build
COPY . .
RUN pnpm exec turbo run build --filter=@editron/web

EXPOSE 8080
WORKDIR /app/apps/web
CMD ["pnpm", "exec", "next", "start", "-H", "0.0.0.0", "-p", "8080"]
