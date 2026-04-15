import { z } from "zod";

export const edlRangeSchema = z.object({
  source: z.string(),
  start: z.number(),
  end: z.number(),
  beat: z.string().optional(),
  quote: z.string().optional(),
  reason: z.string().optional(),
});

export const edlOverlaySchema = z.object({
  file: z.string(),
  start_in_output: z.number(),
  duration: z.number(),
});

export const edlSchema = z.object({
  version: z.number().int().min(1),
  sources: z.record(z.string()),
  ranges: z.array(edlRangeSchema).min(1),
  grade: z.string().optional(),
  overlays: z.array(edlOverlaySchema).optional(),
  subtitles: z.string().optional(),
  total_duration_s: z.number().min(0.01),
});

export type EdlInput = z.infer<typeof edlSchema>;

const emitEdlParameters = {
  type: "object" as const,
  properties: {
    version: { type: "integer" as const, minimum: 1, description: "EDL version number" },
    sources: {
      type: "object" as const,
      additionalProperties: { type: "string" as const },
      description: "Map of source alias to R2 key",
    },
    ranges: {
      type: "array" as const,
      minItems: 1,
      description: "Ordered list of cut ranges",
      items: {
        type: "object" as const,
        required: ["source", "start", "end"] as const,
        properties: {
          source: { type: "string" as const, description: "Source key from the sources map" },
          start: { type: "number" as const, description: "Start time in seconds — must snap to a word boundary" },
          end: { type: "number" as const, description: "End time in seconds — must snap to a word boundary" },
          beat: { type: "string" as const, description: "Editorial beat label" },
          quote: { type: "string" as const, description: "Exact transcript text in this range" },
          reason: { type: "string" as const, description: "Why this range was chosen" },
        },
      },
    },
    grade: { type: "string" as const, description: "ffmpeg video filter for color grading" },
    overlays: {
      type: "array" as const,
      items: {
        type: "object" as const,
        required: ["file", "start_in_output", "duration"] as const,
        properties: {
          file: { type: "string" as const },
          start_in_output: { type: "number" as const },
          duration: { type: "number" as const },
        },
      },
    },
    subtitles: { type: "string" as const, description: "Subtitle style: 'short-form' or 'long-form'" },
    total_duration_s: { type: "number" as const, minimum: 0.01, description: "Total output duration in seconds" },
  },
  required: ["version", "sources", "ranges", "total_duration_s"] as const,
};

export const emitEdlTool = {
  type: "function" as const,
  function: {
    name: "emit_edl",
    description: "Emit a complete Edit Decision List (EDL) that the render pipeline will execute. Every cut start/end must snap to a word boundary from the transcript.",
    parameters: emitEdlParameters,
  },
};

export interface TranscriptWord {
  text: string;
  start: number;
  end: number;
  type: string;
  speaker_id?: string;
}

export function validateWordBoundaries(
  ranges: EdlInput["ranges"],
  words: TranscriptWord[],
  toleranceS = 0.1,
): string[] {
  if (words.length === 0) return [];

  const wordTimes = new Set<number>();
  for (const w of words) {
    wordTimes.add(Math.round(w.start * 100) / 100);
    wordTimes.add(Math.round(w.end * 100) / 100);
  }

  const errors: string[] = [];
  for (let i = 0; i < ranges.length; i++) {
    const r = ranges[i];
    const startSnapped = [...wordTimes].some((t) => Math.abs(t - r.start) <= toleranceS);
    const endSnapped = [...wordTimes].some((t) => Math.abs(t - r.end) <= toleranceS);

    if (!startSnapped) {
      errors.push(`Range ${i}: start ${r.start}s does not snap to a word boundary`);
    }
    if (!endSnapped) {
      errors.push(`Range ${i}: end ${r.end}s does not snap to a word boundary`);
    }
  }
  return errors;
}
