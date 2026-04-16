import { Queue, Worker, type Job, type ConnectionOptions } from "bullmq";
import { processAudioExtract } from "../workers/audio-extract.js";

const REDIS_URL = process.env.REDIS_URL ?? "redis://localhost:6379";

function parseRedisUrl(url: string): ConnectionOptions {
  const parsed = new URL(url);
  const isTls = parsed.protocol === "rediss:";
  return {
    host: parsed.hostname,
    port: Number(parsed.port) || 6379,
    username: parsed.username || undefined,
    password: parsed.password || undefined,
    maxRetriesPerRequest: null,
    ...(isTls ? { tls: {} } : {}),
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
      console.log(`[audio-extract] Processing upload ${job.data.uploadId}`);
      await processAudioExtract(job.data);
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
