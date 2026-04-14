# 02 — Authentication & Database

## Goal
User signup/login, session management, and the core database schema.

---

## Tasks

### 2.1 Authentication
- [ ] Integrate Clerk (or NextAuth.js) for auth
- [ ] Email + password signup
- [ ] Google OAuth
- [ ] GitHub OAuth (optional)
- [ ] Protected API routes (middleware)
- [ ] User profile page

### 2.2 Database Schema
- [ ] Set up PostgreSQL (Supabase or Neon)
- [ ] ORM: Drizzle or Prisma
- [ ] Core tables:
  - `users` — id, email, name, avatar, plan, created_at
  - `projects` — id, user_id, title, description, settings, created_at
  - `media` — id, project_id, type, url, metadata, created_at
  - `timelines` — id, project_id, data (JSON), version, updated_at
  - `exports` — id, project_id, status, url, format, created_at
  - `subscriptions` — id, user_id, stripe_id, plan, status
- [ ] Migrations setup
- [ ] Seed data for development

### 2.3 API Layer
- [ ] REST or tRPC router setup
- [ ] CRUD endpoints for projects
- [ ] CRUD endpoints for media
- [ ] Input validation (Zod)
- [ ] Error handling middleware

---

## Keys Needed
- Clerk publishable + secret key
- Database connection string (Supabase/Neon)

## Depends On
- 01-infrastructure

## Estimated Effort
~3-4 days
