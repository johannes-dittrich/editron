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

  test('"Try for free" button links to /signup', async ({ page }) => {
    const heroCta = page
      .locator("section")
      .first()
      .getByRole("link", { name: /try for free/i });
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

  test("internal anchor links work", async ({ page }) => {
    await page.locator('a[href="#how"]').first().click();
    await expect(page).toHaveURL(/#how$/);

    const howSection = page.locator("#how");
    await expect(howSection).toBeInViewport();

    await page.locator('a[href="#pricing"]').click();
    await expect(page).toHaveURL(/#pricing$/);

    const pricingSection = page.locator("#pricing");
    await expect(pricingSection).toBeInViewport();
  });

  test("nav shows editron wordmark", async ({ page }) => {
    const wordmark = page.locator("nav .font-serif.italic");
    await expect(wordmark).toContainText("editron");
  });

  test("nav sign-in link points to /login", async ({ page }) => {
    const signIn = page.locator("nav").getByRole("link", { name: /sign in/i });
    await expect(signIn).toHaveAttribute("href", "/login");
  });

  test("footer is visible", async ({ page }) => {
    const footer = page.locator("footer");
    await expect(footer).toContainText("editron");
    await expect(footer).toContainText("2026");
  });

  test("no horizontal scroll at 375px width", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");

    const canScrollHorizontally = await page.evaluate(() => {
      const el = document.documentElement;
      const before = el.scrollLeft;
      el.scrollLeft = 100;
      const after = el.scrollLeft;
      el.scrollLeft = before;
      return after > 0;
    });
    expect(canScrollHorizontally).toBe(false);
  });
});
