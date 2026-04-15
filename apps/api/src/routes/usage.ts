import type { FastifyInstance } from "fastify";
import { requireSession } from "../lib/session.js";
import { getCurrentUsage, canRender, canTranscribe } from "../billing/quota.js";

export async function registerUsageRoutes(app: FastifyInstance) {
  app.get("/api/usage/current", async (request, reply) => {
    const session = await requireSession(request, reply);
    if (!session) return;

    const usage = await getCurrentUsage(session.user.id);
    const renderQuota = await canRender(session.user.id);
    const transcribeQuota = await canTranscribe(session.user.id);

    return {
      usage,
      quotas: {
        render: renderQuota,
        transcribe: transcribeQuota,
      },
    };
  });
}
