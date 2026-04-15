import "./polyfills.js";
import Fastify from "fastify";
import cors from "@fastify/cors";
import { db } from "@editron/db/client";
import { sql } from "drizzle-orm";
import { registerAuthRoutes } from "./routes/auth.js";
import { registerProjectRoutes } from "./routes/projects.js";
import { registerUploadRoutes } from "./routes/uploads.js";

export async function buildApp() {
  const app = Fastify({ logger: true });

  await app.register(cors, { origin: true, credentials: true });

  app.get("/api/health", async () => {
    let dbStatus: "ok" | "down" = "down";
    try {
      await db.execute(sql`select 1`);
      dbStatus = "ok";
    } catch {
      dbStatus = "down";
    }

    return {
      status: dbStatus === "ok" ? "ok" : "degraded",
      service: "editron-api",
      db: dbStatus,
      timestamp: new Date().toISOString(),
    };
  });

  await registerAuthRoutes(app);
  await registerProjectRoutes(app);
  await registerUploadRoutes(app);

  return app;
}
