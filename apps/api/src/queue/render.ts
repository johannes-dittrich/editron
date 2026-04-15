import { Queue, Worker, type Job, type ConnectionOptions } from "bullmq";
import { processRenderSeg } from "../workers/render-seg.js";
import { processRenderConcat } from "../workers/render-concat.js";
import { processRenderFinal } from "../workers/render-final.js";
import { processLoudnorm } from "../workers/loudnorm.js";

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

export interface RenderSegJobData {
  renderId: string;
  edlId: string;
  segIndex: number;
  sourceR2Key: string;
  startS: number;
  endS: number;
  grade?: string;
  userId: string;
  projectId: string;
}

export interface RenderConcatJobData {
  renderId: string;
  edlId: string;
  segCount: number;
  userId: string;
  projectId: string;
}

export interface RenderFinalJobData {
  renderId: string;
  edlId: string;
  userId: string;
  projectId: string;
  overlays?: Array<{ file: string; start_in_output: number; duration: number }>;
  subtitlesR2Key?: string;
}

export interface LoudnormJobData {
  renderId: string;
  edlId: string;
  userId: string;
  projectId: string;
}

export const renderSegQueue = new Queue<RenderSegJobData, void, "render-seg">("render-seg", { connection });
export const renderConcatQueue = new Queue<RenderConcatJobData, void, "render-concat">("render-concat", { connection });
export const renderFinalQueue = new Queue<RenderFinalJobData, void, "render-final">("render-final", { connection });
export const loudnormQueue = new Queue<LoudnormJobData, void, "loudnorm">("loudnorm", { connection });

let renderSegWorker: Worker<RenderSegJobData> | undefined;
let renderConcatWorker: Worker<RenderConcatJobData> | undefined;
let renderFinalWorker: Worker<RenderFinalJobData> | undefined;
let loudnormWorker: Worker<LoudnormJobData> | undefined;

export function startRenderWorkers() {
  if (!renderSegWorker) {
    renderSegWorker = new Worker<RenderSegJobData>(
      "render-seg",
      async (job: Job<RenderSegJobData>) => {
        console.log(`[render-seg] Processing seg ${job.data.segIndex} for render ${job.data.renderId}`);
        await processRenderSeg(job.data);
      },
      { connection },
    );
    renderSegWorker.on("failed", (job, err) => {
      console.error(`[render-seg] Job ${job?.id} failed:`, err.message);
    });
  }

  if (!renderConcatWorker) {
    renderConcatWorker = new Worker<RenderConcatJobData>(
      "render-concat",
      async (job: Job<RenderConcatJobData>) => {
        console.log(`[render-concat] Concatenating ${job.data.segCount} segs for render ${job.data.renderId}`);
        await processRenderConcat(job.data);
      },
      { connection },
    );
    renderConcatWorker.on("failed", (job, err) => {
      console.error(`[render-concat] Job ${job?.id} failed:`, err.message);
    });
  }

  if (!renderFinalWorker) {
    renderFinalWorker = new Worker<RenderFinalJobData>(
      "render-final",
      async (job: Job<RenderFinalJobData>) => {
        console.log(`[render-final] Applying overlays + subtitles for render ${job.data.renderId}`);
        await processRenderFinal(job.data);
      },
      { connection },
    );
    renderFinalWorker.on("failed", (job, err) => {
      console.error(`[render-final] Job ${job?.id} failed:`, err.message);
    });
  }

  if (!loudnormWorker) {
    loudnormWorker = new Worker<LoudnormJobData>(
      "loudnorm",
      async (job: Job<LoudnormJobData>) => {
        console.log(`[loudnorm] Normalizing audio for render ${job.data.renderId}`);
        await processLoudnorm(job.data);
      },
      { connection },
    );
    loudnormWorker.on("failed", (job, err) => {
      console.error(`[loudnorm] Job ${job?.id} failed:`, err.message);
    });
  }
}

export async function closeRenderQueues(): Promise<void> {
  const workers = [renderSegWorker, renderConcatWorker, renderFinalWorker, loudnormWorker];
  for (const w of workers) {
    if (w) await w.close();
  }
  renderSegWorker = renderConcatWorker = renderFinalWorker = loudnormWorker = undefined;

  await renderSegQueue.close();
  await renderConcatQueue.close();
  await renderFinalQueue.close();
  await loudnormQueue.close();
}
