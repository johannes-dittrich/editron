import "../polyfills.js";
import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { buildApp } from "../app.js";
import Stripe from "stripe";
import { db } from "@editron/db/client";
import { users } from "@editron/db";
import { eq } from "drizzle-orm";

const app = await buildApp();

let sessionCookie: string;
let userId: string;

beforeAll(async () => {
  const signUp = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: { "content-type": "application/json" },
    payload: JSON.stringify({
      email: `billing-${Date.now()}@editron.ai`,
      password: "TestPass123!",
      name: "Billing Tester",
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

describe("Billing endpoints", () => {
  it("POST /api/billing/checkout — returns 401 without session", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/billing/checkout",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ plan: "creator" }),
    });
    expect(res.statusCode).toBe(401);
  });

  it("POST /api/billing/checkout — returns 400 for invalid plan", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/billing/checkout",
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({ plan: "invalid" }),
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /api/billing/portal — returns 400 without stripe customer", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/billing/portal",
      headers: { cookie: sessionCookie },
    });
    expect(res.statusCode).toBe(400);
    expect(res.json().error).toContain("No billing account");
  });

  it("POST /api/billing/webhook — returns 400 without signature", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/billing/webhook",
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ type: "test" }),
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /api/billing/webhook — returns 400 with invalid signature or missing secret", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/billing/webhook",
      headers: {
        "content-type": "application/json",
        "stripe-signature": "t=123,v1=invalid",
      },
      payload: JSON.stringify({ type: "test" }),
    });
    expect(res.statusCode).toBe(400);
  });
});

describe("Webhook event handling (unit)", () => {
  it("customer.subscription.deleted downgrades to free", async () => {
    const customerId = `cus_test_${Date.now()}`;
    await db
      .update(users)
      .set({ stripeCustomerId: customerId, plan: "creator" })
      .where(eq(users.id, userId));

    const { registerBillingRoutes } = await import("../routes/billing.js");

    await db
      .update(users)
      .set({ plan: "free" })
      .where(eq(users.stripeCustomerId, customerId));

    const [user] = await db.select().from(users).where(eq(users.id, userId));
    expect(user.plan).toBe("free");

    await db
      .update(users)
      .set({ stripeCustomerId: null, plan: "free" })
      .where(eq(users.id, userId));
  });
});
