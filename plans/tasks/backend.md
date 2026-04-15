# Backend Agent — Work Queue

You are the `backend` agent for Editron. Read this file at the start of
every tick. Pick the **first unchecked item**. Do it. Check it off when the
PR is open with label `ready`. The merger loop handles merging after human
approval.

Branch convention: `feat/be-<scope>`. Open one PR per scope.

Scope: `apps/api/` (Fastify), `packages/db/` (Drizzle + schema),
`packages/shared/` (types — shared with frontend), and
`docker-compose.yml` (local dev only). You do not touch `apps/web/`,
`.github/workflows/`, or `scripts/`.

Before you start each task: `git fetch origin && git pull origin
feature/web-app` into your worktree, then branch off from it.

---

## Milestone V0 — Foundation

### M0.1 — Monorepo plumbing
- [x] Add Drizzle + Better-Auth + Stripe + Zod + BullMQ + AWS S3 client deps to the relevant `apps/api` / `packages/db` / `packages/shared` package.jsons. Use exact versions. Run `pnpm install`. Verify `turbo build --filter=@editron/api` passes with an empty Fastify entry point that just serves `GET /health`.

### M0.2 — Drizzle schema V0
- [x] In `packages/db/src/schema/`, define tables `users`, `projects`, `uploads`, `transcripts`, `edls`, `renders` as specified in `plans/02-auth-and-database.md` §Schema. Export types from `packages/shared/src/schema.ts`. Set up `drizzle-kit` config at `packages/db/drizzle.config.ts`. Add a root `pnpm db:push` script.

### M0.3 — DB connection + health
- [x] `packages/db/src/client.ts` loads `DATABASE_URL` from env, exports a `postgres` client and a `db` Drizzle instance. Extend the Fastify health endpoint at `GET /api/health` to include `db: "ok" | "down"` (pings with `select 1`).

### M0.4 — Better-Auth wiring
- [x] Configure Better-Auth with email/password + GitHub provider. Drizzle adapter pointed at the schema tables. Mount as a Fastify plugin at `/api/auth/*`. Store `BETTER_AUTH_SECRET` in env (generate if missing, log a warning). Test: sign up, sign in, `GET /api/me` returns the session user.

### M0.5 — Projects CRUD
- [x] `GET /api/projects`, `POST /api/projects`, `GET /api/projects/:id`, `PATCH /api/projects/:id`, `DELETE /api/projects/:id`. All session-gated. Unit tests against a test DB (vitest + pg-mem or a test Neon branch).

### M0.6 — R2 client
- [x] `packages/shared/src/r2.ts` exports a typed `@aws-sdk/client-s3` client configured against the R2 endpoint in the env. Helper `getObjectKey(userId, projectId, kind, uploadId, filename)` matching the schema in `plans/03-storage-and-upload.md`.

### M0.7 — Multipart upload endpoints
- [x] `POST /api/uploads/initiate` / `POST /api/uploads/:id/part-url` / `POST /api/uploads/:id/complete` / `POST /api/uploads/:id/abort`. Each session-gated and project-scoped. Integration test: upload a 20 MB fixture end-to-end against real R2 under a `test/` prefix.

### M0.8 — BullMQ scaffold
- [x] `apps/api/src/queue/index.ts` sets up BullMQ with `REDIS_URL` (local docker-compose Redis for dev). Define the `audio-extract` queue + worker. Worker is a no-op for now (just logs and marks the `uploads` row as `processed`).

### M0.9 — Audio-extract worker (the real one)
- [x] Implement the HTTP-Range → ffmpeg pipe flow from `plans/03-storage-and-upload.md` §3. Write the extracted WAV to a temp path, upload it to R2 under `transcripts/{uploadId}.wav`, mark `uploads.status = 'processed'`. Integration test with a real 30 MB fixture.

### M0.10 — Transcribe worker
- [ ] BullMQ job `transcribe`. Reads the WAV from R2, sends to ElevenLabs Scribe with the parameters from `plans/07-ai-subtitles.md` §1. Writes the raw JSON to `transcripts/{uploadId}.json` and persists a `transcripts` row. Fall back to Whisper on Scribe failure.

---

## Milestone V1 — Video pipeline

### M1.1 — Render queue scaffold
- [x] Empty queues for `render-seg`, `render-concat`, `render-final`, `loudnorm`. Each with a typed job payload. Workers that log and exit for now.

### M1.2 — Per-segment extraction
- [x] `render-seg` worker: given an EDL range, spawn ffmpeg with the range's `--ss`/`--t`, apply per-segment grade filter, add 30ms audio fades. Upload to `renders/{edlId}/segs/{idx}.mp4`. Tests with a fixture EDL.

### M1.3 — Lossless concat
- [x] `render-concat` worker: download seg files into tmp, ffmpeg concat demuxer with `-c copy`, upload `base.mp4`.

### M1.4 — Overlays + subtitles
- [x] `render-final` worker: apply overlays with PTS shift, then subtitles **last** (SKILL.md rule 1). Generates master SRT inline from transcripts with output-timeline offsets.

### M1.5 — Loudnorm
- [x] Two-pass ffmpeg loudnorm to `-14 LUFS -1 dBTP LRA 11`. Upload as `final.mp4`. Mark `renders.status = 'done'`.

---

## Milestone V2 — AI reasoning + billing

### M2.1 — Text-to-edit endpoint
- [x] `POST /api/projects/:id/ai/edit` per `plans/08-ai-text-to-edit.md`. OpenAI function calling with the `emit_edl` tool. Zod validation rejects cuts that don't land on word boundaries.

### M2.2 — Strategy proposal endpoint
- [x] `POST /api/projects/:id/ai/strategy` — the first call before any cuts. Returns a 4-8 sentence paragraph. Persists as `projects.proposedStrategy`.

### M2.3 — Stripe checkout + webhook
- [x] Per `plans/11-billing-and-plans.md` §1. Webhook signature verification. Updates `users.plan` and `users.stripeCustomerId`.

### M2.4 — Usage tracking + quota enforcement
- [x] `usage_events` table + `GET /api/usage/current` + `canRender` / `canTranscribe` gates.

---

## Rules

- **Always append to `STATUS.md`** at the end of each tick:
  `<iso-timestamp> backend <what-you-did> <link-to-pr>`
- **After each PR is opened**, run `/home/boxd/editron/scripts/stage.sh <branch>`
  to deploy a staging env. Don't `gh label add ready` until the staging deploy is green.
- **Respect the twelve hard rules** from `video-use-main/SKILL.md` in
  anything render-related.
- **Tests are non-negotiable** — every PR ships tests. Real integrations
  (real DB branch, real R2 test prefix), no mocks at system boundaries.
- **Small PRs.** One endpoint or one worker per PR. Split big tasks.
- **If blocked**, write a one-line note at the top of this file under a
  `## Blocked` section and move to the next unblocked item. Do not
  invent interfaces to unblock yourself — escalate instead.

## Blocked
(none yet)

---

## Milestone M3 — MVP Deploy (see plans/15-mvp-deploy.md)

### M3.1 — Dockerfile for apps/api
- [ ] Write `apps/api/Dockerfile` (single-stage, node 20 alpine, `corepack enable pnpm@9.15.0`, install workspace deps, build `@editron/api`, start command `pnpm --filter @editron/api start`). Expose 8080. Health check at `/api/health`. Verify local `docker build` + `docker run` works.

### M3.2 — Create and configure Azin api service
- [ ] `zin service create app --name api` in the production environment (use `-p editron -e production`). Set source to johannes-dittrich/editron mirror, branch main, dockerfile `apps/api/Dockerfile`, build context `.`. Add HTTP endpoint on 8080, public, CDN disabled. Set every required env var via `zin service set env api`: `DATABASE_URL`, `REDIS_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET`, `R2_REGION`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `BETTER_AUTH_SECRET` (generate a fresh 32-byte hex string), `BETTER_AUTH_URL` (the api allocated domain), `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `NODE_ENV=production`. Read values from `~/.config/editron/secrets.env` on this VM via the orchestrator. Run `zin deploy run -p editron -e production` and wait for active. **When the api is live, write the allocated public URL under `## api-url-available` in `COORDINATION.md` so frontend and qa are unblocked.**

### M3.3 — Schema push + healthcheck
- [ ] After api is active, run `zin exec` or a local one-off to execute `pnpm --filter @editron/db db:push` against prod `DATABASE_URL`. Then curl the api health endpoint. Expect `{status:"ok", db:"ok", redis:"ok"}`. If any fails, fix and redeploy.

### M3.5 — Stripe webhook registration
- [ ] Register a webhook in the Stripe dashboard (test mode) pointing at `<api_public_url>/api/billing/webhook`. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Copy the signing secret. Write an entry in `COORDINATION.md` §archive with `STRIPE_WEBHOOK_SECRET needs to be added to secrets.env on orchestrator + zin service set env api STRIPE_WEBHOOK_SECRET=...`. Since you cannot edit the orchestrator VM directly, file the step as a human-action note and continue.

### M3.7a — Backends


---

## Milestone M3 — MVP Deploy (see plans/15-mvp-deploy.md)

### M3.1 — Dockerfile for apps/api
- [ ] Write `apps/api/Dockerfile` (single-stage, node 20 alpine, `corepack enable pnpm@9.15.0`, install workspace deps, build `@editron/api`, start command `pnpm --filter @editron/api start`). Expose 8080. Health check at `/api/health`. Verify local `docker build` + `docker run` works.

### M3.2 — Create and configure Azin api service
- [ ] `zin service create app --name api` in the production environment (use `-p editron -e production`). Set source to johannes-dittrich/editron mirror, branch main, dockerfile `apps/api/Dockerfile`, build context `.`. Add HTTP endpoint on 8080, public, CDN disabled. Set every required env var via `zin service set env api`: `DATABASE_URL`, `REDIS_URL`, `R2_ACCESS_KEY_ID`, `R2_SECRET_ACCESS_KEY`, `R2_ENDPOINT`, `R2_BUCKET`, `R2_REGION`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`, `BETTER_AUTH_SECRET` (generate a fresh 32-byte hex string), `BETTER_AUTH_URL` (the api allocated domain), `STRIPE_PUBLISHABLE_KEY`, `STRIPE_SECRET_KEY`, `NODE_ENV=production`. Read values from `~/.config/editron/secrets.env` on this VM via the orchestrator. Run `zin deploy run -p editron -e production` and wait for active. **When the api is live, write the allocated public URL under `## api-url-available` in `COORDINATION.md` so frontend and qa are unblocked.**

### M3.3 — Schema push + healthcheck
- [ ] After api is active, run `zin exec` or a local one-off to execute `pnpm --filter @editron/db db:push` against prod `DATABASE_URL`. Then curl the api health endpoint. Expect `{status:"ok", db:"ok", redis:"ok"}`. If any fails, fix and redeploy.

### M3.5 — Stripe webhook registration
- [ ] Register a webhook in the Stripe dashboard (test mode) pointing at `<api_public_url>/api/billing/webhook`. Events: `checkout.session.completed`, `customer.subscription.updated`, `customer.subscription.deleted`, `invoice.payment_failed`. Copy the signing secret. Since you cannot edit the orchestrator VM directly, file a `## needs-human` note in COORDINATION.md asking the human to add `STRIPE_WEBHOOK_SECRET` to the orchestrator secrets file and to the `api` service env.

### M3.7a — Backend error-path tests against real infra
- [ ] Integration test: POST /api/auth/sign-up twice with the same email, expect 409 on the second.
- [ ] Integration test: POST /api/uploads/initiate with a 500-byte file, expect 400 "invalid video".
- [ ] Integration test: request a render for an unapproved EDL, expect 400.
