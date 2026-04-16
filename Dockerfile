# Single-stage monorepo build for apps/web (standalone Next.js on :8080).
# output: "standalone" pre-traces at build time so "Collecting build
# traces" at the end is a no-op, avoiding OOM on Azin's builder.

FROM node:20-alpine
RUN apk add --no-cache libc6-compat
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=8080
ENV HOSTNAME=0.0.0.0

COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/web/package.json apps/web/
COPY apps/api/package.json apps/api/
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
RUN NODE_ENV=development pnpm install --no-frozen-lockfile --ignore-scripts

COPY . .
RUN pnpm exec turbo run build --filter=@editron/web

# standalone output: server.js + static + public in .next/standalone
# Copy public + static into the standalone dir (Next doesn't copy them)
RUN cp -r apps/web/public apps/web/.next/standalone/apps/web/public 2>/dev/null || true
RUN cp -r apps/web/.next/static apps/web/.next/standalone/apps/web/.next/static

EXPOSE 8080
WORKDIR /app/apps/web/.next/standalone/apps/web
CMD ["node", "server.js"]
