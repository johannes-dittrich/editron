import { http, HttpResponse, delay } from "msw";
import { currentUser, projects, uploads } from "./fixtures";

export const handlers = [
  // GET /api/me
  http.get("/api/me", async () => {
    await delay(80);
    return HttpResponse.json(currentUser);
  }),

  // GET /api/projects
  http.get("/api/projects", async () => {
    await delay(120);
    return HttpResponse.json(projects);
  }),

  // POST /api/projects
  http.post("/api/projects", async ({ request }) => {
    await delay(150);
    const body = (await request.json()) as { title?: string; brief?: string };
    const newProject = {
      id: `proj_${Date.now()}`,
      userId: currentUser.id,
      title: body.title ?? "Untitled Project",
      brief: body.brief ?? null,
      briefAudioKey: null,
      referenceKey: null,
      status: "draft" as const,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    return HttpResponse.json(newProject, { status: 201 });
  }),

  // GET /api/projects/:id
  http.get("/api/projects/:id", async ({ params }) => {
    await delay(100);
    const project = projects.find((p) => p.id === params.id);
    if (!project) {
      return HttpResponse.json(
        { error: "project not found" },
        { status: 404 }
      );
    }
    return HttpResponse.json(project);
  }),

  // POST /api/uploads/initiate
  http.post("/api/uploads/initiate", async ({ request }) => {
    await delay(100);
    const body = (await request.json()) as {
      projectId: string;
      filename: string;
      contentType: string;
      sizeBytes: number;
      kind: string;
    };
    const uploadId = `upl_${Date.now()}`;
    return HttpResponse.json(
      {
        uploadId,
        r2Key: `src/${body.projectId}/${body.filename}`,
        multipartUploadId: `mpu_${Date.now()}`,
      },
      { status: 201 }
    );
  }),

  // POST /api/uploads/:id/part-url
  http.post("/api/uploads/:id/part-url", async ({ request }) => {
    await delay(50);
    const body = (await request.json()) as { partNumber: number };
    return HttpResponse.json({
      url: `https://mock-r2.example.com/upload-part?part=${body.partNumber}&token=mock`,
    });
  }),

  // POST /api/uploads/:id/complete
  http.post("/api/uploads/:id/complete", async ({ params }) => {
    await delay(200);
    const upload = uploads.find((u) => u.id === params.id);
    return HttpResponse.json({
      id: params.id,
      status: "uploaded" as const,
      r2Key: upload?.r2Key ?? `src/mock/${params.id}`,
    });
  }),
];
