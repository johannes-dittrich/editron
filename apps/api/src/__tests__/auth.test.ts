import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { buildApp } from "../app.js";

const app = await buildApp();

afterAll(async () => {
  await app.close();
});

const testEmail = `test-${Date.now()}@editron.ai`;
const testPassword = "TestPass123!";
let sessionCookie: string;

describe("Auth flow", () => {
  it("POST /api/auth/sign-up/email — creates a new user", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/sign-up/email",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        email: testEmail,
        password: testPassword,
        name: "Test User",
      }),
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(testEmail);

    const cookies = res.headers["set-cookie"];
    const cookieStr = Array.isArray(cookies) ? cookies.join("; ") : cookies ?? "";
    sessionCookie = cookieStr;
  });

  it("POST /api/auth/sign-in/email — authenticates existing user", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/auth/sign-in/email",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({
        email: testEmail,
        password: testPassword,
      }),
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(testEmail);

    const cookies = res.headers["set-cookie"];
    const cookieStr = Array.isArray(cookies) ? cookies.join("; ") : cookies ?? "";
    sessionCookie = cookieStr;
    expect(sessionCookie).toBeTruthy();
  });

  it("GET /api/me — returns the session user", async () => {
    expect(sessionCookie).toBeTruthy();
    const res = await app.inject({
      method: "GET",
      url: "/api/me",
      headers: { cookie: sessionCookie },
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toBe(testEmail);
  });

  it("GET /api/me — returns 401 without session", async () => {
    const res = await app.inject({
      method: "GET",
      url: "/api/me",
    });
    expect(res.statusCode).toBe(401);
    const body = res.json();
    expect(body.error).toBe("Not authenticated");
  });
});
