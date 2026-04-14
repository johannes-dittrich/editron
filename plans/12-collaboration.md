# 12 — Real-Time Collaboration & Teams

## Goal
Multiple users editing the same project simultaneously, with teams/orgs for business accounts.

---

## Tasks

### 12.1 Real-Time Sync
- [ ] WebSocket connection for live updates (Liveblocks, Partykit, or custom)
- [ ] CRDT or OT for conflict-free concurrent edits
- [ ] Cursor/selection awareness (see where others are on timeline)
- [ ] Live playhead sync (optional: watch together mode)
- [ ] Presence indicators (who's online)

### 12.2 Permissions & Roles
- [ ] Owner — full control, billing
- [ ] Editor — can edit timeline, upload media
- [ ] Reviewer — can comment, approve, but not edit
- [ ] Viewer — read-only, can watch previews
- [ ] Per-project permission overrides

### 12.3 Comments & Review
- [ ] Timestamped comments on timeline (click to add at specific time)
- [ ] Drawing/annotation overlay on video frame
- [ ] Comment threads with replies
- [ ] @mentions
- [ ] Resolve/unresolve comments
- [ ] Email notifications for comments

### 12.4 Teams & Organizations
- [ ] Create/manage teams
- [ ] Invite members via email
- [ ] Team-wide project library
- [ ] Shared media library across team
- [ ] Team billing (seats-based)
- [ ] SSO integration (stretch goal)

### 12.5 Version Control
- [ ] Project snapshots ("save version")
- [ ] Named versions ("Final Cut", "Draft 2")
- [ ] Compare versions side by side
- [ ] Restore previous version
- [ ] Branch/fork a project

---

## Keys Needed
- Liveblocks API key (or Partykit — self-hosted, free)
- Resend/SendGrid API key (for notifications)

## Depends On
- 02-auth-and-database
- 05-timeline-editor

## Estimated Effort
~7-10 days
