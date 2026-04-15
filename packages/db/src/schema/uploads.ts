import { bigint, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { projects } from "./projects.js";

export const uploads = pgTable("uploads", {
  id: uuid("id").primaryKey().defaultRandom(),
  projectId: uuid("project_id").notNull().references(() => projects.id, { onDelete: "cascade" }),
  kind: text("kind", { enum: ["source", "reference", "brief_audio"] }).notNull(),
  r2Key: text("r2_key").notNull(),
  sizeBytes: bigint("size_bytes", { mode: "number" }),
  contentType: text("content_type"),
  status: text("status", { enum: ["pending", "uploaded", "processed", "failed"] }).notNull().default("pending"),
  multipartUploadId: text("multipart_upload_id"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});
