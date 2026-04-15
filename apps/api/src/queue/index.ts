import { Queue, Worker, type Job, type ConnectionOptions } from "bullmq";
import { db } from "@editron/db/client";
import { uploads } from "@editron/db";
import { eq } from "drizzle-orm";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

function parseRedisUrl(url: string): ConnectionOptions {
  const parsed = new URL(url);
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
    password: parsed.password || undefined,
    maxRetriesPerRequest: null,
  };
}

const connection = parseRedisUrl(REDIS_URL);

export interface AudioExtractJobData {
  uploadId: string;
  r2Key: string;
  userId: string;
  projectId: string;
}

export const audioExtractQueue = new Queue<AudioExtractJobData, void, "extract">("audio-extract", {
  connection,
});

let audioExtractWorker: Worker<AudioExtractJobData> | undefined;

export function startAudioExtractWorker(): Worker<AudioExtractJobData> {
  if (audioExtractWorker) return audioExtractWorker;

  audioExtractWorker = new Worker<AudioExtractJobData>(
    "audio-extract",
    async (job: Job<AudioExtractJobData>) => {
      const { uploadId } = job.data;
      console.log(`[audio-extract] Processing upload ${uploadId}`);

      await db
        .update(uploads)
        .set({ status: "processed" })
        .where(eq(uploads.id, uploadId));

      console.log(`[audio-extract] Marked upload ${uploadId} as processed`);
    },
    { connection },
  );

  audioExtractWorker.on("failed", (job, err) => {
    console.error(`[audio-extract] Job ${job?.id} failed:`, err.message);
  });

  return audioExtractWorker;
}

export async function closeQueues(): Promise<void> {
  if (audioExtractWorker) {
    await audioExtractWorker.close();
    audioExtractWorker = undefined;
  }
  await audioExtractQueue.close();
}
