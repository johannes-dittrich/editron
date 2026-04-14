import { createWriteStream } from "node:fs";
import { stat } from "node:fs/promises";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db, media, projects } from "@editron/db";
import type { MediaType } from "@editron/shared";
import { ensureRuntimeDirs, uploadsDir } from "../lib/fs.js";

function detectMediaType(mimeType: string): MediaType {
  if (mimeType.startsWith("audio/")) {
    return "audio";
  }
  if (mimeType.startsWith("image/")) {
    return "image";
  }
  return "video";
}

export async function registerMediaRoutes(app: FastifyInstance) {
  app.post("/media/upload", async (request, reply) => {
    await ensureRuntimeDirs();

    const file = await request.file();
    if (!file) {
      return reply.code(400).send({ error: "No file uploaded" });
    }

    const fields = file.fields as Record<string, { value: string } | undefined>;
    const projectId = fields.projectId?.value;

    if (!projectId) {
      return reply.code(400).send({ error: "projectId is required" });
    }

    const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
    if (!project) {
      return reply.code(404).send({ error: "Project not found" });
    }

    const fileId = randomUUID();
    const safeName = `${fileId}-${file.filename.replace(/\s+/g, "-")}`;
    const destination = path.join(uploadsDir, safeName);

    await pipeline(file.file, createWriteStream(destination));
    const fileStats = await stat(destination);
    const mediaType = detectMediaType(file.mimetype);

    db.insert(media).values({
      id: fileId,
      projectId,
      filename: safeName,
      originalName: file.filename,
      url: `/uploads/${safeName}`,
      type: mediaType,
      duration: null,
      resolution: null,
      size: fileStats.size,
      metadata: JSON.stringify({ mimetype: file.mimetype })
    }).run();

    const created = db.select().from(media).where(eq(media.id, fileId)).get();
    return reply.code(201).send({ data: created });
  });
}
