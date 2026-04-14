import { writeFile } from "node:fs/promises";
import path from "node:path";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db, exports, projects } from "@editron/db";
import { renderFromEdl } from "../lib/video-helpers.js";
import { ensureRuntimeDirs, rendersDir } from "../lib/fs.js";

export async function registerRenderRoutes(app: FastifyInstance) {
  app.get("/render/:id", async (request, reply) => {
    const params = request.params as { id: string };
    const job = db.select().from(exports).where(eq(exports.id, params.id)).get();

    if (!job) {
      return reply.code(404).send({ error: "Render job not found" });
    }

    return { data: job };
  });

  app.post("/render", async (request, reply) => {
    await ensureRuntimeDirs();
    const body = request.body as {
      projectId?: string;
      resolution?: string;
      format?: string;
      edl?: unknown;
    };

    if (!body.projectId || !body.edl) {
      return reply.code(400).send({ error: "projectId and edl are required" });
    }

    const project = db.select().from(projects).where(eq(projects.id, body.projectId)).get();
    if (!project) {
      return reply.code(404).send({ error: "Project not found" });
    }

    const exportId = randomUUID();
    const edlPath = path.join(rendersDir, `${exportId}.json`);
    const outputPath = path.join(rendersDir, `${exportId}.${body.format ?? "mp4"}`);
    await writeFile(edlPath, JSON.stringify(body.edl, null, 2), "utf8");

    db.insert(exports).values({
      id: exportId,
      projectId: body.projectId,
      status: "processing",
      format: body.format ?? "mp4",
      resolution: body.resolution ?? "1080p",
      url: null
    }).run();

    renderFromEdl(edlPath, outputPath)
      .then(() => {
        db.update(exports)
          .set({
            status: "complete",
            url: `/renders/${path.basename(outputPath)}`
          })
          .where(eq(exports.id, exportId))
          .run();
      })
      .catch((error: Error) => {
        db.update(exports)
          .set({
            status: "failed",
            errorMessage: error.message
          })
          .where(eq(exports.id, exportId))
          .run();
      });

    const job = db.select().from(exports).where(eq(exports.id, exportId)).get();
    return reply.code(202).send({ data: job });
  });
}
