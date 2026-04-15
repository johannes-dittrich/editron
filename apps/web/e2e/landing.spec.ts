import { test, expect } from "@playwright/test";

test.describe("V4 Landing page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("hero headline renders with correct text", async ({ page }) => {
    const h1 = page.locator("h1");
    await expect(h1).toContainText("Drop the footage.");
    await expect(h1).toContainText("Describe the cut.");
    await expect(h1).toContainText("Ship the video.");
  });

  test("Try for free button links to /signup", async ({ page }) => {
    const heroCta = page
      .locator("section")
      .first()
      .getByRole("link", { name: /try for free/i })
      .first();
    await expect(heroCta).toBeVisible();
    await expect(heroCta).toHaveAttribute("href", "/signup");
  });

  test("pricing section has three plans", async ({ page }) => {
    const pricing = page.locator("#pricing");
    await expect(pricing).toBeVisible();

    await expect(pricing.getByText("Free", { exact: true })).toBeVisible();
    await expect(pricing.getByText("Creator", { exact: true })).toBeVisible();
    await expect(pricing.getByText("Studio", { exact: true })).toBeVisible();
  });

  test("internal anchor links have correct targets", async ({ page }) => {
    await expect(page.locator('nav a[href="#how"]')).toBeVisible();
    await expect(page.locator('nav a[href="#pricing"]')).toBeVisible();
    expect(await page.locator("#how").count()).toBe(1);
    expect(await page.locator("#pricing").count()).toBe(1);
  });

  test("nav sign in link goes to /login", async ({ page }) => {
    const signIn = page.getByRole("link", { name: "Sign in" });
    await expect(signIn).toHaveAttribute("href", "/login");
  });

  test("before/after section renders", async ({ page }) => {
    await expect(page.getByText("A raw take, an edit")).toBeVisible();
    await expect(page.getByText("Before — raw transcript")).toBeVisible();
    await expect(page.getByText("After — the cut")).toBeVisible();
  });

  test("how it works section has three steps", async ({ page }) => {
    const howSection = page.locator("#how");
    await expect(howSection.getByText("Set the context.")).toBeVisible();
    await expect(howSection.getByText("Approve the strategy.")).toBeVisible();
    await expect(howSection.getByText("Ship the cut.")).toBeVisible();
  });

  test("no horizontal scroll at 375px width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.waitForLoadState("networkidle");
    const bodyScrollWidth = await page.evaluate(() => document.body.scrollWidth);
    expect(bodyScrollWidth).toBeLessThanOrEqual(375);
  });
});
