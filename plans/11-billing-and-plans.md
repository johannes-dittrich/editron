# 11 — Billing, Subscriptions & Usage Limits

## Goal
Monetization via tiered subscriptions with usage-based limits on storage, exports, and AI features.

---

## Tasks

### 11.1 Pricing Tiers

**Free**
- 2 projects
- 500MB storage
- 720p max export
- 5 AI operations/month
- Editron watermark on exports

**Pro ($19/mo)**
- Unlimited projects
- 50GB storage
- 4K export
- 100 AI operations/month
- No watermark
- Priority render queue

**Business ($49/mo)**
- Everything in Pro
- 500GB storage
- Unlimited AI operations
- Team collaboration (up to 5 seats)
- Custom branding on exports
- API access
- Priority support

### 11.2 Stripe Integration
- [ ] Stripe Checkout for subscription signup
- [ ] Stripe Customer Portal for plan management
- [ ] Webhook handlers: subscription created/updated/cancelled
- [ ] Usage tracking (AI operations, storage, exports)
- [ ] Metered billing option for overages
- [ ] Promo codes / discounts
- [ ] Annual billing discount (2 months free)

### 11.3 Usage Enforcement
- [ ] Middleware to check plan limits before operations
- [ ] Storage quota tracking per user
- [ ] AI operations counter (reset monthly)
- [ ] Export resolution gating by plan
- [ ] Upgrade prompts when hitting limits
- [ ] Grace period for downgraded users

### 11.4 Billing UI
- [ ] Pricing page (public)
- [ ] Account billing page (current plan, usage, invoices)
- [ ] Plan comparison table
- [ ] Upgrade/downgrade flow
- [ ] Invoice history + PDF download

---

## Keys Needed
- Stripe publishable key
- Stripe secret key
- Stripe webhook secret

## Depends On
- 02-auth-and-database (user accounts)

## Estimated Effort
~4-5 days
