import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { unlink, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, getRenderKey } from "@editron/shared/r2";
import { db } from "@editron/db/client";
import { renders } from "@editron/db";
import { eq } from "drizzle-orm";
import type { LoudnormJobData } from "../queue/render.js";

function runFfmpeg(args: string[]): Promise<string> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderrChunks: Buffer[] = [];
    proc.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));
    proc.on("close", (code) => {
      const stderr = Buffer.concat(stderrChunks).toString();
      if (code !== 0) {
        reject(new Error(`ffmpeg exited ${code}: ${stderr.slice(-500)}`));
      } else {
        resolve(stderr);
      }
    });
    proc.on("error", reject);
  });
}

function parseLoudnormStats(stderr: string): {
  input_i: string;
  input_tp: string;
  input_lra: string;
  input_thresh: string;
  target_offset: string;
} {
  const match = stderr.match(/\{[^}]*"input_i"[^}]*\}/s);
  if (!match) throw new Error("Could not parse loudnorm stats from ffmpeg output");
  return JSON.parse(match[0]);
}

export async function processLoudnorm(data: LoudnormJobData): Promise<void> {
  const { renderId, edlId, userId, projectId } = data;

  const tmpDir = await mkdtemp(join(tmpdir(), "editron-loudnorm-"));
  const previewKey = getRenderKey(userId, projectId, edlId, "preview.mp4");
  const inputPath = join(tmpDir, "preview.mp4");
  const outputPath = join(tmpDir, "final.mp4");

  try {
    const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: previewKey }));
    if (!obj.Body) throw new Error(`Preview not found at ${previewKey}`);
    const ws = createWriteStream(inputPath);
    await pipeline(obj.Body as Readable, ws);

    // Pass 1: measure loudness
    const pass1Stderr = await runFfmpeg([
      "-i", inputPath,
      "-af", "loudnorm=I=-14:TP=-1:LRA=11:print_format=json",
      "-f", "null", "-",
    ]);

    const stats = parseLoudnormStats(pass1Stderr);

    // Pass 2: apply normalization with measured values
    await runFfmpeg([
      "-i", inputPath,
      "-af", [
        `loudnorm=I=-14:TP=-1:LRA=11`,
        `measured_I=${stats.input_i}`,
        `measured_TP=${stats.input_tp}`,
        `measured_LRA=${stats.input_lra}`,
        `measured_thresh=${stats.input_thresh}`,
        `offset=${stats.target_offset}`,
        `linear=true`,
        `print_format=summary`,
      ].join(":"),
      "-c:v", "copy",
      "-movflags", "+faststart",
      "-y", outputPath,
    ]);

    const finalKey = getRenderKey(userId, projectId, edlId, "final.mp4");
    const outStream = createReadStream(outputPath);

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: finalKey,
        Body: outStream,
        ContentType: "video/mp4",
      }),
    );

    await db
      .update(renders)
      .set({ status: "done", r2Key: finalKey, finishedAt: new Date().toISOString() })
      .where(eq(renders.id, renderId));

    console.log(`[loudnorm] Done: ${edlId} → ${finalKey}`);
  } finally {
    try { await unlink(inputPath); } catch {}
    try { await unlink(outputPath); } catch {}
    try { const { rmdir } = await import("node:fs/promises"); await rmdir(tmpDir); } catch {}
  }
}
