# 07 — AI Subtitles

## Goal
Generate word-level, verbatim subtitles from source audio. Serve them
as SRT / VTT for the player and as a master SRT for the render pipeline.

## Stack
**Primary: ElevenLabs Scribe (`scribe_v1`).** Key is configured. Gives us
word-level timestamps, speaker diarization, audio events (`(laughs)`,
`(sighs)`, pauses).

**Fallback: OpenAI Whisper (`whisper-1`).** Used when Scribe is down or
rate-limited. Key is configured.

## Tasks

### 1 — Transcribe worker
- [ ] BullMQ job `transcribe`
- [ ] Input: `{ uploadId }`
- [ ] Calls the `audio-extract` output WAV, sends to Scribe with:
      `model_id=scribe_v1, diarize=true, tag_audio_events=true, timestamps_granularity=word`
- [ ] On success: writes `transcripts` row, uploads raw JSON to `transcripts/{uploadId}.json`
- [ ] On Scribe failure: falls back to Whisper via `POST /v1/audio/transcriptions`, normalizes the response to Scribe's shape

### 2 — Phrase packer
- [ ] `apps/api/src/transcripts/pack.ts` takes the word-level JSON and produces a phrase-level markdown artifact (break on silence ≥ 0.5 s OR speaker change)
- [ ] Matches the format in `video-use-main/helpers/pack_transcripts.py`
- [ ] Used by the text-to-edit reasoning step as the primary reading view

### 3 — SRT / VTT generation
- [ ] Two modes:
  - **Short-form / social**: 2-word chunks, UPPERCASE, MarginV=35, Helvetica Bold 18. Default for clips <2 min.
  - **Long-form / doc**: 4-7 word chunks, sentence case, MarginV=60, larger font.
- [ ] User picks the mode in the editor UI; the render pipeline generates both SRT and VTT at render time
- [ ] Output-timeline math: `out_time = word.start - seg_start + seg_offset` (SKILL.md rule 5)

### 4 — Editor integration
- [ ] Frontend fetches the phrase-level transcript via `GET /api/uploads/:id/transcript`
- [ ] Clicking a word seeks the player to that time
- [ ] Selecting a span and pressing `d` deletes it from the EDL; pressing `k` keeps only the selection

### 5 — Caching
- [ ] Transcripts are immutable per source file; once in the DB, never re-transcribe unless the source hash changes
- [ ] `transcripts.uploadId` is UNIQUE

---

## Notes

- **Never use phrase-level or SRT mode from Scribe directly.** Loses sub-second gap data. Always word-level JSON (SKILL.md rule 8).
- **Never normalize fillers.** Umms, uhs, pauses are editorial signals, not noise.
- **Language detection** — Scribe auto-detects. We store the detected language for the player to pick the right font (CJK needs different settings).
