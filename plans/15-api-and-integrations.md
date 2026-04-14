# 15 — Public API & Third-Party Integrations

## Goal
A developer-friendly API so others can build on Editron, plus integrations with popular platforms.

---

## Tasks

### 15.1 Public REST API
- [ ] API key management (generate, revoke, rate limits)
- [ ] Endpoints:
  - `POST /api/v1/projects` — create project
  - `POST /api/v1/media/upload` — upload media
  - `POST /api/v1/edit` — submit edit operations
  - `POST /api/v1/render` — start render
  - `GET /api/v1/render/:id` — check render status
  - `POST /api/v1/ai/transcribe` — get subtitles
  - `POST /api/v1/ai/analyze` — scene detection
  - `POST /api/v1/ai/edit` — text-to-edit command
- [ ] Pagination, filtering, sorting
- [ ] Webhook support (notify on render complete, etc.)
- [ ] API documentation (OpenAPI/Swagger)
- [ ] SDKs: JavaScript, Python (stretch)

### 15.2 Platform Integrations
- [ ] YouTube: import video → edit → publish back
- [ ] TikTok: edit → publish
- [ ] Google Drive / Dropbox: import/export media
- [ ] Notion: embed project links
- [ ] Zapier / Make: automation triggers
- [ ] Slack: notifications (render complete, comments)

### 15.3 Embed & White-Label
- [ ] Embeddable editor widget (iframe)
- [ ] Customizable theme (business plan)
- [ ] White-label option (remove Editron branding)
- [ ] Partner API for resellers

### 15.4 Developer Experience
- [ ] API playground (try endpoints in browser)
- [ ] Example projects & tutorials
- [ ] Rate limit headers & documentation
- [ ] Changelog & migration guides
- [ ] Community SDK contributions

---

## Keys Needed
- YouTube Data API + OAuth credentials
- TikTok API credentials
- Google Drive API credentials
- Zapier partner access (optional)

## Depends On
- All core features (04-10)
- 11-billing (for API usage metering)

## Estimated Effort
~7-10 days
