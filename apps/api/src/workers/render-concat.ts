import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { writeFile, unlink, mkdtemp, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, getRenderKey } from "@editron/shared/r2";
import type { RenderConcatJobData } from "../queue/render.js";

export async function processRenderConcat(data: RenderConcatJobData): Promise<void> {
  const { renderId, edlId, segCount, userId, projectId } = data;

  const tmpDir = await mkdtemp(join(tmpdir(), "editron-concat-"));
  const concatListPath = join(tmpDir, "concat.txt");
  const outPath = join(tmpDir, "base.mp4");

  try {
    const lines: string[] = [];

    for (let i = 0; i < segCount; i++) {
      const segKey = getRenderKey(userId, projectId, edlId, `segs/${i}.mp4`);
      const segPath = join(tmpDir, `seg_${i}.mp4`);

      const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: segKey }));
      if (!obj.Body) throw new Error(`Segment ${i} not found at ${segKey}`);

      const ws = createWriteStream(segPath);
      await pipeline(obj.Body as Readable, ws);

      lines.push(`file '${segPath}'`);
    }

    await writeFile(concatListPath, lines.join("\n"));

    const ffmpeg = spawn("ffmpeg", [
      "-f", "concat",
      "-safe", "0",
      "-i", concatListPath,
      "-c", "copy",
      "-movflags", "+faststart",
      "-y", outPath,
    ], { stdio: ["ignore", "ignore", "pipe"] });

    let stderrChunks: Buffer[] = [];
    ffmpeg.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));

    const exitCode = await new Promise<number>((resolve, reject) => {
      ffmpeg.on("close", resolve);
      ffmpeg.on("error", reject);
    });

    if (exitCode !== 0) {
      const stderr = Buffer.concat(stderrChunks).toString().slice(-500);
      throw new Error(`ffmpeg concat exited with code ${exitCode}: ${stderr}`);
    }

    const baseKey = getRenderKey(userId, projectId, edlId, "base.mp4");
    const outStream = createReadStream(outPath);

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: baseKey,
        Body: outStream,
        ContentType: "video/mp4",
      }),
    );

    console.log(`[render-concat] Done: ${segCount} segs → ${baseKey}`);
  } finally {
    try {
      const files = await readdir(tmpDir);
      for (const f of files) await unlink(join(tmpDir, f));
      const { rmdir } = await import("node:fs/promises");
      await rmdir(tmpDir);
    } catch {}
  }
}
