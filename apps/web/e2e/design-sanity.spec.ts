import { test, expect } from "@playwright/test";

test.describe("Design sanity page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/design");
  });

  test("renders without console errors", async ({ page }) => {
    const errors: string[] = [];
    page.on("console", (msg) => {
      if (msg.type() === "error") errors.push(msg.text());
    });

    await page.reload();
    await page.waitForLoadState("networkidle");

    expect(errors).toEqual([]);
  });

  test("renders the page headline", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Editron");
    await expect(page.locator("h1")).toContainText("primitives");
  });

  test("typography section is visible", async ({ page }) => {
    const section = page.locator('[data-testid="section-typography"]');
    await expect(section).toBeVisible();
    await expect(section.locator("h2")).toContainText("Hero");
    await expect(section.locator("h3")).toContainText("Section");
    await expect(section.locator("h4")).toContainText("Card");
  });

  test("color tokens section renders all swatches", async ({ page }) => {
    const section = page.locator('[data-testid="section-colors"]');
    await expect(section).toBeVisible();

    const swatches = section.locator(".grid > div");
    await expect(swatches).toHaveCount(7);
  });

  test("buttons section renders all variants", async ({ page }) => {
    const section = page.locator('[data-testid="section-buttons"]');
    await expect(section).toBeVisible();

    const buttons = section.locator("button");
    await expect(buttons.first()).toBeVisible();
    expect(await buttons.count()).toBeGreaterThanOrEqual(5);
  });

  test("card section renders pricing cards", async ({ page }) => {
    const section = page.locator('[data-testid="section-card"]');
    await expect(section).toBeVisible();

    await expect(section.getByText("Free", { exact: true })).toBeVisible();
    await expect(section.getByText("Pro", { exact: true })).toBeVisible();
    await expect(section.getByText("Team", { exact: true })).toBeVisible();
  });

  test("inputs section renders form controls", async ({ page }) => {
    const section = page.locator('[data-testid="section-inputs"]');
    await expect(section).toBeVisible();

    await expect(section.locator('input[type="email"]')).toBeVisible();
    await expect(section.locator('input[type="password"]')).toBeVisible();
    await expect(section.locator("textarea")).toBeVisible();
  });

  test("dialog opens and closes", async ({ page }) => {
    const section = page.locator('[data-testid="section-dialog"]');
    await expect(section).toBeVisible();

    await section.locator("button", { hasText: "Open dialog" }).click();
    await expect(page.locator("text=Confirm export")).toBeVisible();

    await page.locator('[role="dialog"] button:has(.sr-only)').click();
    await expect(page.locator("text=Confirm export")).not.toBeVisible();
  });

  test("section pattern section is visible", async ({ page }) => {
    const section = page.locator('[data-testid="section-pattern"]');
    await expect(section).toBeVisible();
  });
});
