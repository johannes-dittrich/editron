import { spawn } from "node:child_process";
import { createReadStream, createWriteStream } from "node:fs";
import { writeFile, unlink, mkdtemp, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { pipeline } from "node:stream/promises";
import { Readable } from "node:stream";
import { GetObjectCommand, PutObjectCommand } from "@aws-sdk/client-s3";
import { r2, R2_BUCKET, getRenderKey } from "@editron/shared/r2";
import type { RenderFinalJobData } from "../queue/render.js";

async function downloadToFile(key: string, path: string): Promise<void> {
  const obj = await r2.send(new GetObjectCommand({ Bucket: R2_BUCKET, Key: key }));
  if (!obj.Body) throw new Error(`Not found: ${key}`);
  const ws = createWriteStream(path);
  await pipeline(obj.Body as Readable, ws);
}

function runFfmpeg(args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    const proc = spawn("ffmpeg", args, { stdio: ["ignore", "ignore", "pipe"] });
    let stderrChunks: Buffer[] = [];
    proc.stderr.on("data", (chunk: Buffer) => stderrChunks.push(chunk));
    proc.on("close", (code) => {
      if (code !== 0) {
        const stderr = Buffer.concat(stderrChunks).toString().slice(-500);
        reject(new Error(`ffmpeg exited ${code}: ${stderr}`));
      } else {
        resolve();
      }
    });
    proc.on("error", reject);
  });
}

export async function processRenderFinal(data: RenderFinalJobData): Promise<void> {
  const { renderId, edlId, userId, projectId, overlays, subtitlesR2Key } = data;

  const tmpDir = await mkdtemp(join(tmpdir(), "editron-final-"));
  const baseKey = getRenderKey(userId, projectId, edlId, "base.mp4");
  const basePath = join(tmpDir, "base.mp4");

  try {
    await downloadToFile(baseKey, basePath);

    let currentInput = basePath;

    if (overlays && overlays.length > 0) {
      const overlaidPath = join(tmpDir, "overlaid.mp4");
      const inputs: string[] = ["-i", currentInput];
      const filterParts: string[] = [];

      for (let i = 0; i < overlays.length; i++) {
        const ov = overlays[i];
        const ovPath = join(tmpDir, `overlay_${i}.mp4`);
        await downloadToFile(ov.file, ovPath);
        inputs.push("-i", ovPath);

        // SKILL.md rule 4: setpts=PTS-STARTPTS+T/TB to shift overlay's frame 0 to window start
        const streamIdx = i + 1;
        const prevLabel = i === 0 ? "[0:v]" : `[ov${i - 1}]`;
        const enableWindow = `between(t,${ov.start_in_output},${ov.start_in_output + ov.duration})`;
        filterParts.push(
          `[${streamIdx}:v]setpts=PTS-STARTPTS+${ov.start_in_output}/TB[shifted${i}]`,
          `${prevLabel}[shifted${i}]overlay=enable='${enableWindow}'[ov${i}]`,
        );
      }

      const lastLabel = `[ov${overlays.length - 1}]`;
      const filterComplex = filterParts.join(";");

      await runFfmpeg([
        ...inputs,
        "-filter_complex", filterComplex,
        "-map", lastLabel,
        "-map", "0:a",
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-c:a", "copy",
        "-movflags", "+faststart",
        "-y", overlaidPath,
      ]);

      currentInput = overlaidPath;
    }

    // SKILL.md rule 1: subtitles are applied LAST
    if (subtitlesR2Key) {
      const srtPath = join(tmpDir, "subs.srt");
      await downloadToFile(subtitlesR2Key, srtPath);

      const subbedPath = join(tmpDir, "subbed.mp4");
      // Escape colons and backslashes in the path for ffmpeg subtitles filter
      const escapedSrtPath = srtPath.replace(/\\/g, "\\\\").replace(/:/g, "\\:");

      await runFfmpeg([
        "-i", currentInput,
        "-vf", `subtitles='${escapedSrtPath}'`,
        "-c:v", "libx264", "-preset", "fast", "-crf", "18",
        "-c:a", "copy",
        "-movflags", "+faststart",
        "-y", subbedPath,
      ]);

      currentInput = subbedPath;
    }

    const finalKey = getRenderKey(userId, projectId, edlId, "preview.mp4");
    const outStream = createReadStream(currentInput);

    await r2.send(
      new PutObjectCommand({
        Bucket: R2_BUCKET,
        Key: finalKey,
        Body: outStream,
        ContentType: "video/mp4",
      }),
    );

    console.log(`[render-final] Done: ${edlId} → ${finalKey}`);
  } finally {
    try {
      const files = await readdir(tmpDir);
      for (const f of files) await unlink(join(tmpDir, f));
      const { rmdir } = await import("node:fs/promises");
      await rmdir(tmpDir);
    } catch {}
  }
}
