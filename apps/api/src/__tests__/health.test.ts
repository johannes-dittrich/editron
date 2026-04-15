import { describe, it, expect, afterAll } from "vitest";
import { buildApp } from "../app.js";

const app = await buildApp();

afterAll(async () => {
  await app.close();
});

describe("GET /api/health", () => {
  it("returns service info and db status", async () => {
    const res = await app.inject({ method: "GET", url: "/api/health" });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.service).toBe("editron-api");
    expect(body.db).toMatch(/^(ok|down)$/);
    expect(body.status).toMatch(/^(ok|degraded)$/);
    expect(body.timestamp).toBeDefined();
  });
});
