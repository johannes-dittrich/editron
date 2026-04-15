import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { users } from "./users.js";

export const projects = pgTable("projects", {
  id: uuid("id").primaryKey().defaultRandom(),
  userId: uuid("user_id").notNull().references(() => users.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  brief: text("brief"),
  briefAudioKey: text("brief_audio_key"),
  referenceKey: text("reference_key"),
  proposedStrategy: text("proposed_strategy"),
  status: text("status", { enum: ["draft", "ingesting", "ready", "archived"] }).notNull().default("draft"),
  createdAt: timestamp("created_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true, mode: "string" }).notNull().defaultNow(),
});
