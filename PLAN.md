# Editron — AI Video Editing Software

## Vision
An end-to-end AI-powered video editing platform that makes professional video editing accessible to everyone. Users describe what they want, and AI handles the heavy lifting — cuts, transitions, effects, color grading, audio mixing, subtitles, and more.

---

## Architecture Overview

```
┌─────────────┐     ┌──────────────┐     ┌──────────────────┐
│   Frontend   │────▶│   Backend    │────▶│  AI/ML Pipeline  │
│   (Web App)  │◀────│   (API)      │◀────│  (Processing)    │
└─────────────┘     └──────────────┘     └──────────────────┘
                           │                       │
                    ┌──────┴──────┐         ┌──────┴──────┐
                    │  Database   │         │  Storage    │
                    │  (Postgres) │         │  (S3/R2)    │
                    └─────────────┘         └─────────────┘
```

---

## Phases

### Phase 1 — Foundation & Infrastructure
- Cloud infrastructure setup (AWS/GCP/Vercel)
- CI/CD pipeline
- Auth system
- Database schema
- File storage (video upload/download)

### Phase 2 — Core Video Engine
- Video upload & transcoding pipeline
- Timeline editor (web-based)
- Basic cut/trim/split operations
- Video preview & playback
- Export/render pipeline

### Phase 3 — AI Features
- AI scene detection & auto-cutting
- AI-powered transitions & effects
- Text-to-edit (natural language commands)
- Auto subtitles/captions (speech-to-text)
- AI color grading
- AI audio enhancement & music suggestions
- AI thumbnail generation

### Phase 4 — Collaboration & Business
- User workspaces & project management
- Real-time collaboration
- Template marketplace
- Subscription & billing (Stripe)
- Team/org support

### Phase 5 — Growth & Scale
- Public launch & marketing site
- Analytics & usage tracking
- Mobile-responsive editor
- API for third-party integrations
- Performance optimization & CDN

---

## Tech Stack (Proposed)

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14+ (App Router), TypeScript, Tailwind CSS |
| Video Editor UI | Custom canvas/WebGL + FFmpeg.wasm for preview |
| Backend | Node.js (Fastify or Next.js API routes) |
| Database | PostgreSQL (via Supabase or Neon) |
| Auth | Clerk or NextAuth.js |
| Storage | AWS S3 / Cloudflare R2 |
| Video Processing | FFmpeg (server-side), cloud transcoding |
| AI/ML | OpenAI API, Whisper (subtitles), custom models |
| Payments | Stripe |
| Hosting | Vercel (frontend) + Railway/Fly.io (backend/processing) |
| CDN | Cloudflare |
| Monitoring | Sentry, PostHog |

---

## Step-by-Step Plans

See individual plan files:

1. [01-infrastructure.md](./plans/01-infrastructure.md) — Cloud, CI/CD, dev environment
2. [02-auth-and-database.md](./plans/02-auth-and-database.md) — Authentication & data layer
3. [03-storage-and-upload.md](./plans/03-storage-and-upload.md) — File storage & video upload
4. [04-video-engine.md](./plans/04-video-engine.md) — Core video processing pipeline
5. [05-timeline-editor.md](./plans/05-timeline-editor.md) — Web-based timeline UI
6. [06-ai-scene-detection.md](./plans/06-ai-scene-detection.md) — AI auto-cutting & scene analysis
7. [07-ai-subtitles.md](./plans/07-ai-subtitles.md) — Speech-to-text & captions
8. [08-ai-text-to-edit.md](./plans/08-ai-text-to-edit.md) — Natural language editing commands
9. [09-ai-effects-grading.md](./plans/09-ai-effects-grading.md) — AI transitions, color, audio
10. [10-export-render.md](./plans/10-export-render.md) — Render pipeline & delivery
11. [11-billing-and-plans.md](./plans/11-billing-and-plans.md) — Stripe, subscriptions, usage limits
12. [12-collaboration.md](./plans/12-collaboration.md) — Real-time collab & teams
13. [13-marketing-site.md](./plans/13-marketing-site.md) — Landing page & launch
14. [14-analytics-monitoring.md](./plans/14-analytics-monitoring.md) — Tracking, errors, performance
15. [15-api-and-integrations.md](./plans/15-api-and-integrations.md) — Public API & third-party hooks

---

## Keys & Access Needed

Tracked in [KEYS_NEEDED.md](./KEYS_NEEDED.md)

---

## Status

- [x] Repo created
- [x] Master plan written
- [ ] Phase 1 — Infrastructure
- [ ] Phase 2 — Video Engine
- [ ] Phase 3 — AI Features
- [ ] Phase 4 — Collaboration & Business
- [ ] Phase 5 — Growth & Scale
