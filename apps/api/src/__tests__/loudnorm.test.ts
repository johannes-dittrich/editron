import "../polyfills.js";
import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { readFileSync } from "node:fs";
import {
  PutObjectCommand,
  GetObjectCommand,
  DeleteObjectCommand,
} from "@aws-sdk/client-s3";
import { QueueEvents } from "bullmq";
import { r2, R2_BUCKET, getRenderKey } from "@editron/shared/r2";
import { db } from "@editron/db/client";
import { users, projects, edls, renders } from "@editron/db";
import { eq } from "drizzle-orm";
import {
  loudnormQueue,
  startRenderWorkers,
  closeRenderQueues,
} from "../queue/render.js";

startRenderWorkers();
const queueEvents = new QueueEvents("loudnorm", {
  connection: { host: "localhost", port: 6379, maxRetriesPerRequest: null },
});

const userId = crypto.randomUUID();
const projectId = crypto.randomUUID();
const edlId = crypto.randomUUID();
const renderId = crypto.randomUUID();
const previewKey = getRenderKey(userId, projectId, edlId, "preview.mp4");
const finalKey = getRenderKey(userId, projectId, edlId, "final.mp4");

beforeAll(async () => {
  await db.insert(users).values({ id: userId, email: `ln-test-${Date.now()}@editron.ai` });
  await db.insert(projects).values({ id: projectId, userId, title: "Loudnorm Test" });
  await db.insert(edls).values({ id: edlId, projectId, payload: { ranges: [] } });
  await db.insert(renders).values({ id: renderId, edlId, status: "loudnorm" });

  const fixture = readFileSync("/tmp/test-fixture.mp4");
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET, Key: previewKey, Body: fixture, ContentType: "video/mp4",
  }));
});

afterAll(async () => {
  await queueEvents.close();
  await closeRenderQueues();
  for (const key of [previewKey, finalKey]) {
    try { await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })); } catch {}
  }
  try { await db.delete(users).where(eq(users.id, userId)); } catch {}
});

describe("loudnorm worker", () => {
  it("two-pass loudnorm to -14 LUFS and marks render done", async () => {
    const job = await loudnormQueue.add("loudnorm", {
      renderId, edlId, userId, projectId,
    });

    await job.waitUntilFinished(queueEvents, 60_000);
    expect(await job.getState()).toBe("completed");

    const finalObj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: finalKey }));
    expect(finalObj.ContentType).toBe("video/mp4");
    expect(Number(finalObj.ContentLength)).toBeGreaterThan(0);

    const [row] = await db.select().from(renders).where(eq(renders.id, renderId));
    expect(row.status).toBe("done");
    expect(row.r2Key).toBe(finalKey);
    expect(row.finishedAt).toBeDefined();
  }, 90_000);
});
