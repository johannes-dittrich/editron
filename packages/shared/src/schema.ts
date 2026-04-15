export type PlanType = "free" | "creator" | "studio";
export type ProjectStatus = "draft" | "ingesting" | "ready" | "archived";
export type UploadKind = "source" | "reference" | "brief_audio";
export type UploadStatus = "pending" | "uploaded" | "processed" | "failed";
export type RenderStatus = "queued" | "extracting" | "concat" | "overlays" | "subtitles" | "loudnorm" | "done" | "failed";

export interface User {
  id: string;
  email: string;
  emailVerified: boolean;
  name: string | null;
  image: string | null;
  plan: PlanType;
  stripeCustomerId: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  userId: string;
  title: string;
  brief: string | null;
  briefAudioKey: string | null;
  referenceKey: string | null;
  status: ProjectStatus;
  createdAt: string;
  updatedAt: string;
}

export interface Upload {
  id: string;
  projectId: string;
  kind: UploadKind;
  r2Key: string;
  sizeBytes: number | null;
  contentType: string | null;
  status: UploadStatus;
  multipartUploadId: string | null;
  createdAt: string;
}

export interface Transcript {
  id: string;
  uploadId: string;
  words: unknown;
  durationS: string | null;
  language: string | null;
  createdAt: string;
}

export interface Edl {
  id: string;
  projectId: string;
  version: number;
  payload: unknown;
  approved: boolean;
  createdAt: string;
}

export interface Render {
  id: string;
  edlId: string;
  status: RenderStatus;
  r2Key: string | null;
  durationS: string | null;
  errorText: string | null;
  createdAt: Date;
  finishedAt: string | null;
}
