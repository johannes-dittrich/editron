2026-04-15T01:45:00Z backend M0.1 monorepo plumbing — added foundation deps, simplified to health-only entry point, vitest test https://github.com/mathisdittrich/editron/pull/1
2026-04-15T01:55:00Z backend M0.2 Drizzle schema V0 — 9 Postgres tables + relations + shared types, switched from SQLite https://github.com/mathisdittrich/editron/pull/2
2026-04-15T02:08:00Z backend M0.3 DB connection + health — Neon client with lazy proxy, GET /api/health with db ping https://github.com/mathisdittrich/editron/pull/3
2026-04-15T02:35:00Z backend M0.4 Better-Auth wiring — email/password + GitHub, /api/auth/*, /api/me, full integration tests https://github.com/mathisdittrich/editron/pull/4
2026-04-15T02:39:00Z backend M0.5 Projects CRUD — 5 session-gated endpoints, requireSession middleware, 12 integration tests https://github.com/mathisdittrich/editron/pull/5
2026-04-15T02:54:00Z backend M0.6 R2 client — S3Client for Cloudflare R2, key helpers, @editron/shared/r2 subpath, 5 unit tests https://github.com/mathisdittrich/editron/pull/6
2026-04-15T03:10:00Z backend M0.7 Multipart uploads — 4 endpoints (initiate/part-url/complete/abort), e2e R2 test, 9 integration tests https://github.com/mathisdittrich/editron/pull/7
2026-04-15T03:22:00Z backend M0.8 BullMQ scaffold — audio-extract queue + no-op worker, docker-compose Redis, graceful shutdown https://github.com/mathisdittrich/editron/pull/8
2026-04-15T03:32:00Z backend M0.9 Audio-extract worker — R2 stream → ffmpeg pipe → WAV upload, real integration test https://github.com/mathisdittrich/editron/pull/9
2026-04-15T03:48:00Z backend M0.10 Transcribe worker — Scribe + Whisper fallback, word-level JSON, auto-chained from audio-extract https://github.com/mathisdittrich/editron/pull/11
2026-04-15T04:05:00Z backend M1.1 Render queue scaffold — 4 typed queues (render-seg/concat/final/loudnorm) with no-op workers https://github.com/mathisdittrich/editron/pull/12
2026-04-15T04:22:00Z backend M1.2 Per-segment extraction — render-seg with ffmpeg grade + 30ms audio fades, R2 upload https://github.com/mathisdittrich/editron/pull/14
2026-04-15T04:38:00Z backend M1.3 Lossless concat — render-concat with ffmpeg concat demuxer -c copy, R2 upload https://github.com/mathisdittrich/editron/pull/16
2026-04-15T08:47:00Z backend M1.4 Overlays + subtitles — render-final with PTS-shifted overlays, subtitles LAST (rule 1) https://github.com/mathisdittrich/editron/pull/18
2026-04-15T09:02:00Z backend M1.5 Loudnorm — two-pass ffmpeg -14 LUFS -1 dBTP LRA 11, marks renders.status=done https://github.com/mathisdittrich/editron/pull/20
2026-04-15T09:25:00Z backend M2.1 Text-to-edit — POST /api/projects/:id/ai/edit, OpenAI function calling, word boundary validation https://github.com/mathisdittrich/editron/pull/23
2026-04-15T09:42:00Z backend M2.2 Strategy proposal — POST /api/projects/:id/ai/strategy, persists proposedStrategy https://github.com/mathisdittrich/editron/pull/24
2026-04-15T10:05:00Z backend M2.3 Stripe checkout + webhook — checkout/portal/webhook endpoints, plan updates, sig verification https://github.com/mathisdittrich/editron/pull/26
2026-04-15T10:25:00Z backend M2.4 Usage tracking + quota — usage_events table, GET /api/usage/current, canRender/canTranscribe gates https://github.com/mathisdittrich/editron/pull/27
