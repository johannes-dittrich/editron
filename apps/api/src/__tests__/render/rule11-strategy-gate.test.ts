import "../../polyfills.js";
import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { buildApp } from "../../app.js";
import { db } from "@editron/db/client";
import { users, projects, uploads, transcripts, sessions } from "@editron/db";
import { eq } from "drizzle-orm";
import type { TranscriptWord } from "../../ai/tools.js";

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
let userId: string;
let projectId: string;

beforeAll(async () => {
  const signUp = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: { "content-type": "application/json" },
    payload: JSON.stringify({
      email: `qa-rule11-${Date.now()}@editron.ai`,
      password: "TestPass123!",
      name: "Rule 11 Tester",
    }),
  });
  expect(signUp.statusCode).toBe(200);
  sessionCookie = Array.isArray(signUp.headers["set-cookie"])
    ? signUp.headers["set-cookie"].join("; ")
    : signUp.headers["set-cookie"] ?? "";
  userId = signUp.json().user.id;

  const proj = await app.inject({
    method: "POST",
    url: "/api/projects",
    headers: { "content-type": "application/json", cookie: sessionCookie },
    payload: JSON.stringify({ title: "Rule 11 Test — No Strategy" }),
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
  if (userId) {
    await db.delete(sessions).where(eq(sessions.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  }
  await app.close();
});

describe("Rule 11 — strategy confirmation before execution", () => {
  it("verifies the project has no approved strategy", async () => {
    const [project] = await db
      .select()
      .from(projects)
      .where(eq(projects.id, projectId));

    expect(project.proposedStrategy).toBeNull();
  });

  // https://github.com/mathisdittrich/editron/issues/42
  it.skip("rejects ai/edit call when no strategy has been approved", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/projects/${projectId}/ai/edit`,
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({
        directive: "Use the full transcript as one continuous cut",
      }),
    });

    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.error).toContain("strategy");
  });
});
