2026-04-15T01:45:00Z backend M0.1 monorepo plumbing — added foundation deps, simplified to health-only entry point, vitest test https://github.com/mathisdittrich/editron/pull/1
2026-04-15T01:55:00Z backend M0.2 Drizzle schema V0 — 9 Postgres tables + relations + shared types, switched from SQLite https://github.com/mathisdittrich/editron/pull/2
2026-04-15T02:08:00Z backend M0.3 DB connection + health — Neon client with lazy proxy, GET /api/health with db ping https://github.com/mathisdittrich/editron/pull/3
2026-04-15T02:35:00Z backend M0.4 Better-Auth wiring — email/password + GitHub, /api/auth/*, /api/me, full integration tests https://github.com/mathisdittrich/editron/pull/4
2026-04-15T02:39:00Z backend M0.5 Projects CRUD — 5 session-gated endpoints, requireSession middleware, 12 integration tests https://github.com/mathisdittrich/editron/pull/5
2026-04-15T02:54:00Z backend M0.6 R2 client — S3Client for Cloudflare R2, key helpers, @editron/shared/r2 subpath, 5 unit tests https://github.com/mathisdittrich/editron/pull/6
2026-04-15T03:10:00Z backend M0.7 Multipart uploads — 4 endpoints (initiate/part-url/complete/abort), e2e R2 test, 9 integration tests https://github.com/mathisdittrich/editron/pull/7
2026-04-15T03:22:00Z backend M0.8 BullMQ scaffold — audio-extract queue + no-op worker, docker-compose Redis, graceful shutdown https://github.com/mathisdittrich/editron/pull/8
2026-04-15T09:08:31Z frontend M1.5 project creation wizard — 3-step context flow, upload context, voice memo, drop zones, 10 Playwright tests https://github.com/mathisdittrich/editron/pull/21
