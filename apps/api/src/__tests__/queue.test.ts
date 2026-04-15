import "../polyfills.js";
import { describe, it, expect, afterAll } from "vitest";
import { Queue, QueueEvents } from "bullmq";
import {
  audioExtractQueue,
  startAudioExtractWorker,
  closeQueues,
  type AudioExtractJobData,
} from "../queue/index.js";
import { db } from "@editron/db/client";
import { users, uploads, projects } from "@editron/db";
import { eq } from "drizzle-orm";

const worker = startAudioExtractWorker();

const queueEvents = new QueueEvents("audio-extract", {
  connection: {
    host: "localhost",
    port: 6379,
    maxRetriesPerRequest: null,
  },
});

afterAll(async () => {
  await queueEvents.close();
  await closeQueues();
});

describe("BullMQ audio-extract queue", () => {
  it("processes a job and marks upload as processed", async () => {
    const userId = crypto.randomUUID();
    const projectId = crypto.randomUUID();
    const uploadId = crypto.randomUUID();

    await db.insert(users).values({
      id: userId,
      email: `queue-test-${Date.now()}@editron.ai`,
    });

    await db.insert(projects).values({
      id: projectId,
      userId,
      title: "Queue Test Project",
    });

    await db.insert(uploads).values({
      id: uploadId,
      projectId,
      kind: "source",
      r2Key: `test/${uploadId}/original.mp4`,
      status: "uploaded",
    });

    const jobData: AudioExtractJobData = {
      uploadId,
      r2Key: `test/${uploadId}/original.mp4`,
      userId,
      projectId,
    };

    const job = await audioExtractQueue.add("extract", jobData);

    await job.waitUntilFinished(queueEvents, 15_000);

    const [updated] = await db.select().from(uploads).where(eq(uploads.id, uploadId));
    expect(updated.status).toBe("processed");

    await db.delete(users).where(eq(users.id, userId));
  }, 20_000);
});
