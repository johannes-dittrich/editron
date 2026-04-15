import "../polyfills.js";
import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { buildApp } from "../app.js";
import { db } from "@editron/db/client";
import { users, usageEvents } from "@editron/db";
import { eq } from "drizzle-orm";
import { canRender, canTranscribe, getCurrentUsage } from "../billing/quota.js";

const app = await buildApp();

let sessionCookie: string;
let userId: string;

beforeAll(async () => {
  const signUp = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: { "content-type": "application/json" },
    payload: JSON.stringify({
      email: `usage-${Date.now()}@editron.ai`,
      password: "TestPass123!",
      name: "Usage Tester",
    }),
  });
  expect(signUp.statusCode).toBe(200);
  sessionCookie = Array.isArray(signUp.headers["set-cookie"])
    ? signUp.headers["set-cookie"].join("; ")
    : signUp.headers["set-cookie"] ?? "";
  userId = signUp.json().user.id;
});

afterAll(async () => {
  await app.close();
});

describe("Quota functions", () => {
  it("canRender allows free user with no usage", async () => {
    const result = await canRender(userId);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(10);
  });

  it("canTranscribe allows free user with no usage", async () => {
    const result = await canTranscribe(userId);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(10);
  });

  it("canRender blocks when quota exceeded", async () => {
    await db.insert(usageEvents).values({
      userId,
      kind: "render_minutes",
      amount: "11",
    });

    const result = await canRender(userId);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.reason).toContain("exceeded");

    await db.delete(usageEvents).where(eq(usageEvents.userId, userId));
  });

  it("getCurrentUsage returns zeros for new user", async () => {
    const usage = await getCurrentUsage(userId);
    expect(usage.render_minutes).toBe(0);
    expect(usage.transcribe_minutes).toBe(0);
    expect(usage.storage_gb_hours).toBe(0);
  });
});

describe("GET /api/usage/current", () => {
  it("returns 401 without session", async () => {
    const res = await app.inject({ method: "GET", url: "/api/usage/current" });
    expect(res.statusCode).toBe(401);
  });

  it("returns usage and quotas for authenticated user", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/usage/current",
      headers: { cookie: sessionCookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.usage).toBeDefined();
    expect(body.usage.render_minutes).toBe(0);
    expect(body.quotas.render.allowed).toBe(true);
    expect(body.quotas.transcribe.allowed).toBe(true);
  });
});
