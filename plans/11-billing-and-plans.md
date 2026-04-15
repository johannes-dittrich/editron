# 11 — Billing & Plans

## Goal
A user signs up, gets a free tier, upgrades to Creator ($24/mo) or Studio
($96/mo) via Stripe Checkout, and the API enforces their usage limits.

## Plans (V0)

| Plan | $ / mo | Render minutes | Concurrent projects | Export quality |
|---|---|---|---|---|
| Free | 0 | 10 | 1 | 720p |
| Creator | 24 | 600 | unlimited | 1080p / 4K |
| Studio | 96 | 2400 | unlimited | 1080p / 4K + brand kits |

Limits are soft for the first month; we log overages but don't block.
After month 1, overages hard-block the render queue and return a `402`
with a link to upgrade.

---

## Tasks

### 1 — Stripe integration
- [ ] `pnpm --filter @editron/api add stripe`
- [ ] `apps/api/src/billing/stripe.ts` — initialized Stripe client
- [ ] `POST /api/billing/checkout` — creates a Checkout session for the
      selected plan; returns the URL. User redirects.
- [ ] `POST /api/billing/portal` — creates a customer portal session
      for self-service cancellation / upgrade / payment method
- [ ] Webhook handler at `POST /api/billing/webhook`
  - `checkout.session.completed` → set `users.stripeCustomerId`, set `plan`
  - `customer.subscription.updated` → update `plan`
  - `customer.subscription.deleted` → downgrade to `free`
  - `invoice.payment_failed` → mark account as `past_due` (new column)
- [ ] All handlers verify the webhook signature with `STRIPE_WEBHOOK_SECRET`

### 2 — Usage tracking
- [ ] `usage_events` table: `id`, `userId`, `kind` (render_minutes | transcribe_minutes | storage_gb_hours), `amount`, `createdAt`
- [ ] Every render job emits a row on completion
- [ ] `GET /api/usage/current` sums the current billing cycle per kind

### 3 — Quota enforcement
- [ ] `apps/api/src/billing/quota.ts` — functions `canRender`, `canTranscribe` that read usage + plan, return `{allowed, remaining, reason}`
- [ ] Called at the enqueue step of each job, not at run time (so users see the failure immediately)

### 4 — UI
- [ ] `/pricing` page on the marketing site (already exists in the
      landing variants — picked during Phase 1)
- [ ] `/settings/billing` in the dashboard — shows current plan, usage
      bars, upgrade button, cancel button (opens customer portal)

### 5 — Tests
- [ ] Webhook handler tests with fixtures from Stripe CLI
- [ ] Quota enforcement unit tests
- [ ] Full E2E in staging with Stripe test mode

---

## Notes

- **Free tier credit card**: NOT required. Free users sign up with email,
  get a 10-min quota, upgrade when they want more. No friction.
- **Annual plans**: defer until we have real users (Phase 5).
- **Taxes**: Stripe Tax handles this. We enable it before public launch.
- **Team seats**: Studio plan includes 5 seats. Seat management is
  Phase 4 along with team workspaces.
