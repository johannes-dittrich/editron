import Fastify from "fastify";
import cors from "@fastify/cors";
import multipart from "@fastify/multipart";
import fastifyStatic from "@fastify/static";
import { ensureDemoProject } from "./data/demo.js";
import { ensureRuntimeDirs, rendersDir, uploadsDir } from "./lib/fs.js";
import { registerAiRoutes } from "./routes/ai.js";
import { registerHealthRoutes } from "./routes/health.js";
import { registerMediaRoutes } from "./routes/media.js";
import { registerProjectRoutes } from "./routes/projects.js";
import { registerRenderRoutes } from "./routes/render.js";

export async function buildApp() {
  ensureDemoProject();
  await ensureRuntimeDirs();

  const app = Fastify({
    logger: true
  });

  await app.register(cors, {
    origin: true
  });

  await app.register(multipart, {
    limits: {
      fileSize: 1024 * 1024 * 1024
    }
  });

  await app.register(fastifyStatic, {
    root: uploadsDir,
    prefix: "/uploads/",
    decorateReply: false
  });

  await app.register(fastifyStatic, {
    root: rendersDir,
    prefix: "/renders/",
    decorateReply: false
  });

  app.get("/", async () => ({
    name: "Editron API",
    docs: ["/health", "/projects", "/media/upload", "/render", "/ai/transcribe", "/ai/grade"]
  }));

  await registerHealthRoutes(app);
  await registerProjectRoutes(app);
  await registerMediaRoutes(app);
  await registerRenderRoutes(app);
  await registerAiRoutes(app);

  return app;
}
