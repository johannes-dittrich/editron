# 06 — AI Scene Detection & Auto-Cutting

## Goal
Automatically analyze raw footage, detect scenes/shots, identify key moments, and suggest or auto-generate a rough cut.

---

## Tasks

### 6.1 Scene Detection
- [ ] FFmpeg scene detection filter (`select='gt(scene,0.3)'`)
- [ ] Extract keyframes at scene boundaries
- [ ] ML-enhanced detection (fine-tune on diverse content types)
- [ ] Output: list of scenes with timestamps, thumbnails, confidence scores

### 6.2 Content Analysis
- [ ] Face detection per scene (who appears where)
- [ ] Speech/silence detection (find talking segments vs b-roll)
- [ ] Motion analysis (action vs static shots)
- [ ] Emotion detection (optional: detect energy, mood)
- [ ] Object/location tagging per scene

### 6.3 Auto-Cut Engine
- [ ] "Highlight reel" — auto-select best moments based on:
  - Speech clarity + energy
  - Visual quality (blur detection, exposure)
  - Face presence
  - Scene variety
- [ ] Target duration input (e.g., "make a 60-second highlight")
- [ ] Style presets: "fast-paced", "cinematic", "documentary"
- [ ] Output: suggested timeline (editable by user)

### 6.4 Smart Trim
- [ ] Auto-remove silence/dead space
- [ ] Auto-remove filler words ("um", "uh", "like")
- [ ] Smart padding (keep 0.3s before/after speech)
- [ ] Jump cut detection and smoothing

### 6.5 UI Integration
- [ ] "AI Analyze" button per uploaded video
- [ ] Scene browser panel (thumbnails + timestamps)
- [ ] One-click "Auto Edit" → generates timeline
- [ ] Scene ratings (user can star/reject scenes)

---

## Keys Needed
- OpenAI API key (for content analysis)
- GPU worker hosting (for ML models)

## Depends On
- 04-video-engine
- 05-timeline-editor

## Estimated Effort
~7-10 days
