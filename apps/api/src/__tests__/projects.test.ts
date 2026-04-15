import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { buildApp } from "../app.js";

const app = await buildApp();

let sessionCookie: string;
let projectId: string;

beforeAll(async () => {
  const signUp = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: { "content-type": "application/json" },
    payload: JSON.stringify({
      email: `proj-test-${Date.now()}@editron.ai`,
      password: "TestPass123!",
      name: "Projects Tester",
    }),
  });
  expect(signUp.statusCode).toBe(200);
  const cookies = signUp.headers["set-cookie"];
  sessionCookie = Array.isArray(cookies) ? cookies.join("; ") : cookies ?? "";
});

afterAll(async () => {
  await app.close();
});

describe("Projects CRUD", () => {
  it("GET /api/projects — empty list for new user", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/projects",
      headers: { cookie: sessionCookie },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it("GET /api/projects — 401 without session", async () => {
    const res = await app.inject({ method: "GET", url: "/api/projects" });
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/projects — creates a project", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/projects",
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({ title: "My First Video" }),
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.title).toBe("My First Video");
    expect(body.status).toBe("draft");
    expect(body.id).toBeDefined();
    projectId = body.id;
  });

  it("POST /api/projects — rejects empty title", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/projects",
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({ title: "" }),
    });
    expect(res.statusCode).toBe(400);
  });

  it("GET /api/projects/:id — returns project with uploads and latestEdl", async () => {
    const res = await app.inject({
      method: "GET",
      url: `/api/projects/${projectId}`,
      headers: { cookie: sessionCookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.id).toBe(projectId);
    expect(body.uploads).toEqual([]);
    expect(body.latestEdl).toBeNull();
  });

  it("GET /api/projects/:id — 404 for non-existent", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/projects/00000000-0000-0000-0000-000000000000",
      headers: { cookie: sessionCookie },
    });
    expect(res.statusCode).toBe(404);
  });

  it("PATCH /api/projects/:id — updates title and brief", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/api/projects/${projectId}`,
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({ title: "Renamed Video", brief: "A short film about cats" }),
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.title).toBe("Renamed Video");
    expect(body.brief).toBe("A short film about cats");
  });

  it("PATCH /api/projects/:id — can archive", async () => {
    const res = await app.inject({
      method: "PATCH",
      url: `/api/projects/${projectId}`,
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({ status: "archived" }),
    });
    expect(res.statusCode).toBe(200);
    expect(res.json().status).toBe("archived");
  });

  it("GET /api/projects — lists the created project", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/projects",
      headers: { cookie: sessionCookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.length).toBe(1);
    expect(body[0].id).toBe(projectId);
  });

  it("DELETE /api/projects/:id — removes the project", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: `/api/projects/${projectId}`,
      headers: { cookie: sessionCookie },
    });
    expect(res.statusCode).toBe(204);
  });

  it("GET /api/projects — empty after delete", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/projects",
      headers: { cookie: sessionCookie },
    });
    expect(res.statusCode).toBe(200);
    expect(res.json()).toEqual([]);
  });

  it("DELETE /api/projects/:id — 404 for already deleted", async () => {
    const res = await app.inject({
      method: "DELETE",
      url: `/api/projects/${projectId}`,
      headers: { cookie: sessionCookie },
    });
    expect(res.statusCode).toBe(404);
  });
});
