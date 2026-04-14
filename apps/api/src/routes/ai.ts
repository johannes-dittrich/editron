import { mkdir } from "node:fs/promises";
import path from "node:path";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db, media } from "@editron/db";
import { gradeMedia, transcribeMedia } from "../lib/video-helpers.js";
import { rendersDir, uploadsDir } from "../lib/fs.js";

export async function registerAiRoutes(app: FastifyInstance) {
  app.post("/ai/transcribe", async (request, reply) => {
    const body = request.body as { mediaId?: string };
    if (!body.mediaId) {
      return reply.code(400).send({ error: "mediaId is required" });
    }

    const mediaFile = db.select().from(media).where(eq(media.id, body.mediaId)).get();
    if (!mediaFile) {
      return reply.code(404).send({ error: "Media not found" });
    }

    const inputPath = path.join(uploadsDir, mediaFile.filename);
    const editDir = path.join(uploadsDir, "edit");
    await mkdir(editDir, { recursive: true });
    const result = await transcribeMedia(inputPath, editDir);

    return {
      data: {
        mediaId: body.mediaId,
        transcriptDir: path.join(editDir, "transcripts"),
        stdout: result.stdout.trim()
      }
    };
  });

  app.post("/ai/grade", async (request, reply) => {
    const body = request.body as { mediaId?: string; preset?: string };
    if (!body.mediaId) {
      return reply.code(400).send({ error: "mediaId is required" });
    }

    const mediaFile = db.select().from(media).where(eq(media.id, body.mediaId)).get();
    if (!mediaFile) {
      return reply.code(404).send({ error: "Media not found" });
    }

    const inputPath = path.join(uploadsDir, mediaFile.filename);
    const outputPath = path.join(rendersDir, `${mediaFile.id}-graded.mp4`);
    const result = await gradeMedia(inputPath, outputPath, body.preset);

    return {
      data: {
        mediaId: body.mediaId,
        outputUrl: `/renders/${path.basename(outputPath)}`,
        stdout: result.stdout.trim()
      }
    };
  });
}
