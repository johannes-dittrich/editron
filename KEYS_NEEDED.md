# Keys & Access Tokens

All keys live in `~/.config/editron/secrets.env` on the orchestrator VM
(`calm-wolf`), chmod 600, never committed. Agents `source` that file at
the start of every tick via their systemd wrapper.

## Phase 0 — Harness  ✅ complete

| Service | Status | Notes |
|---|---|---|
| GitHub (boxd credential) | ✅ | `gho_...`, scope `repo user:email` |
| Telegram bot | ✅ | `@editron_otter_bot`, token + chat id in `telegram.env` |
| ElevenLabs (Scribe only) | ✅ | `sk_5471...`, scope `speech_to_text` only |
| Cloudflare API token | ✅ | `cfat_...`, Admin R&W on buckets |
| R2 S3 credentials | ✅ | Access Key ID + Secret for bucket `editron-media` (WEUR) |
| Neon Postgres | ✅ | `DATABASE_URL` for `neondb` (us-east-1, free tier) |
| OpenAI | ✅ | `sk-proj-...`, has access to gpt-5.4 family |
| Azin CLI | ✅ | `zin_k_90d4e...`, deploy permission enabled |

## Phase 1 — Foundation  ⬜ still needed

| Service | What's Needed | Why |
|---|---|---|
| Stripe (test mode) | Publishable + secret key + webhook signing secret | Subscription checkout, plan enforcement |
| Upstash Redis | REST URL + token | BullMQ queue in staging/production (local dev uses Docker Redis) |

## Phase 2 — Video engine  ⬜

No new keys — everything runs off ffmpeg + R2 + Neon + OpenAI + ElevenLabs,
all of which are already configured.

## Phase 3 — AI reasoning  ⬜

No new keys — OpenAI is already configured. We may later add Anthropic
`ANTHROPIC_API_KEY` as an alternative reasoning backend.

## Phase 4 — Collaboration  ⬜

| Service | What's Needed |
|---|---|
| Resend or SendGrid | API key for transactional email |

## Phase 5 — Growth  ⬜

| Service | What's Needed |
|---|---|
| PostHog | Project API key (client + server) |
| Sentry | DSN |
| Domain registrar | `editron.video` (or alternative) DNS access |

---

## Providing keys

Paste them in the Telegram chat with `@editron_otter_bot` or in a Claude
Code session with the human operator. The orchestrator saves them to
`~/.config/editron/secrets.env` and reloads agent services that depend
on them. **Never paste raw keys into a git commit message or any `.md`
file.**
