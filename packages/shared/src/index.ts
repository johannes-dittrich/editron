export const PLANS = {
  free: {
    id: "free",
    name: "Free",
    priceMonthly: 0,
    description: "For trying Editron on small personal projects.",
    maxProjects: 2,
    storageLabel: "500 MB",
    exportQuality: "720p",
    aiOperationsPerMonth: 5,
    watermark: true,
    features: ["2 projects", "500 MB storage", "720p export", "5 AI edits / month", "Editron watermark"]
  },
  pro: {
    id: "pro",
    name: "Pro",
    priceMonthly: 19,
    description: "For creators shipping content every week.",
    maxProjects: -1,
    storageLabel: "50 GB",
    exportQuality: "4K",
    aiOperationsPerMonth: 100,
    watermark: false,
    features: ["Unlimited projects", "50 GB storage", "4K export", "100 AI edits / month", "Priority rendering"]
  },
  business: {
    id: "business",
    name: "Business",
    priceMonthly: 49,
    description: "For teams managing a shared video pipeline.",
    maxProjects: -1,
    storageLabel: "500 GB",
    exportQuality: "4K",
    aiOperationsPerMonth: -1,
    watermark: false,
    features: ["Everything in Pro", "500 GB storage", "Unlimited AI edits", "5 team seats", "API access"]
  }
} as const;

export type PlanId = keyof typeof PLANS;

export const SUPPORTED_VIDEO_FORMATS = [
  "video/mp4",
  "video/quicktime",
  "video/x-msvideo",
  "video/webm",
  "video/x-matroska"
] as const;

export const SUPPORTED_AUDIO_FORMATS = [
  "audio/mpeg",
  "audio/wav",
  "audio/ogg",
  "audio/aac"
] as const;

export const EXPORT_FORMATS = ["mp4", "mov", "webm"] as const;
export type ExportFormat = (typeof EXPORT_FORMATS)[number];

export type MediaType = "video" | "audio" | "image";
export type ExportStatus = "pending" | "processing" | "complete" | "failed";

export interface Project {
  id: string;
  userId: string;
  title: string;
  description: string | null;
  thumbnailUrl: string | null;
  settings: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface MediaFile {
  id: string;
  projectId: string;
  filename: string;
  originalName: string;
  url: string;
  type: MediaType;
  duration: number | null;
  resolution: string | null;
  size: number | null;
  metadata: string | null;
  createdAt: string;
}

export interface TimelineClip {
  id: string;
  mediaId: string;
  label: string;
  startTime: number;
  duration: number;
  trimStart: number;
  trimEnd: number;
  color: string;
}

export interface TimelineTrack {
  id: string;
  name: string;
  type: "video" | "audio" | "text" | "effect";
  muted: boolean;
  locked: boolean;
  clips: TimelineClip[];
}

export interface TimelineData {
  duration: number;
  zoom: number;
  tracks: TimelineTrack[];
}

export interface ExportJob {
  id: string;
  projectId: string;
  status: ExportStatus;
  format: ExportFormat | string | null;
  resolution: string | null;
  url: string | null;
  errorMessage?: string | null;
  createdAt: string;
}

export interface AIChatMessage {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: string;
}

export interface EDLRange {
  source: string;
  start: number;
  end: number;
  beat?: string;
  quote?: string;
  reason?: string;
}

export interface EDLOverlay {
  file: string;
  start_in_output: number;
  duration: number;
}

export interface EDL {
  version: number;
  sources: Record<string, string>;
  ranges: EDLRange[];
  grade?: string;
  overlays?: EDLOverlay[];
  subtitles?: string;
  total_duration_s: number;
}

export const DEFAULT_TIMELINE: TimelineData = {
  duration: 72,
  zoom: 1,
  tracks: [
    {
      id: "video-1",
      name: "Primary Video",
      type: "video",
      muted: false,
      locked: false,
      clips: [
        {
          id: "clip-1",
          mediaId: "media-1",
          label: "A-roll intro",
          startTime: 0,
          duration: 18,
          trimStart: 0,
          trimEnd: 0.5,
          color: "#ff5a00"
        },
        {
          id: "clip-2",
          mediaId: "media-2",
          label: "Product close-up",
          startTime: 20,
          duration: 12,
          trimStart: 1.2,
          trimEnd: 0.2,
          color: "#ffa55b"
        }
      ]
    },
    {
      id: "audio-1",
      name: "Dialogue",
      type: "audio",
      muted: false,
      locked: false,
      clips: [
        {
          id: "clip-3",
          mediaId: "media-1",
          label: "Interview audio",
          startTime: 0,
          duration: 32,
          trimStart: 0,
          trimEnd: 0,
          color: "#1f6feb"
        }
      ]
    },
    {
      id: "text-1",
      name: "Titles",
      type: "text",
      muted: false,
      locked: false,
      clips: [
        {
          id: "clip-4",
          mediaId: "text-hero",
          label: "Opening headline",
          startTime: 4,
          duration: 6,
          trimStart: 0,
          trimEnd: 0,
          color: "#22c55e"
        }
      ]
    }
  ]
};
