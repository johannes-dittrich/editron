import "../polyfills.js";
import { describe, it, expect, afterAll } from "vitest";
import { readFileSync } from "node:fs";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { QueueEvents } from "bullmq";
import { r2, R2_BUCKET } from "@editron/shared/r2";
import { db } from "@editron/db/client";
import { users, uploads, projects } from "@editron/db";
import { eq } from "drizzle-orm";
import {
  audioExtractQueue,
  startAudioExtractWorker,
  closeQueues,
} from "../queue/index.js";

const worker = startAudioExtractWorker();
const queueEvents = new QueueEvents("audio-extract", {
  connection: { host: "localhost", port: 6379, maxRetriesPerRequest: null },
});

const userId = crypto.randomUUID();
const projectId = crypto.randomUUID();
const uploadId = crypto.randomUUID();
const sourceKey = `test/users/${userId}/projects/${projectId}/source/${uploadId}/fixture.mp4`;
const wavKey = `users/${userId}/projects/${projectId}/transcripts/${uploadId}.wav`;

afterAll(async () => {
  await queueEvents.close();
  await closeQueues();
  try { await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: sourceKey })); } catch {}
  try { await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: wavKey })); } catch {}
  try { await db.delete(users).where(eq(users.id, userId)); } catch {}
});

describe("audio-extract worker", () => {
  it("extracts audio from a video in R2 and uploads WAV", async () => {
    await db.insert(users).values({ id: userId, email: `ae-test-${Date.now()}@editron.ai` });
    await db.insert(projects).values({ id: projectId, userId, title: "AE Test" });
    await db.insert(uploads).values({
      id: uploadId,
      projectId,
      kind: "source",
      r2Key: sourceKey,
      status: "uploaded",
    });

    const fixture = readFileSync("/tmp/test-fixture.mp4");
    await r2.send(new PutObjectCommand({
      Bucket: R2_BUCKET,
      Key: sourceKey,
      Body: fixture,
      ContentType: "video/mp4",
    }));

    const job = await audioExtractQueue.add("extract", {
      uploadId,
      r2Key: sourceKey,
      userId,
      projectId,
    });

    await job.waitUntilFinished(queueEvents, 30_000);

    const [updated] = await db.select().from(uploads).where(eq(uploads.id, uploadId));
    expect(updated.status).toBe("processed");

    const wavObj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: wavKey }));
    expect(wavObj.ContentType).toBe("audio/wav");
    expect(Number(wavObj.ContentLength)).toBeGreaterThan(0);
  }, 60_000);
});
