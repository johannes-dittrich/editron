# QA Agent — Work Queue

You are the `qa` agent. Read this file at the start of every tick.
Pick the **first unchecked item**. Do it. Check it off when the PR
is open with label `ready`.

Branch convention: `test/<scope>`, always forked FRESH from
`origin/feature/web-app`.

You are adversarial by design. Test what the other agents didn't
think to test. When a test fails because of a real bug, file an
issue with the appropriate track label — never fix production code
yourself.

---

## Milestone M2 — Coverage audit + CI gates

### M2.0 — Test-coverage audit
- [ ] Walk every `apps/api/src/**`, `apps/web/src/**`, `packages/*/src/**`
  file and cross-reference against `apps/api/src/__tests__/`,
  `apps/web/e2e/`, and any other test directories. Produce
  `tests/COVERAGE.md` listing:
  - Covered: files that have at least one test
  - Partially covered: files where the test exists but skips error
    paths or edge cases
  - Uncovered: files with zero tests
  For each uncovered or partial item, add a one-line note on what the
  first missing test would be. Open this as the first PR.

### M2.1 — CI gate wiring
- [ ] Update `.github/workflows/ci.yml` so it runs the full pipeline
  on every push and PR: `pnpm install --frozen-lockfile`,
  `pnpm lint`, `pnpm type-check`, `pnpm test`, `pnpm build`. Use
  turbo so it runs across the whole monorepo. Cache `~/.pnpm-store`
  and the turbo cache.
- [ ] Add a second job that runs Playwright e2e against the just-
  built app using `pnpm --filter @editron/web test:e2e`. Cache
  Playwright browsers. Upload the `playwright-report/` as an
  artifact on failure.
- [ ] Fail-fast: if lint or type-check fails, don't run tests.
- [ ] Document the required PR status checks in a repo note so the
  human can configure branch protection in GitHub settings.

### M2.2 — Backend integration tests against real infrastructure
- [ ] `apps/api/src/__tests__/integration/auth-real.test.ts`: sign up
  with email/pw, sign in, fetch `/api/me`, delete account. All against
  a real Neon branch (use the Neon API to create a throwaway branch
  per test run; tear it down after). Assert cookies are HttpOnly +
  SameSite=Lax.
- [ ] `apps/api/src/__tests__/integration/uploads-real.test.ts`:
  initiate multipart → upload 3 parts directly to R2 → complete →
  verify the object exists under a `test/` prefix → cleanup.
- [ ] `apps/api/src/__tests__/integration/audio-extract-real.test.ts`:
  use `ffmpeg -f lavfi -i "sine=frequency=440:duration=30"` to generate
  a 30s WAV, upload it as a fake "video", run the audio-extract worker
  end-to-end, verify the Scribe transcript persists with the expected
  word count (Scribe returns `()` audio events for tones — assert that
  instead of real words).

### M2.3 — Frontend e2e against staging
- [ ] `apps/web/e2e/staging/v4-landing.spec.ts`: visits the V4 landing
  on the staging URL passed via `STAGING_URL` env var, asserts the
  hero headline text, the editron logo is visible, the "Try for free"
  button exists and navigates to `/signup`, every section has its
  eyebrow label, and the alternating bg-paper / bg-white pattern
  holds (check computed background colors of each section).
- [x] `apps/web/e2e/staging/full-flow.spec.ts`: sign up → create
  project → upload a fixture video → verify the ingest row appears
  → verify the rotating ingest messages change every 2.5 s.
- [ ] Wire the e2e job in CI to run against the production Azin URL
  on `main` merges only (not on PR runs — too slow and flaky for the
  PR gate).

### M2.4 — Wizard corner cases
- [ ] Playwright test: wizard with all three steps skipped — project
  still created, lands on empty project page
- [ ] Playwright test: voice memo permission denied — textarea still
  works, advance button still enabled
- [ ] Playwright test: drag a `.jpg` into the source drop zone — toast
  appears, no upload starts
- [ ] Playwright test: refresh mid-upload at 40% — resume banner
  appears, upload continues

### M2.5 — Render pipeline hard-rules tests
For every hard rule in `video-use-main/SKILL.md`, write a
characterization test in `apps/api/src/__tests__/render/`:

- [ ] Rule 1 — subtitles applied LAST: build an EDL with overlays
  and subtitles, inspect the generated filter_complex string, assert
  the `subtitles` filter comes after every `overlay` filter.
- [ ] Rule 2 — per-segment extract then lossless concat: assert the
  render-seg worker produces per-segment files and the concat worker
  uses `ffmpeg -f concat -c copy`, NOT a single filter graph.
- [ ] Rule 3 — 30ms audio fades at boundaries: assert every segment
  ffmpeg command includes `afade=t=in:st=0:d=0.03` and a matching
  `afade=t=out` anchored to `dur - 0.03`.
- [ ] Rule 4 — overlays PTS-shifted: assert every overlay command
  includes `setpts=PTS-STARTPTS+` with the correct offset.
- [ ] Rule 5 — master SRT output-timeline offsets: unit test the SRT
  generation with a 3-segment EDL where the source timestamps are 5,
  20, 45 seconds and assert the SRT output times are 0, 8, 17.
- [ ] Rule 6 — word-boundary snapping: try to emit an EDL with cut
  times that fall mid-word, assert validation rejects it.
- [ ] Rule 7 — padding 30-200ms: characterize the padding logic.
- [ ] Rule 8 — word-level ASR only: assert the transcribe worker
  never sends `timestamps_granularity=phrase`.
- [ ] Rule 9 — transcript caching: upload the same fixture twice,
  assert Scribe is hit exactly once and the second upload reuses the
  cached transcript.
- [ ] Rule 10 — parallel animations: characterize the BullMQ job
  dispatch for multiple overlays, assert they're enqueued in the
  same tick (not sequential).
- [x] Rule 11 — strategy confirmation before execution: assert the
  text-to-edit endpoint refuses to emit an EDL without a prior
  approved strategy. NOTE: NOT ENFORCED — filed #42.
- [x] Rule 12 — all outputs under user's project prefix: assert the
  R2 key pattern for every upload and render output.

### M2.6 — Quota + billing adversarial tests
- [x] Stripe webhook signature verification: send a webhook with a
  bad signature, assert 400.
- [x] Quota downgrade mid-render: tested plan upgrade/downgrade quota
  transitions. Full mid-render test blocked — no render queue quota
  gate integrated yet.
- [x] Free-tier user hits 10 minute cap: enqueue 11 minutes worth of
  renders, assert the 11th is rejected with 402.
- [x] Stripe checkout returns a valid session URL for each plan:
  tested adversarial inputs (empty, free, SQL injection). Real Stripe
  checkout blocked — no STRIPE_CREATOR_PRICE_ID configured.
  Found bug: planFromPriceId("") returns "creator" — filed #46.

---

## Rules

- **Always append to STATUS.md** at the end of each tick:
  `<iso-timestamp> qa <what-you-did> <PR url or "no-op">`
- **Small PRs.** One scope per PR. Don't bundle M2.5 rule-1 and
  rule-2 in the same PR.
- **If blocked**, write a one-line note at the top of this file under
  `## Blocked` and move to the next unblocked item.
- **When a test catches a bug**, open an issue with the relevant
  track label, reference the failing test, and mark the test
  `.skip()` with a link to the issue. Don't touch production code.

## Blocked
(none yet)


---

## Milestone M3 — MVP Verification (see plans/15-mvp-deploy.md)

### M3.6 — End-to-end smoke test against real infrastructure
- [ ] Read `COORDINATION.md` §api-url-available AND look for a `frontend wired to real api` entry in §archive. If either is missing, write a blocker under `## qa inbox` and exit the tick. Otherwise continue.
- [ ] Playwright test in `apps/web/e2e/staging/mvp-smoke.spec.ts` that runs against `process.env.STAGING_URL` (default: the production web URL):
  1. Navigate to `/signup`, fill a random test email + password, submit. Expect redirect to `/dashboard`.
  2. Click "New project". Enter a title. Paste a YouTube URL as the reference. Next.
  3. Brief: "a test clip for the mvp smoke test". Next.
  4. Step 3: drop `test-fixtures/10s-colorbars.mp4` (generate via ffmpeg in a `beforeAll` if absent). Wait for the upload row to reach 100%. Click "Open project".
  5. On `/projects/[id]`, wait up to 90 seconds for at least one upload to transition from `ingesting` to `ready`.
  6. Open the transcript side panel. Assert at least one word span is visible.
  7. Click a word span to mark a cut. Verify the selection UI updates.
  8. Click "Render preview". Wait up to 120 seconds for a downloadable mp4 URL to appear.
  9. HEAD the URL to confirm it's reachable.
- [ ] After the test passes, append an entry to `COORDINATION.md §archive`: `MVP smoke test green against <url>`.
- [ ] If the test fails, open a GitHub issue with the appropriate track label (`backend`, `frontend`) and a one-paragraph reproduction. Mark the test `.skip()` with the issue number.

### M3.7b — QA adversarial tests for V0
- [x] signup-with-existing-email returns 409 in the UI
- [x] upload a 1 KB file, verify the drop zone rejects it before the api is called
- [x] refresh the page mid-upload, verify the "resume" banner appears
  NOTE: covered in M2.4 (PR #40), resume NOT implemented (#39)
- [x] quota-exceeded: mock the user plan to "free" with 10 used minutes, try to render, expect 402
  NOTE: covered in M2.6 (PR #47)
- [x] visit `/projects/[id]` with a deleted project id, expect 404 redirect to dashboard
