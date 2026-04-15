import { test, expect } from "@playwright/test";

test.describe("Project creation wizard", () => {
  test.beforeEach(async ({ page }) => {
    await page.route("/api/projects", (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "proj_new",
            userId: "usr_01",
            title: "Test Project",
            brief: null,
            briefAudioKey: null,
            referenceKey: null,
            status: "draft",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
      }
      return route.continue();
    });
    await page.goto("/projects/new");
  });

  test("Step 1 renders with title input and reference drop zone", async ({
    page,
  }) => {
    const step = page.locator('[data-testid="step-1"]');
    await expect(step).toBeVisible();
    await expect(step.locator("h2")).toContainText("What are you");
    await expect(page.getByLabel(/title/i)).toBeVisible();
    await expect(page.locator('[data-testid="ref-drop-zone"]')).toBeVisible();
  });

  test("Step 1 skip advances to Step 2", async ({ page }) => {
    await page.locator('[data-testid="skip-button"]').click();
    await expect(page.locator('[data-testid="step-2"]')).toBeVisible();
  });

  test("Step 1 next advances to Step 2", async ({ page }) => {
    await page.getByLabel(/title/i).fill("My Launch Video");
    await page.locator('[data-testid="next-button"]').click();
    await expect(page.locator('[data-testid="step-2"]')).toBeVisible();
  });

  test("Step 2 renders brief textarea and voice memo controls", async ({
    page,
  }) => {
    await page.locator('[data-testid="skip-button"]').click();
    const step = page.locator('[data-testid="step-2"]');
    await expect(step).toBeVisible();
    await expect(step.locator("h2")).toContainText("Tell Editron");
    await expect(page.locator('[data-testid="brief-textarea"]')).toBeVisible();
    await expect(page.locator('[data-testid="record-button"]')).toBeVisible();
  });

  test("Step 2 shows char count at 400+", async ({ page }) => {
    await page.locator('[data-testid="skip-button"]').click();
    const textarea = page.locator('[data-testid="brief-textarea"]');
    await textarea.fill("x".repeat(410));
    await expect(page.getByText("410/500")).toBeVisible();
  });

  test("Step 2 skip advances to Step 3", async ({ page }) => {
    await page.locator('[data-testid="skip-button"]').click();
    await page.locator('[data-testid="skip-button"]').click();
    await expect(page.locator('[data-testid="step-3"]')).toBeVisible();
  });

  test("Step 3 renders source drop zone", async ({ page }) => {
    await page.locator('[data-testid="skip-button"]').click();
    await page.locator('[data-testid="skip-button"]').click();
    const step = page.locator('[data-testid="step-3"]');
    await expect(step).toBeVisible();
    await expect(step.locator("h2")).toContainText("Drop your");
    await expect(
      page.locator('[data-testid="source-drop-zone"]')
    ).toBeVisible();
  });

  test("Step 3 open project button is disabled until upload completes", async ({
    page,
  }) => {
    await page.locator('[data-testid="skip-button"]').click();
    await page.locator('[data-testid="skip-button"]').click();
    const btn = page.locator('[data-testid="open-project-button"]');
    await expect(btn).toBeDisabled();
  });

  test("Invalid file shows rejection message", async ({ page }) => {
    await page.locator('[data-testid="skip-button"]').click();
    await page.locator('[data-testid="skip-button"]').click();

    const fileInput = page.locator('[data-testid="source-drop-zone-input"]');
    await fileInput.setInputFiles({
      name: "thumbnail.jpg",
      mimeType: "image/jpeg",
      buffer: Buffer.from("fake"),
    });

    await expect(page.locator('[data-testid="reject-message"]')).toContainText(
      "isn't a video"
    );
  });

  test("Full wizard skip-through: all 3 steps navigable", async ({ page }) => {
    await expect(page.locator('[data-testid="step-1"]')).toBeVisible();
    await page.locator('[data-testid="skip-button"]').click();
    await expect(page.locator('[data-testid="step-2"]')).toBeVisible();
    await page.locator('[data-testid="skip-button"]').click();
    await expect(page.locator('[data-testid="step-3"]')).toBeVisible();
  });
});
