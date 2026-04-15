# 05a — Project Context Flow

## Goal
What happens between "User taps New Project" and "Editron starts cutting."

The Context Flow is a short conversation where the user tells Editron
what the video is about before any footage is processed. Everything is
**optional** — a power user who already knows what they want can skip
straight to uploading and still get a usable cut. Giving context just
makes the first pass better.

## Principle

**The strategy Editron proposes is only as good as the context it has.**
The flow should feel like a light warm-up chat, not a form. No required
fields, no "all-or-nothing" validation, no blocking on anything.

---

## Routes

| Route | Purpose |
|---|---|
| `/dashboard` | Project list. "New project" button. |
| `/projects/new` | Single-page wizard — 3 steps, no hard gating. |
| `/projects/[id]` | Project detail / editor shell (lands here after the wizard). |

The wizard uses client-side state (React state + `useRouter` pushes on
step change). Each step writes incrementally to `/api/projects` — the
project record exists from step 1 so nothing is lost on refresh.

---

## Step 1 — Title + Reference video

**Both optional.** User can tap "Next" without either.

### UI

```
┌────────────────────────────────────────┐
│  editron — new project · step 1 of 3  │   (small eyebrow, top center)
│                                        │
│  What are you making?                  │   (serif h2, like section headlines)
│                                        │
│  ┌─────────────────────────────────┐  │
│  │ Title (optional)                │  │   (plain input, no border unless focus)
│  └─────────────────────────────────┘  │
│                                        │
│  Add a reference video                 │   (small label)
│  ┌─────────────────────────────────┐  │
│  │  [  drop or click to upload  ]  │  │   (dashed border drop zone)
│  │  "Shows Editron the style,      │  │
│  │   pacing, and tone you want."   │  │
│  └─────────────────────────────────┘  │
│                                        │
│               [ skip →  ]  [ next → ]  │
└────────────────────────────────────────┘
```

### Behavior

- **Title field**: plain text input, up to 80 characters. If empty on
  submit, default to `"Untitled draft · {YYYY-MM-DD}"`.
- **Reference video**: single-file drop zone. Accepts `.mp4`, `.mov`,
  `.mkv`, `.webm`, `.m4v`. Max 2 GB for reference videos (they're just
  style-examples, not source). Shows a tiny progress bar during the
  multipart upload. If the user navigates away mid-upload, the upload
  continues in the background and is attached to the project on
  completion.
- **Skip**: advances to Step 2 without saving a reference.
- **Next**: same as Skip but semantically implies the user uploaded
  something — no real difference in the code.

### What Editron does with the reference video

In Phase 1 V0, the reference video is stored and shown back to the user
during the strategy proposal ("I see you're going for something like
this"). Actual style-analysis (shot length, grade stats, pacing fingerprint)
is Phase 3. Don't over-promise in the UI — the label says "shows Editron
the style" and that's enough.

---

## Step 2 — The brief

**Both text and voice memo are supported.** User picks whichever feels
right. Both, either, or neither — still all optional.

### UI

```
┌────────────────────────────────────────┐
│  editron — new project · step 2 of 3  │
│                                        │
│  Tell Editron what it's for.           │
│                                        │
│  ┌─────────────────────────────────┐  │
│  │ What's this video about?        │  │
│  │ Who is it for? How should it    │  │   ← placeholder lorem
│  │ feel? What do you want them to  │  │
│  │ do after watching?              │  │
│  └─────────────────────────────────┘  │
│                                        │
│  ── or ──                              │
│                                        │
│  🎙  [ record a voice memo ]           │   (record button, 2 min max)
│      0:00 / 2:00                       │
│                                        │
│               [ skip →  ]  [ next → ]  │
└────────────────────────────────────────┘
```

### Behavior

- **Text brief**: `<textarea>` autosized, soft 500 char limit (counter
  appears once you hit 400), no hard block. Placeholder rotates between
  three example briefs every time the step is entered — the user can
  see what a good brief looks like without being locked into a format.
- **Voice memo**: uses `MediaRecorder` API to capture `.ogg` / `.webm`
  audio. 2 minute hard cap. Pressing the button starts recording with a
  second-count timer; pressing it again stops and plays back. A small
  waveform bar is drawn live during recording — reuse the same waveform
  component as the editor. "Delete and re-record" link below the
  playback.
- **Both**: allowed. The stored record has a `brief` text column and a
  separate `brief_audio_key` R2 key. During strategy proposal, Editron
  transcribes the audio brief (via Scribe, same key we use for source
  footage) and uses the text and transcribed audio together.
- **Skip**: advances to Step 3 with nothing saved to the brief fields.

### Errors

- **Mic permission denied**: show an inline note — _"Your browser
  blocked microphone access. Type the brief instead, or allow the mic
  in your browser settings."_
- **Voice memo upload failed**: retry button inline below the recorder.
  Never destructive-delete the local blob on failure — user can try
  again.
- **Recording > 2 minutes**: auto-stops, shows _"Capped at 2 minutes —
  briefs work better short anyway."_

---

## Step 3 — Source footage

**The only step that matters for producing a cut.** Even this is
technically optional — without footage there's nothing to process, but
we let the user leave the page at an empty project if they want.

### UI

```
┌────────────────────────────────────────┐
│  editron — new project · step 3 of 3  │
│                                        │
│  Drop your footage.                    │
│                                        │
│  ┌─────────────────────────────────┐  │
│  │                                 │  │
│  │   [  drop files or click  ]     │  │   (large drop zone, dashed border)
│  │                                 │  │
│  │   "Any number of .mp4, .mov,    │  │
│  │    .mkv, .webm, up to 50 GB     │  │
│  │    per file."                   │  │
│  │                                 │  │
│  └─────────────────────────────────┘  │
│                                        │
│  Uploading…                            │   (appears once files dropped)
│  ─────────────────────────────────     │
│  C0103.MP4           ██████░░ 61%      │
│  C0108.MP4           ██████████ done   │
│  C0112.MP4           ██░░░░░░  22%     │
│  ─────────────────────────────────     │
│                                        │
│                  [ open project → ]    │   (enabled once ≥1 upload done)
└────────────────────────────────────────┘
```

### Behavior

- **Drop zone**: accepts multiple files. Drag-drop or click-to-open.
  No file count limit. Per-file max 50 GB (R2 multipart cap).
- **Upload pipeline**: each file goes through the multipart flow —
  `POST /api/uploads/initiate` → parallel `PUT` to signed part URLs →
  `POST /api/uploads/:id/complete`. The frontend tracks each upload's
  progress as `(uploaded_bytes / total_bytes) * 100`. Uses a concurrent
  upload queue of 3 files at a time so we don't saturate the browser.
- **Resumable**: if the user refreshes mid-upload, the wizard detects
  incomplete uploads on re-mount (from localStorage upload state +
  `uploads` rows with status `pending`) and offers "resume where you
  left off."
- **Invalid file**: rejected at the drop zone level before upload
  initiates. Inline toast: _"'thumbnail.jpg' isn't a video. Try .mp4,
  .mov, .mkv, or .webm."_ — calm and specific.
- **Open project →**: enabled once **at least one file** has finished
  uploading. Navigates to `/projects/[id]`. In-flight uploads continue
  in the background via a queued service worker or (simpler for V0) a
  persistent upload context that follows the user across routes.

### What happens the moment the upload completes

The backend fires the `audio-extract` BullMQ job automatically on
`uploads.status → uploaded`. No manual trigger. The frontend doesn't
need to know — the project detail page subscribes to a WS channel
`project:{id}:ingest` and shows state updates as they arrive.

---

## The "ingesting" state on `/projects/[id]`

After the wizard, the user lands on the project page. For each upload
that's still processing, a row shows:

```
C0103.MP4 · ingesting · 0:34
▓▓▓░░░░░░░░░░░░
counting the ums...
```

### Rotating loading messages (editorial tone, not emoji-laden)

Copy rotates every 2.5 s, cycling through the set below. Never repeats
the same message twice in a row. The set is deliberately editorial-
comic, not tech-jargon:

- "sharpening the scissors..."
- "squinting at waveforms..."
- "asking the audio nicely..."
- "counting the ums..."
- "finding the punchlines..."
- "measuring silence in milliseconds..."
- "skipping the small talk..."
- "memorizing your brief..."
- "setting up the splice bay..."
- "asking: is this the take or is this the take?"

Pair with a subtle progress bar that fills slowly based on the backend
progress events. If no progress events have arrived for 10 s, keep the
messages rotating but stop advancing the bar — we never fake progress.

### When ingest is done

Row collapses into:

```
C0103.MP4 · ready · 02:47 · S0 · 1 speaker
```

Plus a small "View transcript" link that opens the phrase-packed view.

---

## Error states (global)

| Error | Where | Message |
|---|---|---|
| Invalid video format | drop zone, before upload | "'{filename}' isn't a video. Try .mp4, .mov, .mkv, or .webm." |
| Upload aborted (network) | progress row | "lost connection. retry?" with a retry button |
| Upload aborted (server 5xx) | progress row | "something on our side — retrying in {n}s..." with auto-retry (3 tries, exponential backoff) |
| Quota exceeded (free plan) | upload initiate | "You've used your ten minutes this month. Upgrade to Creator, or wait until {next billing date}." CTA button: "Upgrade." |
| Reference video corrupt | step 1 | "can't read this one. try a different reference." (block advance to step 2? no — let user skip) |
| Voice memo upload failed | step 2 | "memo didn't send. try re-recording." |
| Source footage corrupt / no audio | project detail row | "{filename} has no audio — Editron edits on audio first, so there's nothing for it to reason about here. skip or replace?" |
| All uploads failed | project detail | "none of your clips made it. can you try again?" with a "Drop more" drop zone |
| Scribe API down | project detail row (ingest stage) | "transcription is slow right now — we'll keep trying." No hard error, just a patient-toned warning. |

**Rule for all error copy:** lowercase, calm, specific. Never "Oops!",
"Something went wrong", "Error 500", or any variant. If an error isn't
actionable by the user, it's a support ticket, not a UI message.

---

## Implementation notes for the frontend agent

- **State shape:** `{ projectId: string, title: string, referenceUploadId?: string, brief: string, briefAudioUploadId?: string, sourceUploadIds: string[] }` in a `React.useReducer` inside the wizard component.
- **Project is created at step 1 submit**, even if title is empty and nothing else is filled. This gives us a persistent `projectId` so subsequent step state writes have somewhere to go.
- **Upload context**: wrap the wizard in an `<UploadsProvider>` that tracks all in-flight uploads globally so they survive route changes.
- **Optimistic UI**: the "next" button advances immediately; uploads finish in the background.
- **Progress updates** from the backend arrive via a WS connection
  (`/api/projects/{id}/events`). For V0, polling every 2s is a
  fallback — ship whichever is simpler first.
- **Audio extraction starts automatically** on upload complete — the
  backend fires the `audio-extract` BullMQ job in the
  `POST /api/uploads/:id/complete` handler. No frontend involvement.
- **The wizard never hard-blocks**. Every step has "skip" semantics.
  The only "required" thing is ≥1 finished source upload to enable the
  final "open project" button, and even THAT the user can bypass by
  navigating directly to the project route.

---

## Tests the QA agent should write

1. Wizard end-to-end: create project with title + reference + brief text + 1 source → land on project page → see ingesting row → see ready row after audio-extract fires.
2. Wizard skip-through: all three steps skipped → land on empty project page → back button returns to dashboard.
3. Voice memo: record 10s → play back → submit → brief row saves.
4. Voice memo permission denied: mic blocked → textarea still works → advance.
5. Resumable upload: drop a 200 MB fixture → refresh at 40% → resume from 40%.
6. Invalid file: drop a `.jpg` → inline toast appears → no upload fires.
7. Quota exceeded: mock the quota endpoint to return 402 → upgrade CTA appears.
8. Rotating ingest messages: mount the ingest row → messages change every 2.5s → no duplicates in a row.
