# 04 — Video Engine

## Goal
Turn an EDL (cut decisions) into a rendered video that obeys every hard
rule from `video-use-main/SKILL.md`. The engine runs as BullMQ workers
that stream bytes from R2 via Range requests instead of downloading
full source files.

## The hard rules (cross-reference)

Copied verbatim from `video-use-main/SKILL.md` because they are
load-bearing:

1. Subtitles are applied **last** in the filter chain.
2. Per-segment extract → lossless `-c copy` concat. No single-pass filtergraph.
3. 30 ms audio fades at every segment boundary.
4. Overlays use `setpts=PTS-STARTPTS+T/TB` to shift frame 0 to the window start.
5. Master SRT uses output-timeline offsets.
6. Never cut inside a word.
7. Pad every cut edge (30–200 ms working window).
8. Word-level verbatim ASR only (ElevenLabs Scribe primary).
9. Cache transcripts per source.
10. Parallel sub-agents for multiple animations.
11. Strategy confirmation before execution.
12. All session outputs under the user's project prefix in R2.

---

## Pipeline

```
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ audio-extract│──▶│ transcribe   │──▶│ proxy-gen    │──▶│ ready        │
│ (on upload)  │   │ (Scribe)     │   │ (on demand)  │   │              │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
                                                                │
                                                                ▼
┌──────────────┐   ┌──────────────┐   ┌──────────────┐   ┌──────────────┐
│ render-seg   │──▶│ render-concat│──▶│ render-final │──▶│ loudnorm     │
│ (per range)  │   │ (lossless)   │   │ (overlays+sub)│   │ (2-pass)    │
└──────────────┘   └──────────────┘   └──────────────┘   └──────────────┘
```

Queues: `audio-extract`, `transcribe`, `proxy-gen`, `render-seg`,
`render-concat`, `render-final`, `loudnorm`.

## Tasks

### 1 — Queue infrastructure
- [ ] `apps/api/src/queue/index.ts` exports typed BullMQ queues + workers
- [ ] Local dev: `docker-compose.yml` starts Redis 7
- [ ] Staging/prod: Upstash Redis (needs `UPSTASH_REDIS_URL` in secrets)
- [ ] Graceful shutdown on SIGTERM
- [ ] Failed jobs retained for 1h, successful for 10min

### 2 — Render-seg worker
- [ ] Per EDL range, runs `ffmpeg` as a child process
- [ ] Reads source via S3 GetObject stream piped on stdin where possible, else Range-request chunks
- [ ] Applies per-segment grade filter (see `plans/09-ai-effects-grading.md`)
- [ ] Adds 30ms audio fades at boundaries
- [ ] Writes output to a temp path, then uploads to R2 as a seg file
- [ ] Records progress + duration to the `renders` row

### 3 — Render-concat worker
- [ ] Downloads seg files from R2 into a tmp dir (these are small)
- [ ] ffmpeg concat demuxer (lossless) → `base.mp4`
- [ ] No re-encode

### 4 — Render-final worker (overlays + subtitles)
- [ ] Fetches overlay assets (already rendered animations from `render-animations`)
- [ ] Composites using `overlay=enable='between(t,...)'` filter chain with PTS shift
- [ ] Applies subtitles via `subtitles` filter **last**
- [ ] Uses Scribe transcript to generate master.srt with output-timeline offsets

### 5 — Loudnorm worker
- [ ] Two-pass ffmpeg loudnorm (pass 1 measures, pass 2 normalizes)
- [ ] Targets: `-14 LUFS -1 dBTP LRA 11` (social-ready)
- [ ] Uploads final to R2 at `renders/{edlId}/final.mp4`
- [ ] Marks `renders` row status `done`, sets `r2Key` and `finishedAt`

### 6 — Proxy-gen (on demand, not upload)
- [ ] Triggered when the user first opens the timeline editor
- [ ] ffmpeg → HLS with 2s segments, 720p, CRF 26
- [ ] Uploads playlist + segments to `proxies/{uploadId}/`
- [ ] Player reads them via signed URL

### 7 — Animations (parallel)
- [ ] `animate-pil`, `animate-manim`, `animate-remotion` are queue names; each takes a slot definition from an EDL and produces a single `render.mp4`
- [ ] Spawned in parallel when an EDL has overlays — total wall time = slowest one
- [ ] Matches the "parallel sub-agents" rule from SKILL.md

### 8 — Cancellation + cleanup
- [ ] Each worker checks a Redis key `job:{id}:cancelled` every N frames/chunks; aborts cleanly if set
- [ ] Temp dirs under `/tmp/editron/<jobId>/` are always wiped at the end

---

## Notes

- **Workers run on the API service for V0.** Scaling workers to dedicated
  boxes comes later (Phase 2.5 or 3).
- **ffmpeg presets**: draft (720p CRF 28, fast), preview (1080p CRF 22), final (1080p/4K CRF 18). Renders default to `preview` until the user taps ship.
- **Temp disk**: workers write to local tmpfs (`/tmp`). We need to make sure the VM has enough tmpfs for a 5-min 1080p render (~500 MB). The devops plan covers disk provisioning.
- **Progress events** go to a Redis pub/sub channel; the API relays them over WS to the browser. No polling.
