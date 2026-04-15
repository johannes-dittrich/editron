import { test, expect } from "@playwright/test";

test.describe("V0 adversarial edge cases", () => {
  test("signup with existing email returns 409 error in the UI", async ({
    page,
  }) => {
    await page.goto("/signup");

    await page.route("**/api/auth/sign-up**", (route) =>
      route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          message: "an account with this email already exists",
        }),
      }),
    );

    await page.getByLabel("Name").fill("Duplicate User");
    await page.getByLabel("Email").fill("taken@example.com");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(
      page.getByText("an account with this email already exists"),
    ).toBeVisible();

    expect(page.url()).toContain("/signup");
  });

  test("upload a tiny 1 KB file — drop zone rejects before API call", async ({
    page,
  }) => {
    let apiCalled = false;
    await page.route("**/api/uploads/**", (route) => {
      apiCalled = true;
      return route.continue();
    });

    await page.route("/api/projects", (route) => {
      if (route.request().method() === "POST") {
        return route.fulfill({
          status: 201,
          contentType: "application/json",
          body: JSON.stringify({
            id: "proj_tiny",
            userId: "usr_01",
            title: "Tiny File Test",
            status: "draft",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          }),
        });
      }
      return route.continue();
    });

    await page.goto("/projects/new");
    await page.locator('[data-testid="skip-button"]').click();
    await page.locator('[data-testid="skip-button"]').click();
    await expect(page.locator('[data-testid="step-3"]')).toBeVisible();

    const fileInput = page.locator('[data-testid="source-drop-zone-input"]');
    await fileInput.setInputFiles({
      name: "tiny.txt",
      mimeType: "text/plain",
      buffer: Buffer.alloc(1024),
    });

    await expect(page.locator('[data-testid="reject-message"]')).toContainText(
      "isn't a video",
    );

    expect(apiCalled).toBe(false);
  });

  test("visit /projects/[id] with non-existent project shows error state", async ({
    page,
  }) => {
    await page.route("**/api/projects/proj_deleted_999", (route) =>
      route.fulfill({ status: 404, body: "not found" }),
    );
    await page.route("**/api/projects/proj_deleted_999/uploads", (route) =>
      route.fulfill({ status: 404, body: "not found" }),
    );

    await page.goto("/projects/proj_deleted_999");

    await expect(page.locator('[data-testid="error-state"]')).toBeVisible();

    const backLink = page.getByRole("link", { name: /dashboard/i });
    await expect(backLink).toBeVisible();
  });

  test("signup form validates email format before API call", async ({
    page,
  }) => {
    let apiCalled = false;
    await page.route("**/api/auth/**", (route) => {
      apiCalled = true;
      return route.continue();
    });

    await page.goto("/signup");
    await page.getByLabel("Name").fill("Test");
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: /create account/i }).click();

    await expect(page.getByText("enter a valid email")).toBeVisible();
    expect(apiCalled).toBe(false);
  });

  test("login form validates empty fields before API call", async ({
    page,
  }) => {
    let apiCalled = false;
    await page.route("**/api/auth/**", (route) => {
      apiCalled = true;
      return route.continue();
    });

    await page.goto("/login");
    await page.getByRole("button", { name: /sign in$/i }).click();

    await expect(page.getByText("enter a valid email")).toBeVisible();
    expect(apiCalled).toBe(false);
  });
});
