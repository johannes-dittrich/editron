import { test, expect } from "@playwright/test";

const baseURL = process.env.STAGING_URL ?? "http://localhost:3000";

const PROJECT_ID = "proj_flow_01";

const mockProject = {
  id: PROJECT_ID,
  userId: "usr_flow",
  title: "Full Flow Test Project",
  brief: null,
  briefAudioKey: null,
  referenceKey: null,
  status: "ingesting",
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
};

const mockUploadIngesting = {
  id: "upl_flow_01",
  projectId: PROJECT_ID,
  kind: "source",
  r2Key: `src/${PROJECT_ID}/test-clip.mp4`,
  sizeBytes: 50000000,
  contentType: "video/mp4",
  status: "uploaded",
  multipartUploadId: null,
  createdAt: new Date().toISOString(),
};

function setupProjectRoutes(page: import("@playwright/test").Page) {
  return Promise.all([
    page.route(`**/api/projects/${PROJECT_ID}`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockProject),
      }),
    ),
    page.route(`**/api/projects/${PROJECT_ID}/uploads`, (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([mockUploadIngesting]),
      }),
    ),
  ]);
}

test.describe("Full flow: sign up → create project → ingest", () => {
  test("sign up redirects to dashboard", async ({ page }) => {
    await page.goto(`${baseURL}/signup`);

    await page.route("**/api/auth/sign-up**", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ user: { id: "usr_flow" }, token: "mock" }),
      }),
    );

    await page.getByLabel("Name").fill("Flow Tester");
    await page.getByLabel("Email").fill("flow@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();

    await page.waitForURL("**/dashboard");
    expect(page.url()).toContain("/dashboard");
  });

  test("wizard creates project and navigates through all 3 steps", async ({
    page,
  }) => {
    await page.route("**/api/projects", (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(mockProject),
        });
      }
      return route.continue();
    });

    await page.goto(`${baseURL}/projects/new`);

    await expect(page.locator('[data-testid="step-1"]')).toBeVisible();
    await page.getByLabel(/title/i).fill("Full Flow Test Project");
    await page.locator('[data-testid="next-button"]').click();

    await expect(page.locator('[data-testid="step-2"]')).toBeVisible();
    await page
      .locator('[data-testid="brief-textarea"]')
      .fill("A quick product demo for testing the full flow.");
    await page.locator('[data-testid="next-button"]').click();

    await expect(page.locator('[data-testid="step-3"]')).toBeVisible();
  });

  test("uploading a video in step 3 enables open project button", async ({
    page,
  }) => {
    await page.route("**/api/projects", (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify(mockProject),
        });
      }
      return route.continue();
    });

    await page.goto(`${baseURL}/projects/new`);

    await page.locator('[data-testid="skip-button"]').click();
    await page.locator('[data-testid="skip-button"]').click();
    await expect(page.locator('[data-testid="step-3"]')).toBeVisible();

    const openBtn = page.locator('[data-testid="open-project-button"]');
    await expect(openBtn).toBeDisabled();

    const fileInput = page.locator('[data-testid="source-drop-zone-input"]');
    await fileInput.setInputFiles({
      name: "test-clip.mp4",
      mimeType: "video/mp4",
      buffer: Buffer.alloc(1024),
    });

    await expect(page.locator('[data-testid="upload-list"]')).toBeVisible();
    await expect(openBtn).toBeEnabled({ timeout: 10_000 });
  });

  test("project detail shows ingest row with upload status", async ({
    page,
  }) => {
    await setupProjectRoutes(page);
    await page.goto(`${baseURL}/projects/${PROJECT_ID}`);

    await expect(
      page.locator('[data-testid="project-title"]'),
    ).toContainText("Full Flow Test Project");

    const row = page.locator(
      '[data-testid="upload-row"][data-status="uploaded"]',
    );
    await expect(row).toBeVisible();
    await expect(row).toContainText("test-clip.mp4");
  });

  test("rotating ingest messages change every ~2.5s", async ({ page }) => {
    await setupProjectRoutes(page);
    await page.goto(`${baseURL}/projects/${PROJECT_ID}`);

    const msg = page.locator('[data-testid="ingest-message"]').first();
    await expect(msg).toBeVisible();
    const text1 = await msg.textContent();

    await page.waitForTimeout(3000);
    const text2 = await msg.textContent();
    expect(text1).not.toEqual(text2);

    await page.waitForTimeout(3000);
    const text3 = await msg.textContent();
    expect(text2).not.toEqual(text3);
  });
});
