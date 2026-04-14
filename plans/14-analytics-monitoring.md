# 14 — Analytics, Monitoring & Error Tracking

## Goal
Know what's happening: user behavior, system health, errors, and performance.

---

## Tasks

### 14.1 Product Analytics
- [ ] PostHog or Mixpanel integration
- [ ] Track key events:
  - Signup, login
  - Project created, media uploaded
  - AI feature used (which one, how often)
  - Export started, completed, downloaded
  - Upgrade to paid plan
  - Churn (subscription cancelled)
- [ ] Funnel analysis: signup → first project → first export → paid
- [ ] User cohort analysis
- [ ] Feature usage heatmaps

### 14.2 Error Tracking
- [ ] Sentry integration (frontend + backend)
- [ ] Source maps for readable stack traces
- [ ] Error grouping and alerts
- [ ] User context in error reports
- [ ] Performance monitoring (page load, API latency)

### 14.3 Infrastructure Monitoring
- [ ] Uptime monitoring (Betterstack or similar)
- [ ] API response time tracking
- [ ] Worker queue depth & processing time
- [ ] Storage usage per user
- [ ] Database query performance
- [ ] Alert rules: high error rate, slow API, queue backup

### 14.4 Business Metrics Dashboard
- [ ] MRR (Monthly Recurring Revenue)
- [ ] Active users (DAU/WAU/MAU)
- [ ] Churn rate
- [ ] Feature adoption rates
- [ ] Render queue utilization
- [ ] Storage growth trend

### 14.5 Status Page
- [ ] Public status page (Betterstack or custom)
- [ ] Incident communication
- [ ] Scheduled maintenance notices

---

## Keys Needed
- PostHog or Mixpanel API key
- Sentry DSN
- Betterstack API key (optional)

## Depends On
- 01-infrastructure (deployed app)

## Estimated Effort
~3-4 days
