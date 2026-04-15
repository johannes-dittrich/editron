import type { FastifyInstance } from "fastify";
import { db } from "@editron/db/client";
import { users } from "@editron/db";
import { eq } from "drizzle-orm";
import { getStripe, STRIPE_WEBHOOK_SECRET, PLAN_PRICE_MAP, planFromPriceId } from "../billing/stripe.js";
import { requireSession } from "../lib/session.js";

export async function registerBillingRoutes(app: FastifyInstance) {
  app.post("/api/billing/checkout", async (request, reply) => {
    const session = await requireSession(request, reply);
    if (!session) return;

    const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
    const planKey = body?.plan;

    if (!planKey || !PLAN_PRICE_MAP[planKey]) {
      reply.code(400);
      return { error: "plan must be 'creator' or 'studio'" };
    }

    const priceId = PLAN_PRICE_MAP[planKey].priceId;
    if (!priceId) {
      reply.code(500);
      return { error: "Price ID not configured for this plan" };
    }

    const successUrl = process.env.APP_URL
      ? `${process.env.APP_URL}/settings/billing?success=true`
      : "http://localhost:3000/settings/billing?success=true";
    const cancelUrl = process.env.APP_URL
      ? `${process.env.APP_URL}/settings/billing?canceled=true`
      : "http://localhost:3000/settings/billing?canceled=true";

    const checkoutSession = await getStripe().checkout.sessions.create({
      mode: "subscription",
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: session.user.id,
      customer_email: session.user.email,
    });

    return { url: checkoutSession.url };
  });

  app.post("/api/billing/portal", async (request, reply) => {
    const session = await requireSession(request, reply);
    if (!session) return;

    const [user] = await db.select().from(users).where(eq(users.id, session.user.id));
    if (!user?.stripeCustomerId) {
      reply.code(400);
      return { error: "No billing account found. Subscribe first." };
    }

    const returnUrl = process.env.APP_URL
      ? `${process.env.APP_URL}/settings/billing`
      : "http://localhost:3000/settings/billing";

    const portalSession = await getStripe().billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: returnUrl,
    });

    return { url: portalSession.url };
  });

  app.post("/api/billing/webhook", async (request, reply) => {
    const sig = request.headers["stripe-signature"];
    if (!sig || !STRIPE_WEBHOOK_SECRET) {
      reply.code(400);
      return { error: "Missing signature or webhook secret" };
    }

    const rawBody = typeof request.body === "string" ? request.body : JSON.stringify(request.body);

    let event;
    try {
      event = getStripe().webhooks.constructEvent(rawBody, sig as string, STRIPE_WEBHOOK_SECRET);
    } catch (err: any) {
      reply.code(400);
      return { error: `Webhook signature verification failed: ${err.message}` };
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.client_reference_id;
        const customerId = session.customer as string;
        const subscriptionId = session.subscription as string;

        if (userId && customerId) {
          const sub = await getStripe().subscriptions.retrieve(subscriptionId);
          const priceId = sub.items.data[0]?.price?.id ?? "";
          const plan = planFromPriceId(priceId);

          await db
            .update(users)
            .set({ stripeCustomerId: customerId, plan, updatedAt: new Date().toISOString() })
            .where(eq(users.id, userId));

          console.log(`[billing] checkout.session.completed: user=${userId} plan=${plan}`);
        }
        break;
      }

      case "customer.subscription.updated": {
        const sub = event.data.object;
        const customerId = sub.customer as string;
        const priceId = sub.items.data[0]?.price?.id ?? "";
        const plan = planFromPriceId(priceId);

        await db
          .update(users)
          .set({ plan, updatedAt: new Date().toISOString() })
          .where(eq(users.stripeCustomerId, customerId));

        console.log(`[billing] subscription.updated: customer=${customerId} plan=${plan}`);
        break;
      }

      case "customer.subscription.deleted": {
        const sub = event.data.object;
        const customerId = sub.customer as string;

        await db
          .update(users)
          .set({ plan: "free", updatedAt: new Date().toISOString() })
          .where(eq(users.stripeCustomerId, customerId));

        console.log(`[billing] subscription.deleted: customer=${customerId} → free`);
        break;
      }

      case "invoice.payment_failed": {
        const invoice = event.data.object;
        const customerId = invoice.customer as string;

        console.warn(`[billing] invoice.payment_failed: customer=${customerId}`);
        break;
      }
    }

    return { received: true };
  });
}
