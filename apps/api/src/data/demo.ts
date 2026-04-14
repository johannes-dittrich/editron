import { eq } from "drizzle-orm";
import { db, projects, timelines } from "@editron/db";
import { DEFAULT_TIMELINE } from "@editron/shared";

export function ensureDemoProject() {
  const existing = db.select().from(projects).where(eq(projects.id, "project-demo")).get();
  if (existing) {
    return;
  }

  db.insert(projects).values({
    id: "project-demo",
    userId: "user-demo",
    title: "Spring Campaign Launch",
    description: "Demo project for the Editron web workspace.",
    thumbnailUrl: null,
    settings: JSON.stringify({ aspectRatio: "16:9", fps: 24 })
  }).run();

  db.insert(timelines).values({
    id: "timeline-demo",
    projectId: "project-demo",
    data: JSON.stringify(DEFAULT_TIMELINE),
    version: 1
  }).run();
}
