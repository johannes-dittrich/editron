import "../polyfills.js";
import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { buildApp } from "../app.js";
import { db } from "@editron/db/client";
import { users, projects, uploads, transcripts, edls } from "@editron/db";
import { eq } from "drizzle-orm";
import { validateWordBoundaries, type TranscriptWord } from "../ai/tools.js";

const app = await buildApp();

const testWords: TranscriptWord[] = [
  { text: "Hello", start: 0.0, end: 0.5, type: "word" },
  { text: "world", start: 0.6, end: 1.0, type: "word" },
  { text: "this", start: 1.5, end: 1.8, type: "word" },
  { text: "is", start: 1.9, end: 2.1, type: "word" },
  { text: "a", start: 2.2, end: 2.3, type: "word" },
  { text: "test", start: 2.4, end: 2.8, type: "word" },
];

describe("validateWordBoundaries", () => {
  it("accepts ranges that snap to word boundaries", () => {
    const errors = validateWordBoundaries(
      [{ source: "a", start: 0.0, end: 1.0 }],
      testWords,
    );
    expect(errors).toEqual([]);
  });

  it("rejects ranges that don't snap to word boundaries", () => {
    const errors = validateWordBoundaries(
      [{ source: "a", start: 0.3, end: 1.3 }],
      testWords,
    );
    expect(errors.length).toBe(2);
    expect(errors[0]).toContain("start 0.3s");
    expect(errors[1]).toContain("end 1.3s");
  });

  it("tolerates small drift within tolerance", () => {
    const errors = validateWordBoundaries(
      [{ source: "a", start: 0.05, end: 0.95 }],
      testWords,
      0.1,
    );
    expect(errors).toEqual([]);
  });
});

let sessionCookie: string;
let projectId: string;
let uploadId: string;

beforeAll(async () => {
  const signUp = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: { "content-type": "application/json" },
    payload: JSON.stringify({
      email: `ai-edit-${Date.now()}@editron.ai`,
      password: "TestPass123!",
      name: "AI Edit Tester",
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
    payload: JSON.stringify({ title: "AI Edit Test" }),
  });
  expect(proj.statusCode).toBe(201);
  projectId = proj.json().id;

  const userId = proj.json().userId;
  uploadId = crypto.randomUUID();
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

describe("POST /api/projects/:id/ai/edit", () => {
  it("returns 401 without session", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/projects/${projectId}/ai/edit`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ directive: "test" }),
    });
    expect(res.statusCode).toBe(401);
  });

  it("returns 400 without directive", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/projects/${projectId}/ai/edit`,
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({}),
    });
    expect(res.statusCode).toBe(400);
  });

  it("calls OpenAI and returns an EDL", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/projects/${projectId}/ai/edit`,
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({ directive: "Use the full transcript as one continuous cut" }),
    });

    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.edl).toBeDefined();
    expect(body.edl.payload).toBeDefined();
    expect(body.edl.version).toBe(1);
    expect(body.edl.projectId).toBe(projectId);
  }, 30_000);
});
