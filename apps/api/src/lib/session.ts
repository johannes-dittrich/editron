import type { FastifyRequest, FastifyReply } from "fastify";
import { auth } from "../auth.js";

export async function requireSession(request: FastifyRequest, reply: FastifyReply) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(request.headers)) {
    if (value) {
      if (Array.isArray(value)) {
        for (const v of value) headers.append(key, v);
      } else {
        headers.set(key, value);
      }
    }
  }

  const session = await auth.api.getSession({ headers });

  if (!session) {
    reply.code(401).send({ error: "Not authenticated" });
    return null;
  }

  return session;
}
