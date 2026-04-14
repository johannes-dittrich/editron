import { randomUUID } from "node:crypto";
import { eq } from "drizzle-orm";
import type { FastifyInstance } from "fastify";
import { db, media, projects, timelines } from "@editron/db";
import { DEFAULT_TIMELINE } from "@editron/shared";

export async function registerProjectRoutes(app: FastifyInstance) {
  app.get("/projects", async () => {
    const rows = db.select().from(projects).all();
    return { data: rows };
  });

  app.get("/projects/:id", async (request, reply) => {
    const params = request.params as { id: string };
    const project = db.select().from(projects).where(eq(projects.id, params.id)).get();

    if (!project) {
      return reply.code(404).send({ error: "Project not found" });
    }

    const projectMedia = db.select().from(media).where(eq(media.projectId, params.id)).all();
    const timeline = db.select().from(timelines).where(eq(timelines.projectId, params.id)).get();

    return {
      data: {
        ...project,
        media: projectMedia,
        timeline: timeline ? JSON.parse(timeline.data) : DEFAULT_TIMELINE
      }
    };
  });

  app.post("/projects", async (request, reply) => {
    const body = request.body as { title?: string; description?: string | null };
    const projectId = randomUUID();

    db.insert(projects).values({
      id: projectId,
      userId: "user-demo",
      title: body.title?.trim() || "Untitled Project",
      description: body.description ?? null,
      thumbnailUrl: null,
      settings: JSON.stringify({ aspectRatio: "16:9", fps: 24 })
    }).run();

    db.insert(timelines).values({
      id: randomUUID(),
      projectId,
      data: JSON.stringify(DEFAULT_TIMELINE),
      version: 1
    }).run();

    const project = db.select().from(projects).where(eq(projects.id, projectId)).get();
    return reply.code(201).send({ data: project });
  });

  app.put("/projects/:id", async (request, reply) => {
    const params = request.params as { id: string };
    const body = request.body as { title?: string; description?: string | null; settings?: unknown };

    const existing = db.select().from(projects).where(eq(projects.id, params.id)).get();
    if (!existing) {
      return reply.code(404).send({ error: "Project not found" });
    }

    db.update(projects)
      .set({
        title: body.title?.trim() || existing.title,
        description: body.description ?? existing.description,
        settings: body.settings ? JSON.stringify(body.settings) : existing.settings,
        updatedAt: new Date().toISOString()
      })
      .where(eq(projects.id, params.id))
      .run();

    const project = db.select().from(projects).where(eq(projects.id, params.id)).get();
    return { data: project };
  });

  app.delete("/projects/:id", async (request, reply) => {
    const params = request.params as { id: string };

    db.delete(media).where(eq(media.projectId, params.id)).run();
    db.delete(timelines).where(eq(timelines.projectId, params.id)).run();
    db.delete(projects).where(eq(projects.id, params.id)).run();

    return reply.code(204).send();
  });
}
