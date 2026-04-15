import Stripe from "stripe";

let _stripe: Stripe | undefined;

export function getStripe(): Stripe {
  if (!_stripe) {
    const apiKey = process.env.STRIPE_SECRET_KEY;
    if (!apiKey) throw new Error("STRIPE_SECRET_KEY not set");
    _stripe = new Stripe(apiKey);
  }
  return _stripe;
}

export const STRIPE_WEBHOOK_SECRET = process.env.STRIPE_WEBHOOK_SECRET ?? "";

export const PLAN_PRICE_MAP: Record<string, { plan: string; priceId: string }> = {
  creator: {
    plan: "creator",
    priceId: process.env.STRIPE_CREATOR_PRICE_ID ?? "",
  },
  studio: {
    plan: "studio",
    priceId: process.env.STRIPE_STUDIO_PRICE_ID ?? "",
  },
};

export function planFromPriceId(priceId: string): "free" | "creator" | "studio" {
  for (const [, v] of Object.entries(PLAN_PRICE_MAP)) {
    if (v.priceId === priceId) return v.plan as "creator" | "studio";
  }
  return "free";
}
