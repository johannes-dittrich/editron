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
import {
  renderSegQueue,
  startRenderWorkers,
  closeRenderQueues,
  type RenderSegJobData,
} from "../queue/render.js";

startRenderWorkers();
const queueEvents = new QueueEvents("render-seg", {
  connection: { host: "localhost", port: 6379, maxRetriesPerRequest: null },
});

const userId = crypto.randomUUID();
const projectId = crypto.randomUUID();
const edlId = crypto.randomUUID();
const renderId = crypto.randomUUID();
const sourceKey = `test/${userId}/source.mp4`;
const segKey = getRenderKey(userId, projectId, edlId, "segs/0.mp4");

beforeAll(async () => {
  const fixture = readFileSync("/tmp/test-fixture.mp4");
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET,
    Key: sourceKey,
    Body: fixture,
    ContentType: "video/mp4",
  }));
});

afterAll(async () => {
  await queueEvents.close();
  await closeRenderQueues();
  try { await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: sourceKey })); } catch {}
  try { await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: segKey })); } catch {}
});

describe("render-seg worker", () => {
  it("extracts a segment with grade + audio fades and uploads to R2", async () => {
    const jobData: RenderSegJobData = {
      renderId,
      edlId,
      segIndex: 0,
      sourceR2Key: sourceKey,
      startS: 0,
      endS: 1.5,
      grade: "eq=brightness=0.05:saturation=1.2",
      userId,
      projectId,
    };

    const job = await renderSegQueue.add("render-seg", jobData);
    await job.waitUntilFinished(queueEvents, 30_000);

    const state = await job.getState();
    expect(state).toBe("completed");

    const segObj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: segKey }));
    expect(segObj.ContentType).toBe("video/mp4");
    expect(Number(segObj.ContentLength)).toBeGreaterThan(0);
  }, 60_000);
});
