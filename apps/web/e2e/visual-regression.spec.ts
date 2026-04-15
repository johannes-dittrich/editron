import { test, expect } from "@playwright/test";

test.describe("Visual regression @visual", () => {
  test("landing page — desktop", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("landing-desktop.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("landing page — mobile", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto("/");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("landing-mobile.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("login page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/login");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("login.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("signup page", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/signup");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("signup.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("dashboard — with projects", async ({ page }) => {
    await page.route("/api/projects", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
          {
            id: "proj_01",
            userId: "usr_01",
            title: "Launch Video v2",
            brief: null,
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
        ]),
      })
    );
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("dashboard-projects.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("dashboard — empty state", async ({ page }) => {
    await page.route("/api/projects", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([]),
      })
    );
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/dashboard");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("dashboard-empty.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("new project wizard — step 1", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/projects/new");
    await page.waitForLoadState("networkidle");
    // The wizard may not exist yet on this branch — capture whatever renders
    await expect(page).toHaveScreenshot("wizard-step1.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });

  test("project detail page", async ({ page }) => {
    await page.route("**/api/projects/proj_01", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({
          id: "proj_01",
          userId: "usr_01",
          title: "Launch Video v2",
          brief: "60-second product launch video.",
          briefAudioKey: null,
          referenceKey: null,
          status: "ingesting",
          createdAt: "2026-04-01T09:00:00Z",
          updatedAt: "2026-04-12T16:30:00Z",
        }),
      })
    );
    await page.route("**/api/projects/proj_01/uploads", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify([
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
        ]),
      })
    );
    await page.setViewportSize({ width: 1280, height: 900 });
    await page.goto("/projects/proj_01");
    await page.waitForLoadState("networkidle");
    await expect(page).toHaveScreenshot("project-detail.png", {
      fullPage: true,
      maxDiffPixelRatio: 0.01,
    });
  });
});
