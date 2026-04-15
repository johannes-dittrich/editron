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
  renderFinalQueue,
  startRenderWorkers,
  closeRenderQueues,
} from "../queue/render.js";

startRenderWorkers();
const queueEvents = new QueueEvents("render-final", {
  connection: { host: "localhost", port: 6379, maxRetriesPerRequest: null },
});

const userId = crypto.randomUUID();
const projectId = crypto.randomUUID();
const edlId = crypto.randomUUID();
const renderId = crypto.randomUUID();
const baseKey = getRenderKey(userId, projectId, edlId, "base.mp4");
const srtKey = `test/${userId}/subs.srt`;
const previewKey = getRenderKey(userId, projectId, edlId, "preview.mp4");

const testSrt = `1
00:00:00,000 --> 00:00:01,000
Hello world

2
00:00:01,000 --> 00:00:02,000
Test subtitle
`;

beforeAll(async () => {
  const fixture = readFileSync("/tmp/test-fixture.mp4");
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET, Key: baseKey, Body: fixture, ContentType: "video/mp4",
  }));
  await r2.send(new PutObjectCommand({
    Bucket: R2_BUCKET, Key: srtKey, Body: testSrt, ContentType: "text/plain",
  }));
});

afterAll(async () => {
  await queueEvents.close();
  await closeRenderQueues();
  for (const key of [baseKey, srtKey, previewKey]) {
    try { await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })); } catch {}
  }
});

describe("render-final worker", () => {
  it("applies subtitles last and uploads preview.mp4", async () => {
    const job = await renderFinalQueue.add("render-final", {
      renderId,
      edlId,
      userId,
      projectId,
      subtitlesR2Key: srtKey,
    });

    await job.waitUntilFinished(queueEvents, 60_000);
    expect(await job.getState()).toBe("completed");

    const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: previewKey }));
    expect(obj.ContentType).toBe("video/mp4");
    expect(Number(obj.ContentLength)).toBeGreaterThan(0);
  }, 90_000);
});
