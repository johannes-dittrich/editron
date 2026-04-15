import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { unlink, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET } from "@editron/shared/r2";
import { db } from "@editron/db/client";
import { uploads } from "@editron/db";
import { eq } from "drizzle-orm";
import type { AudioExtractJobData } from "../queue/index.js";

export async function processAudioExtract(data: AudioExtractJobData): Promise<void> {
  const { uploadId, r2Key, userId, projectId } = data;

  const tmpDir = await mkdtemp(join(tmpdir(), "editron-audio-"));
  const wavPath = join(tmpDir, `${uploadId}.wav`);

  try {
    const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: r2Key }));
    if (!obj.Body) throw new Error("Empty body from R2");

    const ffmpeg = spawn("ffmpeg", [
      "-i", "pipe:0",
      "-vn",
      "-ac", "1",
      "-ar", "16000",
      "-c:a", "pcm_s16le",
      "-y",
      wavPath,
    ], { stdio: ["pipe", "ignore", "pipe"] });

    let stderrChunks: Buffer[] = [];
    ffmpeg.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

    const bodyStream = obj.Body as Readable;
    bodyStream.pipe(ffmpeg.stdin);
    bodyStream.on("error", () => ffmpeg.stdin.destroy());
    ffmpeg.stdin.on("error", () => {});

    const exitCode = await new Promise<number>((resolve, reject) => {
      ffmpeg.on("close", resolve);
      ffmpeg.on("error", reject);
    });

    if (exitCode !== 0) {
      const stderr = Buffer.concat(stderrChunks).toString().slice(-500);
      throw new Error(`ffmpeg exited with code ${exitCode}: ${stderr}`);
    }

    const wavKey = `users/${userId}/projects/${projectId}/transcripts/${uploadId}.wav`;
    const wavStream = createReadStream(wavPath);

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: wavKey,
        Body: wavStream,
        ContentType: "audio/wav",
      }),
    );

    await db
      .update(uploads)
      .set({ status: "processed" })
      .where(eq(uploads.id, uploadId));

    console.log(`[audio-extract] Done: ${uploadId} → ${wavKey}`);
  } finally {
    try { await unlink(wavPath); } catch {}
    try { const { rmdir } = await import("node:fs/promises"); await rmdir(tmpDir); } catch {}
  }
}
