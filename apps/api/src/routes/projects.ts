import type { FastifyInstance } from "fastify";
import { db } from "@editron/db/client";
import { projects, edls, uploads } from "@editron/db";
import { eq, and, desc } from "drizzle-orm";
import { requireSession } from "../lib/session.js";

export async function registerProjectRoutes(app: FastifyInstance) {
  app.get("/api/projects", async (request, reply) => {
    const session = await requireSession(request, reply);
    if (!session) return;

    const rows = await db
      .select()
      .from(projects)
      .where(eq(projects.userId, session.user.id))
      .orderBy(desc(projects.updatedAt));

    return rows;
  });

  app.post<{ Body: { title: string } }>("/api/projects", async (request, reply) => {
    const session = await requireSession(request, reply);
    if (!session) return;

    const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;
    const title = body?.title;
    if (!title || typeof title !== "string" || title.trim().length === 0) {
      reply.code(400);
      return { error: "title is required" };
    }

    const [row] = await db
      .insert(projects)
      .values({ userId: session.user.id, title: title.trim() })
      .returning();

    reply.code(201);
    return row;
  });

  app.get<{ Params: { id: string } }>("/api/projects/:id", async (request, reply) => {
    const session = await requireSession(request, reply);
    if (!session) return;

    const [project] = await db
      .select()
      .from(projects)
      .where(and(eq(projects.id, request.params.id), eq(projects.userId, session.user.id)));

    if (!project) {
      reply.code(404);
      return { error: "Project not found" };
    }

    const projectUploads = await db
      .select()
      .from(uploads)
      .where(eq(uploads.projectId, project.id));

    const [latestEdl] = await db
      .select()
      .from(edls)
      .where(eq(edls.projectId, project.id))
      .orderBy(desc(edls.version))
      .limit(1);

    return { ...project, uploads: projectUploads, latestEdl: latestEdl ?? null };
  });

  app.patch<{ Params: { id: string }; Body: { title?: string; brief?: string; status?: string } }>(
    "/api/projects/:id",
    async (request, reply) => {
      const session = await requireSession(request, reply);
      if (!session) return;

      const body = typeof request.body === "string" ? JSON.parse(request.body) : request.body;

      const [existing] = await db
        .select({ id: projects.id })
        .from(projects)
        .where(and(eq(projects.id, request.params.id), eq(projects.userId, session.user.id)));

      if (!existing) {
        reply.code(404);
        return { error: "Project not found" };
      }

      const updates: Record<string, unknown> = { updatedAt: new Date().toISOString() };
      if (body?.title !== undefined) updates.title = body.title;
      if (body?.brief !== undefined) updates.brief = body.brief;
      if (body?.status !== undefined) updates.status = body.status;

      const [updated] = await db
        .update(projects)
        .set(updates)
        .where(eq(projects.id, request.params.id))
        .returning();

      return updated;
    },
  );

  app.delete<{ Params: { id: string } }>("/api/projects/:id", async (request, reply) => {
    const session = await requireSession(request, reply);
    if (!session) return;

    const [existing] = await db
      .select({ id: projects.id })
      .from(projects)
      .where(and(eq(projects.id, request.params.id), eq(projects.userId, session.user.id)));

    if (!existing) {
      reply.code(404);
      return { error: "Project not found" };
    }

    await db.delete(projects).where(eq(projects.id, request.params.id));

    reply.code(204).send();
  });
}
