# 04 — Core Video Processing Engine

## Goal
Server-side video manipulation engine that handles all editing operations (cut, merge, overlay, effects).

---

## Tasks

### 4.1 Processing Architecture
- [ ] Job queue system (BullMQ + Redis or Inngest)
- [ ] Worker processes for video operations
- [ ] Job status tracking & progress reporting
- [ ] Auto-scaling workers based on queue depth
- [ ] Error handling & retry logic

### 4.2 Core Operations (FFmpeg-based)
- [ ] Cut/trim segments
- [ ] Merge/concatenate clips
- [ ] Speed adjustment (slow-mo, timelapse)
- [ ] Crop & resize
- [ ] Rotate & flip
- [ ] Picture-in-picture overlay
- [ ] Text overlay (titles, lower thirds)
- [ ] Image overlay (watermarks, logos)
- [ ] Audio track management (add, remove, replace, mix)
- [ ] Volume adjustment & fade in/out

### 4.3 Transitions
- [ ] Crossfade / dissolve
- [ ] Wipe (left, right, up, down)
- [ ] Zoom transition
- [ ] Custom transition framework (extensible)

### 4.4 Effects & Filters
- [ ] Brightness / contrast / saturation
- [ ] Blur (gaussian, motion)
- [ ] Sharpen
- [ ] Vignette
- [ ] LUT-based color grading
- [ ] Green screen / chroma key

### 4.5 Edit Operation API
- [ ] Define edit operation schema (JSON)
- [ ] POST /api/render — submit edit operations → queue job
- [ ] GET /api/render/:id — check job status
- [ ] WebSocket updates for real-time progress
- [ ] Cancel running job endpoint

---

## Keys Needed
- Redis connection (for job queue)
- Worker hosting (Railway/Fly.io)

## Depends On
- 01-infrastructure
- 03-storage-and-upload

## Estimated Effort
~7-10 days (this is the core engine)
