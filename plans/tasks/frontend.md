# Frontend Agent — Work Queue

You are the `frontend` agent. Read this file at the start of every tick.
Pick the **first unchecked item**. Do it. Check it off when the PR is
open with label `ready`. The merger loop handles merging after human
approval via Telegram.

Branch convention: `feat/fe-<scope>`, always forked FRESH from
`origin/feature/web-app`. One PR per scope.

**Before you edit any UI**, re-read `plans/design-system.md` and commit
to the hard-check list. Every PR must pass it.

---

## Milestone V0 — Foundation

### M1.0 — Design system wiring
- [x] Install shadcn/ui CLI, init with the design-system's Tailwind
  tokens (paper, ink, ink-soft, ink-dim, paper-alt, line, accent,
  accent-dark). Scaffold these primitives from shadcn: `button`, `card`,
  `dialog`, `input`, `label`, `textarea`. Do NOT install all
  primitives — add on demand.
- [x] Update `apps/web/tailwind.config.ts` to match `plans/design-system.md`
  exactly (fontFamily, colors, letterSpacing). Update
  `apps/web/src/app/globals.css` to declare the CSS custom properties
  and reset body background/color.
- [x] Load Fraunces + Inter + JetBrains Mono via `next/font/google` in
  `apps/web/src/app/layout.tsx` with `--font-serif`, `--font-sans`,
  `--font-mono` variables.
- [x] Add a `.storybook`-free sanity page at
  `apps/web/src/app/design/page.tsx` that renders one of each primitive
  at the sizes from the design system, just for visual regression.
- [x] Playwright smoke test: `/design` renders, all primitives are
  visible, no console errors.

### M1.1 — Land V4 as the canonical landing
- [x] Copy `apps/web/src/app/page.tsx`, `apps/web/src/app/globals.css`,
  `apps/web/src/app/layout.tsx`, and `apps/web/tailwind.config.ts` from
  the `staging/fe-landing-v4` branch into `agent/frontend` (via
  `git show staging/fe-landing-v4:apps/web/src/app/page.tsx > ...`).
- [x] Verify the page renders, lint and type-check pass, `pnpm build`
  succeeds.
- [x] Run `scripts/stage.sh feat/fe-land-v4` and verify the staging URL
  is visually identical to
  https://web-staging-v-8e69.4631dc.up.azin.host/.
- [x] Playwright e2e: load `/`, assert hero headline text,
  "Try for free" button links to `/signup`, pricing section has three
  plans, all internal anchor links work.

### M1.2 — MSW (Mock Service Worker) scaffold
- [x] `pnpm --filter @editron/web add -D msw`
- [x] `apps/web/src/mocks/handlers.ts` with mock handlers for every V0
  endpoint: `GET /api/me`, `GET /api/projects`, `POST /api/projects`,
  `GET /api/projects/:id`, `POST /api/uploads/initiate`,
  `POST /api/uploads/:id/part-url`, `POST /api/uploads/:id/complete`.
- [x] Fixtures in `apps/web/src/mocks/fixtures/` — a couple of projects,
  a couple of uploads at various progress states.
- [x] `apps/web/src/mocks/browser.ts` + `apps/web/src/mocks/node.ts`
  split for client vs test environments.
- [x] Gate behind `NEXT_PUBLIC_USE_REAL_API` env flag — when unset or
  `'false'`, MSW takes over; when `'true'`, the real API is used.

### M1.3 — Auth pages: /login and /signup
- [x] `/login`: email + password form, "Sign in with GitHub" button,
  "Forgot password" ghost link. Client component. Form validation with
  Zod. Better-Auth client SDK call to `POST /api/auth/sign-in`. On
  success redirect to `/dashboard`. On error inline message in the
  brand tone ("those credentials don't match — try again").
- [x] `/signup`: same shape with email + password + name. On success
  redirect to `/dashboard` with a small "welcome to editron" toast.
- [x] Layout follows `plans/design-system.md`: centered single-column,
  max-w-sm form, serif headline "Sign in." / "Create account.", small
  eyebrow above, pill primary CTA, ghost link to the other auth flow
  at the bottom.
- [x] MSW handlers for `POST /api/auth/sign-in` and `POST /api/auth/sign-up`
  return fixtures during dev.
- [x] Playwright e2e for both flows, including error states.

### M1.4 — Dashboard
- [x] `/dashboard` client component that fetches `GET /api/projects` and
  renders a grid of project cards. Each card: title, last updated, tiny
  thumbnail strip, status pill ("draft" / "ingesting" / "ready"). Cards
  link to `/projects/[id]`.
- [x] Empty state: if no projects, centered Fraunces serif headline
  "Your first cut is a tap away." with a big pill CTA "New project".
- [x] Loading state: skeleton grid of 6 blurry cards using the same
  border-t pattern as the pricing cards (no box-shadow, no rounded-xl).
- [x] Error state: inline banner with "couldn't load your projects. retry?"
- [x] Top bar: editron wordmark (serif italic), "New project" pill CTA
  top-right, user menu (avatar + dropdown with "Sign out" link).
- [x] Playwright e2e: loads, renders grid from MSW fixtures, empty state
  visible when fixtures return 0 projects, user menu opens and sign-out
  link works.

### M1.5 — Project creation wizard (the context flow)

This is the big one. Follow `plans/05a-project-context-flow.md` exactly,
screen by screen.

- [x] `/projects/new` client component with a 3-step wizard using
  `useReducer` for state. Project record is created at step 1 submit
  via `POST /api/projects`.
- [x] **Step 1** — title input + reference video drop zone. Both
  optional. Multipart upload kicked off in the background. Skip button
  and Next button both advance.
- [x] **Step 2** — textarea (autosized, 500 char soft limit) + voice
  memo recorder using `MediaRecorder`. Live waveform during recording,
  playback, delete+re-record. 2 minute cap. Mic permission denied →
  inline fallback message. Both fields allowed together.
- [x] **Step 3** — source footage multi-drop zone. Multipart upload
  queue concurrent 3. Per-file progress bars. Resumable on refresh via
  localStorage upload state. "Open project" button enabled once ≥1
  upload completes. Invalid file rejected at drop zone level.
- [x] Upload context provider wrapping the whole wizard so uploads
  survive step transitions and can be shown on subsequent routes.
- [x] MSW handlers simulate realistic upload progress (200ms chunks,
  pseudo-random jitter).
- [x] All error states match the table in
  `plans/05a-project-context-flow.md` — lowercase, calm, specific copy.

### M1.6 — Project detail page with ingesting state
- [x] `/projects/[id]` fetches `GET /api/projects/:id` and renders the
  project header + list of uploaded files.
- [x] Each upload row shows current status (`pending` / `uploaded` /
  `ingesting` / `ready` / `failed`) with a progress bar during
  `ingesting`.
- [x] **Rotating ingest messages**: a tiny React component that cycles
  through the 10 messages listed in `plans/05a-project-context-flow.md`
  §"The 'ingesting' state" every 2.5 s. Never repeats same message in a
  row. Pairs with a subtle waveform scan animation (CSS `animate-scan`
  on a horizontal gradient strip, left→right, 2.5s loop, ease in out).
- [x] Polling fallback every 2s for progress updates (WS deferred to
  when backend endpoint is available).
- [x] Transcript view: clicking "View transcript" on a `ready` row
  opens a side panel with the phrase-packed view (fetch
  `GET /api/uploads/:id/transcript`).
- [x] Playwright e2e: mock a project with 3 uploads at different
  states, verify rows render, verify ingest messages rotate, verify
  ready row has transcript link.

### M1.7 — Design regression baseline
- [x] Playwright visual regression test that captures the landing,
  login, signup, dashboard, new-project wizard, and project detail
  against staging, stored as baseline screenshots. QA uses these to
  spot accidental visual regressions.
- [x] Add a npm script `pnpm --filter @editron/web test:visual` that
  runs the regression suite.

---

## Milestone V1 — The editor (after V0 foundation ships)

_Populated after V0 merges. Covers the timeline editor UI: player,
transcript editor with cut-selection, chat panel, waveform, export
dialog. See `plans/05-timeline-editor.md` for the scope._

---

## Rules

- **Always append to `STATUS.md`** at the end of each tick:
  `<iso-timestamp> frontend <what-you-did> <link-to-pr>`
- **After opening each PR**, run
  `/home/boxd/editron/scripts/stage.sh <branch>` to deploy staging.
  Don't label `ready` until the staging deploy is green AND you've
  visually verified it.
- **Every PR goes through the design-system hard-check list** before
  getting `ready`.
- **Small PRs.** Split M1.5 and M1.6 if they get too big.
- **If blocked**, write a one-line note at the top of this file under
  a `## Blocked` section and move to the next unblocked item. Do not
  invent interfaces to unblock yourself — open a GH issue with the
  target track label and move on.
- **Copy**: use `{{GROWTH_PROVIDES}}` markers for missing marketing
  copy. V4 placeholder copy is fine to ship.

## Blocked
(none yet)


---

## Milestone M3 — MVP Wiring (see plans/15-mvp-deploy.md)

### M3.4 — Wire web to the real api
- [x] Read `COORDINATION.md` §api-url-available. If it is empty, write a blocker under `## frontend inbox` and exit the tick. If it has a URL, continue.
- [x] Add an `apps/web/src/lib/api-url.ts` helper that resolves the base URL from `process.env.NEXT_PUBLIC_API_URL`. When unset, default to an empty string (same-origin, which is what MSW expects).
- [x] Update every `fetch("/api/...")` call in auth forms, dashboard, wizard, and project detail to use the helper: `fetch(`${apiUrl()}/api/...`)`. Keep the paths relative so same-origin still works in dev.
- [x] Update `apps/web/src/components/msw-provider.tsx` to only start MSW when `process.env.NEXT_PUBLIC_USE_REAL_API !== "true"`.
- [x] Update the Azin `web` service env vars: `NEXT_PUBLIC_API_URL=<value from COORDINATION.md>`, `NEXT_PUBLIC_USE_REAL_API=true`. Trigger a redeploy via `git push` on the mirror branch or `zin deploy run -p editron -e production`.
- [x] After the web deploy goes active, append an entry to `COORDINATION.md §archive`: `frontend wired to real api at <url> · MSW disabled in prod` and a `resolved` note referencing the inbox item.
- [x] E2E sanity: open the production web URL in curl and verify a fetch against `<api-url>/api/health` works cross-origin (CORS must be configured on the api — if not, file a backend issue with label `backend` referencing M3.2).
