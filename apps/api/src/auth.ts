import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { getDb } from "@editron/db/client";
import * as schema from "@editron/db";
import crypto from "node:crypto";

const secret = process.env.BETTER_AUTH_SECRET;
if (!secret) {
  const generated = crypto.randomBytes(32).toString("hex");
  console.warn(
    "BETTER_AUTH_SECRET is not set. Generated a random secret for this session: " +
      generated.slice(0, 8) +
      "... — set BETTER_AUTH_SECRET in env for stable sessions across restarts.",
  );
  process.env.BETTER_AUTH_SECRET = generated;
}

export const auth = betterAuth({
  secret: process.env.BETTER_AUTH_SECRET,
  baseURL: process.env.BETTER_AUTH_URL ?? process.env.API_BASE_URL,
  basePath: "/api/auth",
  database: drizzleAdapter(getDb(), {
    provider: "pg",
    usePlural: true,
    schema,
    transaction: false,
  }),
  emailAndPassword: {
    enabled: true,
  },
  socialProviders: {
    github: {
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    },
  },
  session: {
    cookieCache: {
      enabled: true,
      maxAge: 5 * 60,
    },
  },
  advanced: {
    cookiePrefix: "editron",
    defaultCookieAttributes: {
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      httpOnly: true,
    },
    database: {
      generateId: "uuid",
    },
  },
  user: {
    additionalFields: {
      plan: {
        type: "string",
        defaultValue: "free",
        input: false,
      },
      stripeCustomerId: {
        type: "string",
        required: false,
        input: false,
      },
    },
  },
});

export type Auth = typeof auth;
