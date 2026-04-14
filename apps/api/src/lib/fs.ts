import { mkdir } from "node:fs/promises";
import path from "node:path";

export const apiRoot = process.cwd();
export const uploadsDir = path.join(apiRoot, "uploads");
export const rendersDir = path.join(apiRoot, "renders");
export const transcriptDir = path.join(apiRoot, "uploads", "transcripts");

export async function ensureRuntimeDirs() {
  await Promise.all([
    mkdir(uploadsDir, { recursive: true }),
    mkdir(rendersDir, { recursive: true }),
    mkdir(transcriptDir, { recursive: true })
  ]);
}
