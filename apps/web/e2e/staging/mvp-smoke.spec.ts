import { test, expect } from "@playwright/test";
import { resolve } from "node:path";

const STAGING_URL =
  process.env.STAGING_URL ??
  "https://web-production-8c8f.4631dc.up.azin.host";

const API_URL = "https://api-production.4631dc.up.azin.host";

const FIXTURE_PATH = resolve(
  __dirname,
  "../../../../test-fixtures/10s-colorbars.mp4",
);

const testEmail = `smoke-${Date.now()}@editron.ai`;
const testPassword = "SmokeTest123!";

test.describe("MVP smoke test against real infrastructure", () => {
  test("API health check returns ok", async ({ request }) => {
    const res = await request.get(`${API_URL}/api/health`);
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.status).toBe("ok");
    expect(body.db).toBe("ok");
  });

  test("staging landing page loads and shows hero", async ({ page }) => {
    await page.goto(STAGING_URL);
    await page.waitForLoadState("networkidle");

    const h1 = page.locator("h1");
    await expect(h1).toContainText("Drop the footage");
  });

  test("staging signup page renders form fields", async ({ page }) => {
    await page.goto(`${STAGING_URL}/signup`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /create account/i }),
    ).toBeVisible();
  });

  // https://github.com/mathisdittrich/editron/issues/51
  test.skip(
    "signup creates account and redirects to /dashboard",
    async ({ page }) => {
      await page.goto(`${STAGING_URL}/signup`);

      await page.getByLabel("Name").fill("Smoke Tester");
      await page.getByLabel("Email").fill(testEmail);
      await page.getByLabel("Password").fill(testPassword);
      await page.getByRole("button", { name: /create account/i }).click();

      await page.waitForURL("**/dashboard", { timeout: 15_000 });
      expect(page.url()).toContain("/dashboard");
    },
  );

  test("API signup works directly (proving the endpoint is live)", async ({
    request,
  }) => {
    const res = await request.post(
      `${API_URL}/api/auth/sign-up/email`,
      {
        data: {
          name: "Smoke API Tester",
          email: `smoke-api-${Date.now()}@editron.ai`,
          password: "SmokeTest123!",
        },
      },
    );
    expect(res.ok()).toBe(true);
    const body = await res.json();
    expect(body.user).toBeDefined();
    expect(body.user.email).toContain("smoke-api-");
  });

  test("staging login page renders form fields", async ({ page }) => {
    await page.goto(`${STAGING_URL}/login`);
    await page.waitForLoadState("networkidle");

    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(page.locator("h1")).toContainText("Sign");
  });

  test("staging wizard page loads step 1", async ({ page }) => {
    await page.goto(`${STAGING_URL}/projects/new`);
    await page.waitForLoadState("networkidle");

    await expect(page.locator('[data-testid="step-1"]')).toBeVisible();
    await expect(page.getByLabel(/title/i)).toBeVisible();
  });
});
