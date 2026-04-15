import { test, expect } from "@playwright/test";

const mockProjects = [
  {
    id: "proj_01",
    userId: "usr_01",
    title: "Launch Video v2",
    brief: "A product launch video",
    briefAudioKey: null,
    referenceKey: null,
    status: "ready",
    createdAt: "2026-04-01T09:00:00Z",
    updatedAt: "2026-04-12T16:30:00Z",
  },
  {
    id: "proj_02",
    userId: "usr_01",
    title: "Onboarding Walkthrough",
    brief: null,
    briefAudioKey: null,
    referenceKey: null,
    status: "ingesting",
    createdAt: "2026-04-10T14:00:00Z",
    updatedAt: "2026-04-14T11:00:00Z",
  },
  {
    id: "proj_03",
    userId: "usr_01",
    title: "Untitled Project",
    brief: null,
    briefAudioKey: null,
    referenceKey: null,
    status: "draft",
    createdAt: "2026-04-14T08:00:00Z",
    updatedAt: "2026-04-14T08:00:00Z",
  },
];

test.describe("Dashboard", () => {
  test("renders project grid from mock data", async ({ page }) => {
    await page.route("/api/projects", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockProjects),
      })
    );
    await page.goto("/dashboard");

    const cards = page.locator('[data-testid="project-card"]');
    await expect(cards).toHaveCount(3);

    await expect(cards.nth(0)).toContainText("Launch Video v2");
    await expect(cards.nth(0)).toContainText("ready");
    await expect(cards.nth(1)).toContainText("Onboarding Walkthrough");
    await expect(cards.nth(1)).toContainText("ingesting");
    await expect(cards.nth(2)).toContainText("Untitled Project");
    await expect(cards.nth(2)).toContainText("draft");
  });

  test("project cards link to /projects/[id]", async ({ page }) => {
    await page.route("/api/projects", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockProjects),
      })
    );
    await page.goto("/dashboard");

    const firstCard = page.locator('[data-testid="project-card"]').first();
    await expect(firstCard).toHaveAttribute("href", "/projects/proj_01");
  });

  test("shows empty state when no projects", async ({ page }) => {
    await page.route("/api/projects", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    );
    await page.goto("/dashboard");

    const empty = page.locator('[data-testid="empty-state"]');
    await expect(empty).toBeVisible();
    await expect(empty).toContainText("Your first cut is a");
    await expect(empty).toContainText("tap away");

    const cta = empty.getByRole("link", { name: /new project/i });
    await expect(cta).toBeVisible();
    await expect(cta).toHaveAttribute("href", "/projects/new");
  });

  test("shows error state on fetch failure", async ({ page }) => {
    await page.route("/api/projects", (route) =>
      route.fulfill({ status: 500, body: "Internal Server Error" })
    );
    await page.goto("/dashboard");

    const error = page.locator('[data-testid="error-state"]');
    await expect(error).toBeVisible();
    await expect(error).toContainText("couldn't load your projects");
    await expect(error.getByText("retry?")).toBeVisible();
  });

  test("retry button re-fetches projects", async ({ page }) => {
    // First: intercept to return error
    await page.route("/api/projects", (route) =>
      route.fulfill({
        status: 500,
        contentType: "application/json",
        body: JSON.stringify({ error: "server error" }),
      })
    );

    await page.goto("/dashboard");
    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();

    // Now swap route to return success
    await page.unroute("/api/projects");
    await page.route("/api/projects", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockProjects),
      })
    );

    await page.getByText("retry?").click();
    await expect(page.locator('[data-testid="project-card"]')).toHaveCount(3);
  });

  test("shows loading skeleton initially", async ({ page }) => {
    await page.route("/api/projects", async (route) => {
      await new Promise((r) => setTimeout(r, 2000));
      return route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify(mockProjects),
      });
    });
    await page.goto("/dashboard");

    const skeletons = page.locator('[data-testid="skeleton-card"]');
    await expect(skeletons.first()).toBeVisible();
    expect(await skeletons.count()).toBe(6);
  });

  test("top bar shows editron wordmark", async ({ page }) => {
    await page.route("/api/projects", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    );
    await page.goto("/dashboard");

    const wordmark = page.locator("nav .font-serif.italic");
    await expect(wordmark).toContainText("editron");
  });

  test("top bar New project CTA links to /projects/new", async ({ page }) => {
    await page.route("/api/projects", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    );
    await page.goto("/dashboard");

    const cta = page.locator("nav").getByRole("link", { name: /new project/i });
    await expect(cta).toHaveAttribute("href", "/projects/new");
  });

  test("user menu opens and shows sign-out link", async ({ page }) => {
    await page.route("/api/projects", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    );
    await page.goto("/dashboard");

    await page.locator('[data-testid="user-menu-button"]').click();
    const dropdown = page.locator('[data-testid="user-menu-dropdown"]');
    await expect(dropdown).toBeVisible();

    const signOut = page.locator('[data-testid="sign-out-link"]');
    await expect(signOut).toBeVisible();
    await expect(signOut).toContainText("Sign out");
  });
});
