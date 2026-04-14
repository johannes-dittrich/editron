# 10 — Export & Render Pipeline

## Goal
Take the final timeline, render it server-side into a downloadable video with format/quality options.

---

## Tasks

### 10.1 Render Engine
- [ ] Convert timeline JSON → FFmpeg filter graph
- [ ] Server-side rendering with FFmpeg
- [ ] GPU-accelerated encoding (NVENC/VAAPI where available)
- [ ] Queue management for concurrent renders
- [ ] Progress tracking (% complete, ETA)
- [ ] Render priority by plan (pro users get faster queue)

### 10.2 Export Formats
- [ ] MP4 (H.264) — universal
- [ ] MP4 (H.265/HEVC) — smaller file, newer devices
- [ ] WebM (VP9) — web-optimized
- [ ] MOV (ProRes) — professional grade
- [ ] GIF — short clips
- [ ] Audio-only (MP3, WAV) — extract audio

### 10.3 Export Presets
- [ ] YouTube (1080p, 4K, Shorts)
- [ ] Instagram (Feed, Stories, Reels)
- [ ] TikTok (9:16, optimized)
- [ ] Twitter/X
- [ ] LinkedIn
- [ ] Custom resolution + bitrate

### 10.4 Delivery
- [ ] Download link (expires after 7 days)
- [ ] Email notification when render completes
- [ ] Direct upload to YouTube/TikTok/Instagram (OAuth integration)
- [ ] Share link (public or password-protected)
- [ ] Embed code for websites

### 10.5 Quality & Optimization
- [ ] Two-pass encoding for optimal quality
- [ ] Smart bitrate selection based on content
- [ ] Render caching (reuse unchanged segments)
- [ ] Watermark injection (free plan)
- [ ] Watermark removal (paid plan)

---

## Keys Needed
- YouTube Data API key + OAuth (for direct publish)
- TikTok API key (for direct publish)

## Depends On
- 04-video-engine
- 05-timeline-editor (final timeline data)

## Estimated Effort
~5-7 days
