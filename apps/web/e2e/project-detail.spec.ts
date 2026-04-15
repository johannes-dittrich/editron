import { test, expect } from "@playwright/test";

const mockProject = {
  id: "proj_01",
  userId: "usr_01",
  title: "Launch Video v2",
  brief: "60-second product launch video for social.",
  briefAudioKey: null,
  referenceKey: null,
  status: "ingesting",
  createdAt: "2026-04-01T09:00:00Z",
  updatedAt: "2026-04-12T16:30:00Z",
};

const mockUploads = [
  {
    id: "upl_01",
    projectId: "proj_01",
    kind: "source",
    r2Key: "src/proj_01/C0103.MP4",
    sizeBytes: 245000000,
    contentType: "video/mp4",
    status: "processed",
    multipartUploadId: null,
    createdAt: "2026-04-01T09:05:00Z",
    durationS: 167,
    speakers: 1,
  },
  {
    id: "upl_02",
    projectId: "proj_01",
    kind: "source",
    r2Key: "src/proj_01/C0108.MP4",
    sizeBytes: 180000000,
    contentType: "video/mp4",
    status: "uploaded",
    multipartUploadId: null,
    createdAt: "2026-04-01T09:06:00Z",
  },
  {
    id: "upl_03",
    projectId: "proj_01",
    kind: "source",
    r2Key: "src/proj_01/C0112.MP4",
    sizeBytes: 320000000,
    contentType: "video/mp4",
    status: "failed",
    multipartUploadId: null,
    createdAt: "2026-04-01T09:07:00Z",
  },
];

function setupRoutes(page: import("@playwright/test").Page) {
  return Promise.all([
    page.route("**/api/projects/proj_01", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockProject),
      })
    ),
    page.route("**/api/projects/proj_01/uploads", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockUploads),
      })
    ),
    page.route("**/api/uploads/upl_01/transcript", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          text: "[00:02] Ninety percent of what a web agent does is completely wasted.\n[00:08] We fixed this.\n[00:11] Editron reasons on the audio first.",
        }),
      })
    ),
  ]);
}

test.describe("Project detail page", () => {
  test("renders project title and brief", async ({ page }) => {
    await setupRoutes(page);
    await page.goto("/projects/proj_01");

    await expect(page.locator('[data-testid="project-title"]')).toContainText(
      "Launch Video v2"
    );
    await expect(page.getByText("60-second product launch")).toBeVisible();
  });

  test("renders upload rows with different statuses", async ({ page }) => {
    await setupRoutes(page);
    await page.goto("/projects/proj_01");

    const rows = page.locator('[data-testid="upload-row"]');
    await expect(rows).toHaveCount(3);

    const readyRow = page.locator('[data-testid="upload-row"][data-status="processed"]');
    await expect(readyRow).toContainText("C0103.MP4");
    await expect(readyRow).toContainText("processed");

    const ingestingRow = page.locator('[data-testid="upload-row"][data-status="uploaded"]');
    await expect(ingestingRow).toContainText("C0108.MP4");

    const failedRow = page.locator('[data-testid="upload-row"][data-status="failed"]');
    await expect(failedRow).toContainText("C0112.MP4");
    await expect(failedRow).toContainText("transcription failed");
  });

  test("ingesting row shows rotating messages", async ({ page }) => {
    await setupRoutes(page);
    await page.goto("/projects/proj_01");

    const msg = page.locator('[data-testid="ingest-message"]').first();
    await expect(msg).toBeVisible();
    const text1 = await msg.textContent();

    // Wait for rotation
    await page.waitForTimeout(3000);
    const text2 = await msg.textContent();
    expect(text1).not.toEqual(text2);
  });

  test("ready row has View transcript link", async ({ page }) => {
    await setupRoutes(page);
    await page.goto("/projects/proj_01");

    const transcriptBtn = page.locator('[data-testid="view-transcript"]');
    await expect(transcriptBtn).toBeVisible();
  });

  test("clicking View transcript opens side panel", async ({ page }) => {
    await setupRoutes(page);
    await page.goto("/projects/proj_01");

    await page.locator('[data-testid="view-transcript"]').click();
    const panel = page.locator('[data-testid="transcript-panel"]');
    await expect(panel).toBeVisible();
    await expect(panel).toContainText("Ninety percent");
  });

  test("transcript panel can be closed", async ({ page }) => {
    await setupRoutes(page);
    await page.goto("/projects/proj_01");

    await page.locator('[data-testid="view-transcript"]').click();
    await expect(page.locator('[data-testid="transcript-panel"]')).toBeVisible();

    await page.locator('[data-testid="close-transcript"]').click();
    await expect(page.locator('[data-testid="transcript-panel"]')).not.toBeVisible();
  });

  test("shows error state for non-existent project", async ({ page }) => {
    await page.route("**/api/projects/proj_missing", (route) =>
      route.fulfill({ status: 404, body: "not found" })
    );
    await page.route("**/api/projects/proj_missing/uploads", (route) =>
      route.fulfill({ status: 404, body: "not found" })
    );
    await page.goto("/projects/proj_missing");

    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();
  });

  test("back to dashboard link works", async ({ page }) => {
    await setupRoutes(page);
    await page.goto("/projects/proj_01");

    const backLink = page.getByRole("link", { name: /dashboard/i });
    await expect(backLink).toHaveAttribute("href", "/dashboard");
  });
});
