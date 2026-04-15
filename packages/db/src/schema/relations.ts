import { relations } from "drizzle-orm";
import { users } from "./users.js";
import { sessions, accounts } from "./sessions.js";
import { projects } from "./projects.js";
import { uploads } from "./uploads.js";
import { transcripts } from "./transcripts.js";
import { edls } from "./edls.js";
import { renders } from "./renders.js";

export const usersRelations = relations(users, ({ many }) => ({
  sessions: many(sessions),
  accounts: many(accounts),
  projects: many(projects),
}));

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const projectsRelations = relations(projects, ({ one, many }) => ({
  user: one(users, { fields: [projects.userId], references: [users.id] }),
  uploads: many(uploads),
  edls: many(edls),
}));

export const uploadsRelations = relations(uploads, ({ one, many }) => ({
  project: one(projects, { fields: [uploads.projectId], references: [projects.id] }),
  transcripts: many(transcripts),
}));

export const transcriptsRelations = relations(transcripts, ({ one }) => ({
  upload: one(uploads, { fields: [transcripts.uploadId], references: [uploads.id] }),
}));

export const edlsRelations = relations(edls, ({ one, many }) => ({
  project: one(projects, { fields: [edls.projectId], references: [projects.id] }),
  renders: many(renders),
}));

export const rendersRelations = relations(renders, ({ one }) => ({
  edl: one(edls, { fields: [renders.edlId], references: [edls.id] }),
}));
