import { describe, it, expect } from "vitest";
import { getObjectKey, getTranscriptKey, getRenderKey } from "../r2.js";

describe("R2 key helpers", () => {
  const userId = "user-123";
  const projectId = "proj-456";
  const uploadId = "up-789";

  it("getObjectKey builds the correct path", () => {
    expect(getObjectKey(userId, projectId, "source", uploadId, "original.mp4")).toBe(
      "users/user-123/projects/proj-456/source/up-789/original.mp4",
    );
  });

  it("getObjectKey handles reference kind", () => {
    expect(getObjectKey(userId, projectId, "reference", uploadId, "ref.mp4")).toBe(
      "users/user-123/projects/proj-456/reference/up-789/ref.mp4",
    );
  });

  it("getObjectKey handles brief kind", () => {
    expect(getObjectKey(userId, projectId, "brief", uploadId, "memo.ogg")).toBe(
      "users/user-123/projects/proj-456/brief/up-789/memo.ogg",
    );
  });

  it("getTranscriptKey builds the correct path", () => {
    expect(getTranscriptKey(userId, projectId, uploadId)).toBe(
      "users/user-123/projects/proj-456/transcripts/up-789.json",
    );
  });

  it("getRenderKey builds the correct path", () => {
    expect(getRenderKey(userId, projectId, "edl-abc", "final.mp4")).toBe(
      "users/user-123/projects/proj-456/renders/edl-abc/final.mp4",
    );
  });
});
