# 07 — AI Subtitles & Captions

## Goal
Automatic speech-to-text transcription with word-level timestamps, styled captions, and multi-language translation.

---

## Tasks

### 7.1 Transcription Engine
- [ ] Integrate OpenAI Whisper API (or self-hosted Whisper)
- [ ] Word-level timestamps for precise sync
- [ ] Speaker diarization (who said what)
- [ ] Confidence scores per word
- [ ] Support for 50+ languages

### 7.2 Caption Styles
- [ ] Default styles: minimal, bold, karaoke (word-by-word highlight)
- [ ] TikTok/Reels style (animated, centered, colorful)
- [ ] Traditional subtitles (bottom bar)
- [ ] Customizable: font, size, color, background, position
- [ ] Emoji auto-insertion based on content (optional, fun feature)

### 7.3 Caption Editor
- [ ] Full transcript view (editable text)
- [ ] Click word → jump to timestamp in timeline
- [ ] Merge/split caption blocks
- [ ] Timing adjustment (drag to resize)
- [ ] Spell check & grammar suggestions

### 7.4 Translation
- [ ] One-click translate to any supported language
- [ ] Side-by-side original + translated view
- [ ] Multi-language subtitle tracks
- [ ] Export: SRT, VTT, ASS formats

### 7.5 Burn-in Rendering
- [ ] Render captions into video (hard-coded)
- [ ] Or export as separate subtitle track (soft-coded)
- [ ] Preview captions in timeline editor

---

## Keys Needed
- OpenAI API key (Whisper endpoint)
- (Optional) DeepL or Google Translate API for translations

## Depends On
- 04-video-engine
- 05-timeline-editor

## Estimated Effort
~5-7 days
