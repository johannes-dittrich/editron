# 01 — Infrastructure & Dev Environment

## Goal
Set up the foundational infrastructure: monorepo, CI/CD, hosting, and local dev environment.

---

## Tasks

### 1.1 Monorepo Setup
- [ ] Initialize Next.js 14+ project with TypeScript
- [ ] Configure Turborepo or pnpm workspaces
- [ ] Structure: `apps/web`, `apps/api`, `packages/shared`, `packages/ui`
- [ ] ESLint + Prettier config
- [ ] Tailwind CSS setup

### 1.2 CI/CD Pipeline
- [ ] GitHub Actions workflow: lint, type-check, test on PR
- [ ] Auto-deploy `main` → Vercel (frontend)
- [ ] Auto-deploy `main` → Railway/Fly.io (backend/workers)
- [ ] Branch previews on Vercel

### 1.3 Hosting & Domains
- [ ] Vercel project linked to repo
- [ ] Backend hosting (Railway or Fly.io) configured
- [ ] Domain purchased and DNS pointed
- [ ] SSL certificates (auto via Cloudflare)

### 1.4 Dev Environment
- [ ] Docker Compose for local Postgres + Redis
- [ ] `.env.example` with all required variables
- [ ] README with setup instructions
- [ ] Seed scripts for test data

---

## Keys Needed
- Vercel API token
- Domain registrar access
- Cloudflare account

## Depends On
Nothing — this is the starting point.

## Estimated Effort
~2-3 days
