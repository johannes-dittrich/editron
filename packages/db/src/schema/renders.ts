import { numeric, pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { edls } from "./edls.js";

export const renders = pgTable("renders", {
  id: uuid("id").primaryKey().defaultRandom(),
  edlId: uuid("edl_id").notNull().references(() => edls.id, { onDelete: "cascade" }),
  status: text("status", {
    enum: ["queued", "extracting", "concat", "overlays", "subtitles", "loudnorm", "done", "failed"],
  }).notNull().default("queued"),
  r2Key: text("r2_key"),
  durationS: numeric("duration_s", { precision: 10, scale: 3 }),
  errorText: text("error_text"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  finishedAt: timestamp("finished_at", { withTimezone: true, mode: "string" }),
});
