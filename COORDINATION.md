# COORDINATION.md

Cross-track message board. Every agent reads this at the start of
every tick and **writes** to it when they finish a task that affects
another track, or when they're blocked waiting on another track.

## How to use

- **At the start of every tick**: read this file. Look at the section
  for your track (blocked items, pending inputs from others).
- **When you finish a task that unblocks another track**: append a
  message under that track's section with the form:
  ```
  - [YYYY-MM-DDTHH:MM:SSZ from=<your-track>] <what you unblocked>
  ```
- **When you are blocked waiting on another track**: append a message
  under your own section. Once the other track delivers, they move
  the message to a "resolved" list below.
- **Never delete messages**. Move resolved ones to the "archive" at
  the bottom instead. This is the team's audit trail.

## Sections

Each track has two sections: `inbox` (things pending from others) and
`outbox` (things you promised and will deliver). Keep both short.

---

## backend inbox
(messages waiting on backend from other tracks)

## backend outbox
(things backend has promised to deliver)

- [2026-04-15 from=human] Deploy apps/api as a second Azin service.
  Required for frontend/M3.4, qa/M3.6. See PLAN.md §Phase 1.5.

---

## frontend inbox
(things frontend needs from others before proceeding)

- [2026-04-15 from=human] WAITING ON backend/M3.2 to publish the api
  service URL. Frontend/M3.4 cannot proceed until the api URL is
  known. Once backend appends the URL under "api-url-available",
  frontend wires NEXT_PUBLIC_API_URL and disables MSW.

## frontend outbox
(things frontend has promised to deliver)

- [2026-04-15 from=human] Wire web/apps to use NEXT_PUBLIC_API_URL
  when set. Required for qa/M3.6 smoke tests.

---

## qa inbox
(things qa needs from others before proceeding)

- [2026-04-15 from=human] WAITING ON backend/M3.2 (api URL) AND
  frontend/M3.4 (real-api flag flipped) before M3.6 end-to-end tests
  can run. Start with M2.x items in the meantime.
- [2026-04-15T20:40:00Z from=qa] M3.6 BLOCKED: §api-url-available is
  empty and no "frontend wired to real api" entry in §archive. M2
  milestone complete — proceeding with M3.7b adversarial tests instead.

## qa outbox
(things qa has promised to deliver)

---

## api-url-available

- [2026-04-15T23:30Z from=human-in-the-loop] **api is live**
  - web URL: https://web-production-8c8f.4631dc.up.azin.host
  - api URL: https://api-production.4631dc.up.azin.host
  - api health: `GET /api/health` returns `{status:ok, db:ok}`
  - CORS_ORIGIN env var is set to the web URL on the api service
  - frontend M3.4: set `NEXT_PUBLIC_API_URL=https://api-production.4631dc.up.azin.host` and `NEXT_PUBLIC_USE_REAL_API=true` on the web service, update fetch helpers to read NEXT_PUBLIC_API_URL, disable MSW in prod
  - qa M3.6: smoke test against https://web-production-8c8f.4631dc.up.azin.host, api as backend

---

## archive
(resolved items from all tracks, most recent first)
