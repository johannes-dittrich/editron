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
  renderConcatQueue,
  startRenderWorkers,
  closeRenderQueues,
} from "../queue/render.js";

startRenderWorkers();

const connOpts = { host: "localhost", port: 6379, maxRetriesPerRequest: null } as const;
const segEvents = new QueueEvents("render-seg", { connection: connOpts });
const concatEvents = new QueueEvents("render-concat", { connection: connOpts });

const userId = crypto.randomUUID();
const projectId = crypto.randomUUID();
const edlId = crypto.randomUUID();
const renderId = crypto.randomUUID();
const sourceKey = `test/${userId}/concat-source.mp4`;
const seg0Key = getRenderKey(userId, projectId, edlId, "segs/0.mp4");
const seg1Key = getRenderKey(userId, projectId, edlId, "segs/1.mp4");
const baseKey = getRenderKey(userId, projectId, edlId, "base.mp4");

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
  await segEvents.close();
  await concatEvents.close();
  await closeRenderQueues();
  for (const key of [sourceKey, seg0Key, seg1Key, baseKey]) {
    try { await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: key })); } catch {}
  }
});

describe("render-concat worker", () => {
  it("produces two segments then concatenates them losslessly", async () => {
    const base = { renderId, edlId, sourceR2Key: sourceKey, userId, projectId };

    const seg0 = await renderSegQueue.add("render-seg", { ...base, segIndex: 0, startS: 0, endS: 1 });
    const seg1 = await renderSegQueue.add("render-seg", { ...base, segIndex: 1, startS: 1, endS: 2 });

    await seg0.waitUntilFinished(segEvents, 30_000);
    await seg1.waitUntilFinished(segEvents, 30_000);

    const concatJob = await renderConcatQueue.add("render-concat", {
      renderId, edlId, segCount: 2, userId, projectId,
    });

    await concatJob.waitUntilFinished(concatEvents, 30_000);
    expect(await concatJob.getState()).toBe("completed");

    const baseObj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: baseKey }));
    expect(baseObj.ContentType).toBe("video/mp4");
    expect(Number(baseObj.ContentLength)).toBeGreaterThan(0);
  }, 90_000);
});
