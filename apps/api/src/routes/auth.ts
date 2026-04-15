import type { FastifyInstance } from "fastify";
import { auth } from "../auth.js";

export async function registerAuthRoutes(app: FastifyInstance) {
  app.addContentTypeParser(
    "application/json",
    { parseAs: "string" },
    (_req, body, done) => {
      done(null, body);
    },
  );

  app.all("/api/auth/*", async (request, reply) => {
    const url = new URL(
      request.url,
      `${request.protocol}://${request.hostname}`,
    );

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

    const init: RequestInit = {
      method: request.method,
      headers,
    };

    if (request.method !== "GET" && request.method !== "HEAD" && request.body) {
      init.body =
        typeof request.body === "string"
          ? request.body
          : JSON.stringify(request.body);
    }

    const webRequest = new Request(url.toString(), init);
    const response = await auth.handler(webRequest);

    reply.status(response.status);

    for (const [key, value] of response.headers.entries()) {
      reply.header(key, value);
    }

    const body = await response.text();
    reply.send(body);
  });

  app.get("/api/me", async (request, reply) => {
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
      reply.code(401);
      return { error: "Not authenticated" };
    }

    return { user: session.user };
  });
}
