import { spawn } from "node:child_process";
import { createReadStream } from "node:fs";
import { unlink, mkdtemp } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { Readable } from "node:stream";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, getRenderKey } from "@editron/shared/r2";
import type { RenderSegJobData } from "../queue/render.js";

export async function processRenderSeg(data: RenderSegJobData): Promise<void> {
  const { renderId, edlId, segIndex, sourceR2Key, startS, endS, grade, userId, projectId } = data;
  const duration = endS - startS;

  const tmpDir = await mkdtemp(join(tmpdir(), "editron-seg-"));
  const outPath = join(tmpDir, `seg_${segIndex}.mp4`);

  try {
    const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: sourceR2Key }));
    if (!obj.Body) throw new Error("Empty body from R2");

    const audioFadeIn = `afade=t=in:st=0:d=0.03`;
    const audioFadeOut = `afade=t=out:st=${Math.max(0, duration - 0.03)}:d=0.03`;
    const audioFilters = `${audioFadeIn},${audioFadeOut}`;

    const videoFilters = grade ? grade : "null";

    const args = [
      "-i", "pipe:0",
      "-ss", String(startS),
      "-t", String(duration),
      "-vf", videoFilters,
      "-af", audioFilters,
      "-c:v", "libx264", "-preset", "fast", "-crf", "18",
      "-c:a", "aac", "-b:a", "192k",
      "-movflags", "+faststart",
      "-y", outPath,
    ];

    const ffmpeg = spawn("ffmpeg", args, { stdio: ["pipe", "ignore", "pipe"] });

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

    const segKey = getRenderKey(userId, projectId, edlId, `segs/${segIndex}.mp4`);
    const segStream = createReadStream(outPath);

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: segKey,
        Body: segStream,
        ContentType: "video/mp4",
      }),
    );

    console.log(`[render-seg] Done: seg ${segIndex} → ${segKey}`);
  } finally {
    try { await unlink(outPath); } catch {}
    try { const { rmdir } = await import("node:fs/promises"); await rmdir(tmpDir); } catch {}
  }
}
