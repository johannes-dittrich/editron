import { S3Client } from "@aws-sdk/client-s3";

const R2_ENDPOINT = process.env.R2_ENDPOINT ?? "https://897a68f060784ae59fc48d973c7d2a40.r2.cloudflarestorage.com";
const R2_ACCESS_KEY_ID = process.env.R2_ACCESS_KEY_ID ?? "";
const R2_SECRET_ACCESS_KEY = process.env.R2_SECRET_ACCESS_KEY ?? "";

export const R2_BUCKET = process.env.R2_BUCKET ?? "editron-media";

export const r2 = new S3Client({
  region: "auto",
  endpoint: R2_ENDPOINT,
  credentials: {
    accessKeyId: R2_ACCESS_KEY_ID,
    secretAccessKey: R2_SECRET_ACCESS_KEY,
  },
});

export type UploadKind = "source" | "reference" | "brief";

export function getObjectKey(
  userId: string,
  projectId: string,
  kind: UploadKind,
  uploadId: string,
  filename: string,
): string {
  return `users/${userId}/projects/${projectId}/${kind}/${uploadId}/${filename}`;
}

export function getTranscriptKey(userId: string, projectId: string, uploadId: string): string {
  return `users/${userId}/projects/${projectId}/transcripts/${uploadId}.json`;
}

export function getRenderKey(userId: string, projectId: string, edlId: string, filename: string): string {
  return `users/${userId}/projects/${projectId}/renders/${edlId}/${filename}`;
}
