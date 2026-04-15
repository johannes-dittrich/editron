import { describe, it, expect } from "vitest";
import { getObjectKey, getTranscriptKey, getRenderKey } from "@editron/shared/r2";

const USER_A = "user-aaa-111";
const USER_B = "user-bbb-222";
const PROJECT_A = "proj-aaa-111";
const PROJECT_B = "proj-bbb-222";
const UPLOAD_ID = "upload-xxx";
const EDL_ID = "edl-yyy";

describe("Rule 12 — all outputs under user's project prefix", () => {
  it("source upload key is under users/{userId}/projects/{projectId}/", () => {
    const key = getObjectKey(USER_A, PROJECT_A, "source", UPLOAD_ID, "video.mp4");
    expect(key).toMatch(new RegExp(`^users/${USER_A}/projects/${PROJECT_A}/`));
    expect(key).toContain("source");
    expect(key).toContain(UPLOAD_ID);
    expect(key).toContain("video.mp4");
  });

  it("reference upload key is under the same prefix", () => {
    const key = getObjectKey(USER_A, PROJECT_A, "reference", UPLOAD_ID, "ref.mp4");
    expect(key).toMatch(new RegExp(`^users/${USER_A}/projects/${PROJECT_A}/`));
    expect(key).toContain("reference");
  });

  it("brief upload key is under the same prefix", () => {
    const key = getObjectKey(USER_A, PROJECT_A, "brief", UPLOAD_ID, "brief.webm");
    expect(key).toMatch(new RegExp(`^users/${USER_A}/projects/${PROJECT_A}/`));
    expect(key).toContain("brief");
  });

  it("transcript key is under users/{userId}/projects/{projectId}/transcripts/", () => {
    const key = getTranscriptKey(USER_A, PROJECT_A, UPLOAD_ID);
    expect(key).toMatch(
      new RegExp(`^users/${USER_A}/projects/${PROJECT_A}/transcripts/`),
    );
    expect(key).toContain(UPLOAD_ID);
  });

  it("render key is under users/{userId}/projects/{projectId}/renders/", () => {
    const key = getRenderKey(USER_A, PROJECT_A, EDL_ID, "preview.mp4");
    expect(key).toMatch(
      new RegExp(`^users/${USER_A}/projects/${PROJECT_A}/renders/`),
    );
    expect(key).toContain(EDL_ID);
    expect(key).toContain("preview.mp4");
  });

  it("render segment keys are under the same render prefix", () => {
    const key = getRenderKey(USER_A, PROJECT_A, EDL_ID, "segs/0.mp4");
    expect(key).toMatch(
      new RegExp(`^users/${USER_A}/projects/${PROJECT_A}/renders/${EDL_ID}/`),
    );
    expect(key).toContain("segs/0.mp4");
  });

  it("different users never share a prefix", () => {
    const keyA = getObjectKey(USER_A, PROJECT_A, "source", UPLOAD_ID, "v.mp4");
    const keyB = getObjectKey(USER_B, PROJECT_B, "source", UPLOAD_ID, "v.mp4");
    expect(keyA).not.toEqual(keyB);
    expect(keyA).toContain(USER_A);
    expect(keyA).not.toContain(USER_B);
    expect(keyB).toContain(USER_B);
    expect(keyB).not.toContain(USER_A);
  });

  it("different projects under the same user have distinct prefixes", () => {
    const keyA = getObjectKey(USER_A, PROJECT_A, "source", UPLOAD_ID, "v.mp4");
    const keyB = getObjectKey(USER_A, PROJECT_B, "source", UPLOAD_ID, "v.mp4");
    expect(keyA).not.toEqual(keyB);
    expect(keyA).toContain(PROJECT_A);
    expect(keyB).toContain(PROJECT_B);
  });

  it("no key function can produce a path outside the user prefix", () => {
    const keys = [
      getObjectKey(USER_A, PROJECT_A, "source", UPLOAD_ID, "test.mp4"),
      getTranscriptKey(USER_A, PROJECT_A, UPLOAD_ID),
      getRenderKey(USER_A, PROJECT_A, EDL_ID, "preview.mp4"),
    ];

    for (const key of keys) {
      expect(key.startsWith(`users/${USER_A}/`)).toBe(true);
      expect(key).not.toContain("..");
    }
  });
});
