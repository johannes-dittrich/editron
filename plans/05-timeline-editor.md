# 05 — Web-Based Timeline Editor

## Goal
A professional-feeling timeline editor in the browser — the core UI where users arrange, trim, and preview their edits.

---

## Tasks

### 5.1 Timeline UI
- [ ] Canvas-based timeline renderer (HTML5 Canvas or WebGL)
- [ ] Multiple tracks: video, audio, text, effects
- [ ] Drag-and-drop clips onto timeline
- [ ] Clip trimming (drag edges)
- [ ] Clip splitting (razor tool)
- [ ] Snap-to-grid / snap-to-clips
- [ ] Zoom in/out on timeline
- [ ] Playhead with scrubbing
- [ ] Track mute/solo/lock
- [ ] Undo/redo stack

### 5.2 Video Preview
- [ ] Real-time preview player (approximated via browser)
- [ ] FFmpeg.wasm for client-side preview rendering
- [ ] Play/pause/seek controls
- [ ] Fullscreen preview
- [ ] Frame-by-frame stepping
- [ ] Preview quality selector (draft vs high)

### 5.3 Properties Panel
- [ ] Selected clip properties (position, duration, opacity)
- [ ] Effect parameters (sliders, color pickers)
- [ ] Transition picker between clips
- [ ] Text editor for title clips
- [ ] Audio waveform display

### 5.4 Project State Management
- [ ] Timeline state in Zustand/Redux
- [ ] Auto-save to backend (debounced)
- [ ] Version history / snapshots
- [ ] Keyboard shortcuts (J/K/L playback, C for cut, V for select, etc.)
- [ ] Touch/tablet support (stretch goal)

### 5.5 Toolbar
- [ ] Select / Move tool
- [ ] Razor / Split tool
- [ ] Text tool
- [ ] Hand / Pan tool
- [ ] Zoom controls

---

## Keys Needed
None — purely frontend.

## Depends On
- 01-infrastructure
- 03-storage-and-upload (for media assets)
- 04-video-engine (for render operations)

## Estimated Effort
~10-14 days (most complex frontend piece)
