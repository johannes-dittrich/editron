import { http, HttpResponse, delay } from "msw";
import { currentUser } from "./fixtures/users";

export const handlers = [
  // Auth: POST /api/auth/sign-in
  http.post("/api/auth/sign-in", async ({ request }) => {
    await delay(200);
    const body = (await request.json()) as {
      email?: string;
      password?: string;
    };
    if (
      body.email === "alex@example.com" &&
      body.password === "password123"
    ) {
      return HttpResponse.json({ user: currentUser, token: "mock-jwt-token" });
    }
    return HttpResponse.json(
      { message: "those credentials don't match — try again" },
      { status: 401 }
    );
  }),

  // Auth: POST /api/auth/sign-up
  http.post("/api/auth/sign-up", async ({ request }) => {
    await delay(250);
    const body = (await request.json()) as {
      name?: string;
      email?: string;
      password?: string;
    };
    if (body.email === "taken@example.com") {
      return HttpResponse.json(
        { message: "an account with this email already exists" },
        { status: 409 }
      );
    }
    const newUser = {
      ...currentUser,
      id: `usr_${Date.now()}`,
      name: body.name ?? "New User",
      email: body.email ?? "new@example.com",
      plan: "free" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(
      { user: newUser, token: "mock-jwt-token" },
      { status: 201 }
    );
  }),

  // GET /api/me
  http.get("/api/me", async () => {
    await delay(80);
    return HttpResponse.json(currentUser);
  }),
];
