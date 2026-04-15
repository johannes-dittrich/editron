import "../polyfills.js";
import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { buildApp } from "../app.js";
import { db } from "@editron/db/client";
import { uploads, transcripts, projects } from "@editron/db";
import { eq } from "drizzle-orm";
import type { TranscriptWord } from "../ai/tools.js";

const app = await buildApp();

const testWords: TranscriptWord[] = [
  { text: "Hello", start: 0.0, end: 0.5, type: "word" },
  { text: "world", start: 0.6, end: 1.0, type: "word" },
  { text: "this", start: 1.5, end: 1.8, type: "word" },
  { text: "is", start: 1.9, end: 2.1, type: "word" },
  { text: "a", start: 2.2, end: 2.3, type: "word" },
  { text: "test", start: 2.4, end: 2.8, type: "word" },
];

let sessionCookie: string;
let projectId: string;

beforeAll(async () => {
  const signUp = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: { "content-type": "application/json" },
    payload: JSON.stringify({
      email: `strategy-${Date.now()}@editron.ai`,
      password: "TestPass123!",
      name: "Strategy Tester",
    }),
  });
  expect(signUp.statusCode).toBe(200);
  sessionCookie = Array.isArray(signUp.headers["set-cookie"])
    ? signUp.headers["set-cookie"].join("; ")
    : signUp.headers["set-cookie"] ?? "";

  const proj = await app.inject({
    method: "POST",
    url: "/api/projects",
    headers: { "content-type": "application/json", cookie: sessionCookie },
    payload: JSON.stringify({ title: "Strategy Test" }),
  });
  expect(proj.statusCode).toBe(201);
  projectId = proj.json().id;

  const uploadId = crypto.randomUUID();
  await db.insert(uploads).values({
    id: uploadId,
    projectId,
    kind: "source",
    r2Key: `test/${uploadId}/original.mp4`,
    status: "processed",
  });
  await db.insert(transcripts).values({
    uploadId,
    words: testWords,
    durationS: "2.800",
    language: "en",
  });
});

afterAll(async () => {
  await app.close();
});

describe("POST /api/projects/:id/ai/strategy", () => {
  it("returns 401 without session", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/projects/${projectId}/ai/strategy`,
    });
    expect(res.statusCode).toBe(401);
  });

  it("returns 404 for non-existent project", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/projects/00000000-0000-0000-0000-000000000000/ai/strategy",
      headers: { cookie: sessionCookie },
    });
    expect(res.statusCode).toBe(404);
  });

  it("calls OpenAI and returns a strategy paragraph", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/projects/${projectId}/ai/strategy`,
      headers: { cookie: sessionCookie },
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.strategy).toBeDefined();
    expect(typeof body.strategy).toBe("string");
    expect(body.strategy.length).toBeGreaterThan(20);
  }, 30_000);

  it("persists strategy on the project", async () => {
    const [project] = await db.select().from(projects).where(eq(projects.id, projectId));
    expect(project.proposedStrategy).toBeDefined();
    expect(typeof project.proposedStrategy).toBe("string");
  });
});
