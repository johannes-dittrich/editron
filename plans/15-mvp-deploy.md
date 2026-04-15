# Phase 1.5 — MVP Deploy

**Goal**: close the loop from signup → upload → Scribe transcript →
simple cut → download. Everything built, nothing is live yet.

## What exists but isn't deployed

- `apps/api` (Fastify + Drizzle + Better-Auth + BullMQ workers): code
  fully on `feature/web-app`, tests passing, never deployed to Azin
- Neon Postgres schema: pushed earlier, all tables exist
- R2 bucket `editron-media`: exists, tested from the shell
- Upstash Redis: provisioned, TLS endpoint verified
- Stripe test keys: saved, verified
- OpenAI, ElevenLabs: already in use elsewhere

## What needs to happen

1. **Dockerfile for `apps/api`**: single-stage node 20 build, runs both
   the Fastify server and the BullMQ workers in one process (for V0,
   scale them apart later).
2. **New Azin App service `api`**: forked into the same production
   environment next to `web`. HTTP on 8080, public, CDN off (API doesn't
   benefit from caching). Env vars: `DATABASE_URL`, `REDIS_URL`, R2
   creds, `STRIPE_*`, `OPENAI_API_KEY`, `ELEVENLABS_API_KEY`,
   `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`.
3. **Custom domain or subpath for api**: either a subdomain
   `api.4631dc.up.azin.host` (Azin allocates it automatically for
   public endpoints) or route `web` via reverse-proxy. Start with the
   allocated domain, don't fight routing now.
4. **Schema migration**: re-run `pnpm --filter @editron/db drizzle:push`
   against prod Neon to make sure every table matches the current
   schema.
5. **`web` env**: set `NEXT_PUBLIC_API_URL=<api url>` and
   `NEXT_PUBLIC_USE_REAL_API=true`. Rebuild. MSW turns off at runtime.
6. **Stripe webhook registration**: create a new endpoint in the
   Stripe dashboard pointed at `<api url>/api/billing/webhook`, copy
   the signing secret, add it to `~/.config/editron/secrets.env` on
   the orchestrator VM and to the Azin `api` env vars.
7. **End-to-end smoke test**: sign up in the browser, create a
   project with a 30-second fixture video, wait for the transcript,
   select a word or two to delete, render, download the mp4. Do it as
   a human once, then let qa automate it.

## Non-goals for MVP

- Text-to-edit AI. User trims by hand in the editor.
- Overlay animations (Manim / Remotion).
- Subtitle burn-in. SRT download only.
- Voice-memo brief. Text brief only.
- Stripe checkout live mode.

## Milestones

### M3.1 (backend) — Dockerfile for apps/api
Single stage, node 20, builds `@editron/api` + deps, starts with
`pnpm --filter @editron/api start`. Health check at `GET /api/health`.
Exposes 8080.

### M3.2 (devops-style, still backend agent) — Azin service create
Use `zin service create app` with the monorepo + `--dockerfile api/Dockerfile --build-context .`.
Set every required env var via `zin service set env`. Enable public
endpoint on HTTP/8080.

### M3.3 (backend) — Schema + secrets wiring
Run `drizzle:push` against `DATABASE_URL`, fix any drift. Bind the
Stripe secret, Scribe key, R2 creds, Redis URL, OpenAI key to the
service. Test `GET /api/health` returns `{db: "ok", redis: "ok"}`.

### M3.4 (frontend) — Wire web to real api
Add `NEXT_PUBLIC_API_URL` env var support. MSW gated on
`NEXT_PUBLIC_USE_REAL_API !== "true"`. Update the fetch base URL in
the auth / projects / uploads client code to use `NEXT_PUBLIC_API_URL`
when set. Deploy web with the real flag on.

### M3.5 (backend) — Stripe webhook endpoint
Register a webhook pointing at `<api url>/api/billing/webhook` in the
Stripe test dashboard. Add `STRIPE_WEBHOOK_SECRET` to the api env.
Test with a `checkout.session.completed` event from the Stripe CLI.

### M3.6 (qa) — MVP smoke test
Playwright against the real staging URL: sign up → create project →
upload a 10-second fixture → wait for transcript row → click a word
to mark a cut → render → download. All real infra, no mocks.

### M3.7 (all tracks) — Error path tests
qa writes adversarial tests:
- signup with an email that already exists
- upload a 1 KB file that isn't a video
- render before transcription finishes
- quota exceeded (mock the user's usage to 10+ minutes)

---

Backend picks M3.1–M3.3 + M3.5. Frontend picks M3.4. QA picks M3.6–M3.7.
All three agents must coordinate via `COORDINATION.md` — backend
publishes the api url once deployed, frontend reads it to wire
`NEXT_PUBLIC_API_URL`, qa reads both to point its smoke tests.
