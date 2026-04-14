# Keys & Access Tokens Needed

This tracks all API keys, tokens, and accounts required across the project.
**⚠️ Do NOT paste keys into this file. Use environment variables or a `.env` file.**

---

## Phase 1 — Infrastructure

| Service | What's Needed | Status |
|---------|---------------|--------|
| GitHub | PAT (repo access) | ✅ Provided |
| Vercel | Account + API token | ⬜ Needed |
| Domain | Domain name + DNS access | ⬜ Needed |
| Cloudflare | Account (CDN, R2 storage) | ⬜ Needed |

## Phase 2 — Auth & Database

| Service | What's Needed | Status |
|---------|---------------|--------|
| Clerk or Auth0 | API keys (publishable + secret) | ⬜ Needed |
| Supabase or Neon | Database connection string | ⬜ Needed |

## Phase 3 — Storage & Video

| Service | What's Needed | Status |
|---------|---------------|--------|
| AWS S3 or Cloudflare R2 | Access key + secret + bucket | ⬜ Needed |
| FFmpeg | N/A (open source, no key) | ✅ Free |

## Phase 4 — AI Services

| Service | What's Needed | Status |
|---------|---------------|--------|
| OpenAI | API key (GPT-4 + Whisper) | ⬜ Needed |
| Replicate or RunPod | API key (custom model hosting) | ⬜ Needed |
| ElevenLabs (optional) | API key (AI voiceover) | ⬜ Needed |

## Phase 5 — Payments & Analytics

| Service | What's Needed | Status |
|---------|---------------|--------|
| Stripe | Publishable + secret key | ⬜ Needed |
| PostHog or Mixpanel | API key | ⬜ Needed |
| Sentry | DSN | ⬜ Needed |

## Phase 6 — Email & Comms

| Service | What's Needed | Status |
|---------|---------------|--------|
| Resend or SendGrid | API key | ⬜ Needed |

---

## How to Provide Keys

When you're ready, either:
1. **Set them as env vars** and I'll configure `.env` files
2. **Use a secrets manager** (Vercel env, Railway secrets, etc.)
3. **Tell me which service** and I'll guide you through getting the key

Never paste raw keys in chat if avoidable — use env vars or DM them securely.
