import "../../polyfills.js";
import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { buildApp } from "../../app.js";
import { db } from "@editron/db/client";
import { users, usageEvents, sessions } from "@editron/db";
import { eq } from "drizzle-orm";
import { canRender, canTranscribe, getCurrentUsage } from "../../billing/quota.js";
import { planFromPriceId } from "../../billing/stripe.js";

const app = await buildApp();

let sessionCookie: string;
let userId: string;

beforeAll(async () => {
  const signUp = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: { "content-type": "application/json" },
    payload: JSON.stringify({
      email: `qa-billing-${Date.now()}@editron.ai`,
      password: "TestPass123!",
      name: "Billing Adversarial Tester",
    }),
  });
  expect(signUp.statusCode).toBe(200);
  sessionCookie = Array.isArray(signUp.headers["set-cookie"])
    ? signUp.headers["set-cookie"].join("; ")
    : signUp.headers["set-cookie"] ?? "";
  userId = signUp.json().user.id;
});

afterAll(async () => {
  if (userId) {
    await db.delete(usageEvents).where(eq(usageEvents.userId, userId));
    await db.delete(sessions).where(eq(sessions.userId, userId));
    await db.delete(users).where(eq(users.id, userId));
  }
  await app.close();
});

describe("Stripe webhook signature verification", () => {
  it("returns 400 with no stripe-signature header", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/billing/webhook",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ type: "checkout.session.completed" }),
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toContain("Missing signature");
  });

  it("returns 400 with a completely fabricated signature", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/billing/webhook",
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=9999999999,v1=fabricated_signature_value_here",
      },
      payload: JSON.stringify({
        id: "evt_fake",
        type: "checkout.session.completed",
        data: { object: { client_reference_id: userId, customer: "cus_fake" } },
      }),
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 with an empty stripe-signature header", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/billing/webhook",
      headers: {
        "content-type": "application/json",
        "stripe-signature": "",
      },
      payload: JSON.stringify({ type: "test" }),
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("Free-tier user quota cap", () => {
  it("free user starts with 10 minutes render allowance", async () => {
    const result = await canRender(userId);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(10);
  });

  it("free user allowed with 9 minutes used", async () => {
    await db.insert(usageEvents).values({
      userId,
      kind: "render_minutes",
      amount: "9",
    });

    const result = await canRender(userId);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(1);
  });

  it("free user blocked when render quota exceeded (10+ minutes)", async () => {
    await db.insert(usageEvents).values({
      userId,
      kind: "render_minutes",
      amount: "2",
    });

    const result = await canRender(userId);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
    expect(result.reason).toContain("exceeded");
  });

  it("transcribe quota also blocks at limit", async () => {
    await db.insert(usageEvents).values({
      userId,
      kind: "transcribe_minutes",
      amount: "11",
    });

    const result = await canTranscribe(userId);
    expect(result.allowed).toBe(false);
    expect(result.reason).toContain("exceeded");
  });

  it("getCurrentUsage returns accurate totals", async () => {
    const usage = await getCurrentUsage(userId);
    expect(usage.render_minutes).toBe(11);
    expect(usage.transcribe_minutes).toBe(11);
  });
});

describe("Quota after plan change", () => {
  it("upgrading to creator plan unlocks 600 minutes", async () => {
    await db
      .update(users)
      .set({ plan: "creator" })
      .where(eq(users.id, userId));

    const result = await canRender(userId);
    expect(result.allowed).toBe(true);
    expect(result.remaining).toBe(600 - 11);
  });

  it("downgrading back to free re-blocks the user", async () => {
    await db
      .update(users)
      .set({ plan: "free" })
      .where(eq(users.id, userId));

    const result = await canRender(userId);
    expect(result.allowed).toBe(false);
    expect(result.remaining).toBe(0);
  });
});

describe("planFromPriceId", () => {
  it("returns free for unknown price ID", () => {
    expect(planFromPriceId("price_unknown_123")).toBe("free");
  });

  // https://github.com/mathisdittrich/editron/issues/46
  it.skip("returns free for empty string", () => {
    expect(planFromPriceId("")).toBe("free");
  });
});

describe("Checkout endpoint adversarial", () => {
  it("returns 400 for empty plan", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/billing/checkout",
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({ plan: "" }),
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 for free plan (not a paid tier)", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/billing/checkout",
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({ plan: "free" }),
    });
    expect(res.statusCode).toBe(400);
  });

  it("returns 400 for SQL-injection-style plan name", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/billing/checkout",
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({ plan: "'; DROP TABLE users;--" }),
    });
    expect(res.statusCode).toBe(400);
  });
});
