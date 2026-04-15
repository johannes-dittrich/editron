# 02 — Auth & Database

## Goal
Users can sign up, sign in, and have their data stored in Postgres.

Stack is locked: **Better-Auth + Drizzle ORM + Neon Postgres**.

---

## Schema (V0)

Drizzle tables in `packages/db/src/schema/`:

### `users`
- `id`            uuid primary key
- `email`         text unique not null
- `emailVerified` timestamptz
- `name`          text
- `image`         text
- `plan`          text default `'free'` ('free' | 'creator' | 'studio')
- `stripeCustomerId`    text
- `createdAt`     timestamptz not null default now()
- `updatedAt`     timestamptz not null default now()

### `sessions`
Owned by Better-Auth. Table + `account`, `verification` as the library dictates.

### `oauth_accounts`
Managed by Better-Auth.

### `projects`
- `id`          uuid primary key
- `userId`      uuid not null references users(id) on delete cascade
- `title`       text not null
- `brief`       text                       — the user's plain-English brief from the context screen
- `briefAudioKey`  text                    — optional R2 key if the brief was a voice memo
- `referenceKey`   text                    — R2 key for the reference video
- `status`      text default `'draft'`     ('draft' | 'ingesting' | 'ready' | 'archived')
- `createdAt`   timestamptz not null default now()
- `updatedAt`   timestamptz not null default now()

### `uploads`
- `id`           uuid primary key
- `projectId`    uuid not null references projects(id) on delete cascade
- `kind`         text not null     ('source' | 'reference' | 'brief_audio')
- `r2Key`        text not null
- `sizeBytes`    bigint
- `contentType`  text
- `status`       text default `'pending'`  ('pending' | 'uploaded' | 'processed' | 'failed')
- `multipartUploadId`  text                — set during active multipart upload
- `createdAt`    timestamptz not null default now()

### `transcripts`
- `id`         uuid primary key
- `uploadId`   uuid not null references uploads(id) on delete cascade
- `words`      jsonb not null               — ElevenLabs Scribe word-level output
- `durationS`  numeric(10, 3)
- `language`   text
- `createdAt`  timestamptz not null default now()

### `edls`
- `id`         uuid primary key
- `projectId`  uuid not null references projects(id) on delete cascade
- `version`    int not null default 1
- `payload`    jsonb not null               — full EDL spec (sources, ranges, grade, overlays, subtitles)
- `approved`   boolean default false
- `createdAt`  timestamptz not null default now()

### `renders`
- `id`         uuid primary key
- `edlId`      uuid not null references edls(id) on delete cascade
- `status`     text default `'queued'` ('queued' | 'extracting' | 'concat' | 'overlays' | 'subtitles' | 'loudnorm' | 'done' | 'failed')
- `r2Key`      text                         — output key once done
- `durationS`  numeric(10, 3)
- `errorText`  text
- `createdAt`  timestamptz not null default now()
- `finishedAt` timestamptz

---

## Tasks

### 1 — Init packages/db
- [ ] `pnpm --filter @editron/db add drizzle-orm drizzle-kit pg`
- [ ] `packages/db/src/client.ts` exports a `postgres` client + `db` Drizzle instance from `DATABASE_URL`
- [ ] `packages/db/drizzle.config.ts` with `schema: './src/schema/*', out: './drizzle'`
- [ ] `pnpm --filter @editron/db run db:push` works against Neon

### 2 — Write the schema
- [ ] Tables above as Drizzle definitions. Relations linked.
- [ ] Foreign keys with ON DELETE CASCADE where appropriate.
- [ ] Types exported from `packages/shared` so apps/web can consume them.

### 3 — Wire Better-Auth
- [ ] `apps/api/src/auth.ts` with Better-Auth + Drizzle adapter pointing at the schema tables
- [ ] Email/password + GitHub provider
- [ ] Session cookie config: `secure: NODE_ENV === 'production'`, SameSite lax, HttpOnly
- [ ] `POST /api/auth/*` route handler (Fastify plugin) mounts Better-Auth's handler

### 4 — Projects CRUD
- [ ] `GET /api/projects` — list projects for the current user (row-level via session)
- [ ] `POST /api/projects` — create (title only; brief + reference + source come later in the flow)
- [ ] `GET /api/projects/:id` — single project with uploads + latest EDL joined
- [ ] `PATCH /api/projects/:id` — rename, update brief, mark archived
- [ ] `DELETE /api/projects/:id` — cascade deletes uploads / transcripts / edls / renders
- [ ] All routes enforce `userId === session.userId`

### 5 — Tests
- [ ] Integration tests against an ephemeral Neon branch (or a throwaway Postgres via docker-compose): sign up → create project → delete account → rows gone

---

## Notes

- **No ORM migrations from code paths that run in production.** `db:push` is for dev; CI runs `drizzle-kit migrate` in a one-shot job before deploy. DevOps agent owns that.
- **Neon branches** — each staging env gets its own Neon branch via the Neon API. Lets us iterate on schema changes without stomping prod. Ownership: devops.
- **Row-level security** — we enforce at the API layer via session-bound queries. We do not use Postgres RLS yet (Neon supports it, might revisit).
- **Plan flag** — the `plan` column is the source of truth for usage limits. Stripe webhook updates it. See `plans/11-billing-and-plans.md`.
