import { describe, it, expect, afterAll, beforeAll } from "vitest";
import { buildApp } from "../app.js";
import { DeleteObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@editron/shared/r2";

const app = await buildApp();

let sessionCookie: string;
let projectId: string;
let uploadId: string;
let multipartUploadId: string;
let r2KeyToClean: string;

beforeAll(async () => {
  const signUp = await app.inject({
    method: "POST",
    url: "/api/auth/sign-up/email",
    headers: { "content-type": "application/json" },
    payload: JSON.stringify({
      email: `upload-test-${Date.now()}@editron.ai`,
      password: "TestPass123!",
      name: "Upload Tester",
    }),
  });
  expect(signUp.statusCode).toBe(200);
  sessionCookie = Array.isArray(signUp.headers["set-cookie"])
    ? signUp.headers["set-cookie"].join("; ")
    : signUp.headers["set-cookie"] ?? "";

  const proj = await app.inject({
    method: "POST",
    url: "/api/projects",
    headers: { "content-type": "application/json", cookie: sessionCookie },
    payload: JSON.stringify({ title: "Upload Test Project" }),
  });
  expect(proj.statusCode).toBe(201);
  projectId = proj.json().id;
});

afterAll(async () => {
  if (r2KeyToClean) {
    try {
      await r2.send(new DeleteObjectCommand({ Bucket: R2_BUCKET, Key: r2KeyToClean }));
    } catch {}
  }
  await app.close();
});

describe("Multipart upload endpoints", () => {
  it("POST /api/uploads/initiate — creates upload and returns multipart info", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/uploads/initiate",
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({
        projectId,
        kind: "source",
        filename: "test-video.mp4",
        contentType: "video/mp4",
        sizeBytes: 20 * 1024 * 1024,
      }),
    });
    expect(res.statusCode).toBe(201);
    const body = res.json();
    expect(body.uploadId).toBeDefined();
    expect(body.multipartUploadId).toBeDefined();
    expect(body.partSize).toBe(10 * 1024 * 1024);
    expect(body.partCount).toBe(2);
    uploadId = body.uploadId;
    multipartUploadId = body.multipartUploadId;
  });

  it("POST /api/uploads/initiate — rejects invalid kind", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/uploads/initiate",
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({
        projectId,
        kind: "invalid",
        filename: "test.mp4",
      }),
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /api/uploads/initiate — rejects non-existent project", async () => {
    const res = await app.inject({
      method: "POST",
      url: "/api/uploads/initiate",
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({
        projectId: "00000000-0000-0000-0000-000000000000",
        kind: "source",
        filename: "test.mp4",
      }),
    });
    expect(res.statusCode).toBe(404);
  });

  it("POST /api/uploads/:id/part-url — returns a presigned URL", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/uploads/${uploadId}/part-url`,
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({ partNumber: 1 }),
    });
    expect(res.statusCode).toBe(200);
    const body = res.json();
    expect(body.url).toContain("X-Amz-Signature");
    expect(body.partNumber).toBe(1);
  });

  it("POST /api/uploads/:id/part-url — rejects invalid partNumber", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/uploads/${uploadId}/part-url`,
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({ partNumber: 0 }),
    });
    expect(res.statusCode).toBe(400);
  });

  it("POST /api/uploads/:id/abort — aborts the multipart upload", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/uploads/${uploadId}/abort`,
      headers: { cookie: sessionCookie },
    });
    expect(res.statusCode).toBe(204);
  });

  it("POST /api/uploads/:id/abort — 404 after already aborted", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/uploads/${uploadId}/abort`,
      headers: { cookie: sessionCookie },
    });
    expect(res.statusCode).toBe(404);
  });

  it("full upload flow: initiate → upload part via presigned URL → complete", async () => {
    const initRes = await app.inject({
      method: "POST",
      url: "/api/uploads/initiate",
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({
        projectId,
        kind: "source",
        filename: "small-test.bin",
        contentType: "application/octet-stream",
        sizeBytes: 256,
      }),
    });
    expect(initRes.statusCode).toBe(201);
    const initBody = initRes.json();
    const thisUploadId = initBody.uploadId;

    const urlRes = await app.inject({
      method: "POST",
      url: `/api/uploads/${thisUploadId}/part-url`,
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({ partNumber: 1 }),
    });
    expect(urlRes.statusCode).toBe(200);
    const presignedUrl = urlRes.json().url;

    const testData = Buffer.alloc(256, 0x42);
    const putRes = await fetch(presignedUrl, {
      method: "PUT",
      body: testData,
      headers: { "content-length": String(testData.length) },
    });
    expect(putRes.ok).toBe(true);
    const etag = putRes.headers.get("etag")!;

    const completeRes = await app.inject({
      method: "POST",
      url: `/api/uploads/${thisUploadId}/complete`,
      headers: { "content-type": "application/json", cookie: sessionCookie },
      payload: JSON.stringify({
        parts: [{ partNumber: 1, etag }],
      }),
    });
    expect(completeRes.statusCode).toBe(200);
    const completed = completeRes.json();
    expect(completed.status).toBe("uploaded");
    expect(completed.multipartUploadId).toBeNull();

    r2KeyToClean = completed.r2Key;
  });

  it("POST /api/uploads/:id/complete — 401 without session", async () => {
    const res = await app.inject({
      method: "POST",
      url: `/api/uploads/${uploadId}/complete`,
      headers: { "content-type": "application/json" },
      payload: JSON.stringify({ parts: [] }),
    });
    expect(res.statusCode).toBe(401);
  });
});
