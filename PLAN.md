# Editron — AI Video Editing, Conversation-First

## Vision

A professional AI video editor that edits by conversation. You drop raw
footage in, describe what you want in plain English, and Editron produces a
cut. Audio is primary, visuals follow. The first editorial decisions happen
on the transcript — because that's where they should.

Monetization: **free tier to try, subscription via Stripe for production
use**. No waitlist.

---

## Core user flow (as of 2026-04-15)

1. **Sign up** — Better-Auth email/password or GitHub OAuth. Lands in the
   dashboard with a free-tier quota.
2. **New project — the context screen.** Before the user uploads their
   rough footage, Editron asks for:
   - A **reference video** in the style/tone they want to match
     (optional but strongly encouraged)
   - A **brief** — voice memo or text — describing what the video is
     about, who it's for, how it should be structured, and what the
     "ship" criterion is
   - The **source footage** — the raw, unedited clips
3. **Strategy step.** Editron transcribes (audio-first, via ElevenLabs
   Scribe), reads the brief, inspects the reference video's pacing /
   structure, and proposes a shape in four to eight sentences. User
   confirms, iterates, or redirects. **No edits happen before
   confirmation.**
4. **Cut + iterate.** Editron produces a 720p preview. The user iterates
   in plain English — "tighten the hook", "warmer grade", "lose the last
   shot". Render pipeline obeys the SKILL.md hard rules.
5. **Export.** Final 1080p/4K render on `ship`. Download or push to the
   user's destination.

## Architecture

```
┌──────────────┐  signed multipart  ┌────────────────┐
│ apps/web     │───────────────────▶│ Cloudflare R2  │  raw source, 1x, durable
│ Next.js 14   │◀───────────────────│ editron-media  │  WEUR jurisdiction
└───────┬──────┘   HLS proxy read   └────────┬───────┘
        │ REST / WS                          │ HTTP Range
        ▼                                    ▼
┌──────────────────┐  Drizzle   ┌─────────────────────────┐
│ apps/api         │──▶────────▶│ Neon Postgres           │
│ Fastify          │◀──────────◀│ users, projects, uploads│
└───────┬──────────┘            │ transcripts, edls, renders│
        │ BullMQ                 └─────────────────────────┘
        ▼
┌──────────────────────────────────────────────────────┐
│ workers (Node + ffmpeg + OpenAI + ElevenLabs)       │
│  audio-extract → scribe → probe → proxy → ai-edit   │
│         → grade → render → loudnorm → upload        │
└──────────────────────────────────────────────────────┘
```

---

## Phases

### Phase 0 — Harness (done)
- Agent harness with Telegram chat, approval loop, merger, staging per
  branch, audio note transcription. See `AGENTS.md`.
- Production landing page live on Azin, fallback on boxd proxy.

### Phase 1 — Foundation (V0)
- **Auth**: Better-Auth wired to Neon Postgres. Email/password + GitHub.
- **Projects CRUD**: create, list, delete projects per user.
- **Uploads**: Cloudflare R2 multipart signed URLs, upload records in DB.
- **Landing page + pricing**: 3 design variants live on staging, user
  picks one, becomes the single landing page.
- **Stripe**: Checkout session → subscription → webhook → plan flag on
  the user row.

### Phase 2 — Core video engine
- **Audio-first extraction**: BullMQ worker uses HTTP Range requests to
  pipe the audio stream out of R2 into ffmpeg, never downloading the
  full file. Mono 16kHz WAV to ElevenLabs Scribe.
- **Transcript storage**: word-level JSON in Postgres (JSONB column).
- **Proxy generation**: 720p HLS segments on demand, not on upload.
- **EDL format** and per-segment extract → lossless concat pipeline.
- **Render pipeline**: obeys all 12 hard rules from `video-use-main/SKILL.md`.

### Phase 3 — AI reasoning layer
- **Text-to-edit**: OpenAI `gpt-5.4` with structured tool calls → EDL
  JSON. Reads the transcript + brief + reference-video style notes.
- **AI-subtitles**: Scribe is the primary path, Whisper is fallback.
  2-word UPPERCASE style for short-form, sentence case for long-form.
- **AI-color**: auto-grade per segment from the actual frame stats
  (`grade.py` philosophy), not presets.

### Phase 4 — Collaboration & business
- Team workspaces, shared project memory.
- Real-time collaboration on an edit (WebSocket).
- Usage tracking per plan, overage handling.

### Phase 5 — Public launch
- `editron.video` custom domain.
- Marketing site hardening.
- Analytics (PostHog), error tracking (Sentry).
- Public API + webhooks.

---

## Tech stack (locked)

| Layer | Pick | Why |
|---|---|---|
| Frontend | Next.js 14 App Router, TypeScript, Tailwind, shadcn/ui, Framer Motion, hls.js, react-virtual, Canvas2D | Monorepo-friendly, SSR + streaming, all defaults |
| Backend | Fastify on Node 20, Drizzle ORM, Zod | Faster than Express, Drizzle is SQL-first (no codegen step), Zod for boundary validation |
| Database | Neon Postgres (us-east-1 for now) | Free tier generous, serverless, branch-per-env friendly |
| Auth | Better-Auth | Self-hosted, TS-native, no vendor lock, free |
| Storage | Cloudflare R2 (WEUR, bucket `editron-media`) | Zero egress fees, S3-compatible, cheap |
| Queue | BullMQ on Redis (local Docker dev, Upstash prod) | Standard for Node video pipelines |
| Video | ffmpeg (system binary, no wasm in browser) | The truth |
| STT | ElevenLabs Scribe primary, Whisper fallback | Word-level verbatim, speaker diarization, audio events |
| LLM reasoning | OpenAI `gpt-5.4` | Good structured tool calls, we have the key |
| Payments | Stripe Checkout + customer portal | Standard |
| Hosting | Azin (`@azin-tech/cli`) | Already wired, auto-deploy from `johannes-dittrich/editron:main` |
| CDN | Azin's built-in Google Cloud CDN | Already enabled on the web service |
| Monitoring | Sentry + PostHog | Phase 5 |

---

## Step-by-step plans

See `plans/`:

1. [01-infrastructure.md](./plans/01-infrastructure.md)
2. [02-auth-and-database.md](./plans/02-auth-and-database.md)
3. [03-storage-and-upload.md](./plans/03-storage-and-upload.md)
4. [04-video-engine.md](./plans/04-video-engine.md)
5. [05-timeline-editor.md](./plans/05-timeline-editor.md)
6. [06-ai-scene-detection.md](./plans/06-ai-scene-detection.md)
7. [07-ai-subtitles.md](./plans/07-ai-subtitles.md)
8. [08-ai-text-to-edit.md](./plans/08-ai-text-to-edit.md)
9. [09-ai-effects-grading.md](./plans/09-ai-effects-grading.md)
10. [10-export-render.md](./plans/10-export-render.md)
11. [11-billing-and-plans.md](./plans/11-billing-and-plans.md)
12. [12-collaboration.md](./plans/12-collaboration.md)
13. [13-marketing-site.md](./plans/13-marketing-site.md)
14. [14-analytics-monitoring.md](./plans/14-analytics-monitoring.md)
15. [15-api-and-integrations.md](./plans/15-api-and-integrations.md)

### Per-agent work queues

Each agent pulls from its own task list. The planner (me + you) feeds
tasks into these files; the agents execute and check them off.

- [`plans/tasks/backend.md`](./plans/tasks/backend.md)
- [`plans/tasks/frontend.md`](./plans/tasks/frontend.md)
- [`plans/tasks/qa.md`](./plans/tasks/qa.md)
- [`plans/tasks/growth.md`](./plans/tasks/growth.md)
- [`plans/tasks/devops.md`](./plans/tasks/devops.md)

---

## Keys & access

See [KEYS_NEEDED.md](./KEYS_NEEDED.md) — all Phase 1 keys are provided
and stored in `~/.config/editron/secrets.env` on the orchestrator VM.

---

## Status

- [x] Phase 0 — Harness (Telegram chat, orchestrator, merger, staging)
- [ ] Phase 1 — Foundation (auth, projects, uploads, landing, Stripe)
- [ ] Phase 2 — Core video engine
- [ ] Phase 3 — AI reasoning layer
- [ ] Phase 4 — Collaboration & business
- [ ] Phase 5 — Public launch
