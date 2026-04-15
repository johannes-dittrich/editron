# apps/api Dockerfile — Fastify + BullMQ workers in one process.
# Single stage to avoid Azin builder cross-stage COPY limits (same
# pattern as apps/web/Dockerfile which was the only thing that worked).

FROM node:20-alpine
RUN apk add --no-cache libc6-compat ffmpeg
RUN corepack enable && corepack prepare pnpm@9.15.0 --activate
WORKDIR /app

ENV NODE_ENV=production
ENV API_PORT=8080
ENV HOST=0.0.0.0

# install all workspace deps (dev too — tsc + tsx are build-time)
COPY pnpm-workspace.yaml pnpm-lock.yaml package.json ./
COPY apps/api/package.json apps/api/
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
COPY packages/db/package.json packages/db/
RUN NODE_ENV=development pnpm install --no-frozen-lockfile --ignore-scripts

# copy source
COPY . .

# build @editron/shared → @editron/db → @editron/api via turbo
RUN pnpm exec turbo run build --filter=@editron/api

EXPOSE 8080
WORKDIR /app/apps/api
CMD ["node", "dist/server.js"]
