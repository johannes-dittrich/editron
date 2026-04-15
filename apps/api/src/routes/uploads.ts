import type { FastifyInstance } from "fastify";
import {
  CreateMultipartUploadCommand,
  UploadPartCommand,
  CompleteMultipartUploadCommand,
  AbortMultipartUploadCommand,
} from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { db } from "@editron/db/client";
import { uploads, projects } from "@editron/db";
import { eq, and } from "drizzle-orm";
import { r2, R2_BUCKET, getObjectKey, type UploadKind } from "@editron/shared/r2";
import { requireSession } from "../lib/session.js";

const PART_SIZE = 10 * 1024 * 1024; // 10 MB

const DB_KIND_TO_R2_KIND: Record<string, UploadKind> = {
  source: "source",
  reference: "reference",
  brief_audio: "brief",
};

export async function registerUploadRoutes(app: FastifyInstance) {
  app.post("/api/uploads/initiate", async (request, reply) => {
    const session = await requireSession(request, reply);
    if (!session) return;

    const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
    const { projectId, kind, filename, contentType, sizeBytes } = body ?? {};

    if (!projectId || !kind || !filename) {
      reply.code(400);
      return { error: "projectId, kind, and filename are required" };
    }

    if (!["source", "reference", "brief_audio"].includes(kind)) {
      reply.code(400);
      return { error: "kind must be source, reference, or brief_audio" };
    }

    const [project] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, projectId), eq(projects.userId, session.user.id)));

    if (!project) {
      reply.code(404);
      return { error: "Project not found" };
    }

    const uploadId = crypto.randomUUID();
    const r2Kind = DB_KIND_TO_R2_KIND[kind] ?? kind;
    const r2Key = getObjectKey(session.user.id, projectId, r2Kind as UploadKind, uploadId, filename);

    const multipart = await r2.send(
      new CreateMultipartUploadCommand({
        Bucket: R2_BUCKET,
        Key: r2Key,
        ContentType: contentType ?? "application/octet-stream",
      }),
    );

    const [row] = await db
      .insert(uploads)
      .values({
        id: uploadId,
        projectId,
        kind,
        r2Key,
        sizeBytes: sizeBytes ?? null,
        contentType: contentType ?? null,
        status: "pending",
        multipartUploadId: multipart.UploadId!,
      })
      .returning();

    const partCount = sizeBytes ? Math.ceil(sizeBytes / PART_SIZE) : 1;

    reply.code(201);
    return {
      uploadId: row.id,
      multipartUploadId: multipart.UploadId,
      partSize: PART_SIZE,
      partCount,
    };
  });

  app.post<{ Params: { id: string } }>("/api/uploads/:id/part-url", async (request, reply) => {
    const session = await requireSession(request, reply);
    if (!session) return;

    const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
    const partNumber = body?.partNumber;

    if (!partNumber || typeof partNumber !== "number" || partNumber < 1) {
      reply.code(400);
      return { error: "partNumber (positive integer) is required" };
    }

    const [upload] = await db.select().from(uploads).where(eq(uploads.id, request.params.id));

    if (!upload || !upload.multipartUploadId) {
      reply.code(404);
      return { error: "Upload not found or not in progress" };
    }

    const [project] = await db
      .select({ userId: projects.userId })
      .from(projects)
      .where(eq(projects.id, upload.projectId));

    if (!project || project.userId !== session.user.id) {
      reply.code(404);
      return { error: "Upload not found" };
    }

    const url = await getSignedUrl(
      r2,
      new UploadPartCommand({
        Bucket: R2_BUCKET,
        Key: upload.r2Key,
        UploadId: upload.multipartUploadId,
        PartNumber: partNumber,
      }),
      { expiresIn: 3600 },
    );

    return { url, partNumber };
  });

  app.post<{ Params: { id: string } }>("/api/uploads/:id/complete", async (request, reply) => {
    const session = await requireSession(request, reply);
    if (!session) return;

    const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
    const parts = body?.parts;

    if (!Array.isArray(parts) || parts.length === 0) {
      reply.code(400);
      return { error: "parts array is required" };
    }

    const [upload] = await db.select().from(uploads).where(eq(uploads.id, request.params.id));

    if (!upload || !upload.multipartUploadId) {
      reply.code(404);
      return { error: "Upload not found or not in progress" };
    }

    const [project] = await db
      .select({ userId: projects.userId })
      .from(projects)
      .where(eq(projects.id, upload.projectId));

    if (!project || project.userId !== session.user.id) {
      reply.code(404);
      return { error: "Upload not found" };
    }

    await r2.send(
      new CompleteMultipartUploadCommand({
        Bucket: R2_BUCKET,
        Key: upload.r2Key,
        UploadId: upload.multipartUploadId,
        MultipartUpload: {
          Parts: parts.map((p: { partNumber: number; etag: string }) => ({
            PartNumber: p.partNumber,
            ETag: p.etag,
          })),
        },
      }),
    );

    const [updated] = await db
      .update(uploads)
      .set({ status: "uploaded", multipartUploadId: null })
      .where(eq(uploads.id, upload.id))
      .returning();

    return updated;
  });

  app.post<{ Params: { id: string } }>("/api/uploads/:id/abort", async (request, reply) => {
    const session = await requireSession(request, reply);
    if (!session) return;

    const [upload] = await db.select().from(uploads).where(eq(uploads.id, request.params.id));

    if (!upload || !upload.multipartUploadId) {
      reply.code(404);
      return { error: "Upload not found or not in progress" };
    }

    const [project] = await db
      .select({ userId: projects.userId })
      .from(projects)
      .where(eq(projects.id, upload.projectId));

    if (!project || project.userId !== session.user.id) {
      reply.code(404);
      return { error: "Upload not found" };
    }

    await r2.send(
      new AbortMultipartUploadCommand({
        Bucket: R2_BUCKET,
        Key: upload.r2Key,
        UploadId: upload.multipartUploadId,
      }),
    );

    await db.delete(uploads).where(eq(uploads.id, upload.id));

    reply.code(204).send();
  });
}
