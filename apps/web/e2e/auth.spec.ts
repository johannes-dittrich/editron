import { test, expect } from "@playwright/test";

test.describe("Login page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/login");
  });

  test("renders login form with design-system styling", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Sign");
    await expect(page.locator("h1 .italic")).toContainText("in");
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /sign in$/i })
    ).toBeVisible();
  });

  test("shows GitHub sign-in button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /sign in with github/i })
    ).toBeVisible();
  });

  test("shows forgot password link", async ({ page }) => {
    await expect(page.getByText("Forgot password?")).toBeVisible();
  });

  test("shows link to signup page", async ({ page }) => {
    const link = page.getByRole("link", { name: /create one/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/signup");
  });

  test("validates empty form submission", async ({ page }) => {
    await page.getByRole("button", { name: /sign in$/i }).click();
    await expect(page.getByText("enter a valid email")).toBeVisible();
    await expect(page.getByText("password is required")).toBeVisible();
  });

  test("validates invalid email", async ({ page }) => {
    await page.getByLabel("Email").fill("not-an-email");
    await page.getByLabel("Password").fill("password123");
    await page.getByRole("button", { name: /sign in$/i }).click();
    await expect(page.getByText("enter a valid email")).toBeVisible();
  });

  test("shows error on wrong credentials", async ({ page }) => {
    await page.getByLabel("Email").fill("wrong@example.com");
    await page.getByLabel("Password").fill("wrongpassword");

    await page.route("/api/auth/sign-in/email", (route) =>
      route.fulfill({
        status: 401,
        contentType: "application/json",
        body: JSON.stringify({
          message: "those credentials don't match — try again",
        }),
      })
    );

    await page.getByRole("button", { name: /sign in$/i }).click();
    await expect(
      page.getByText("those credentials don't match — try again")
    ).toBeVisible();
  });

  test("redirects to /dashboard on success", async ({ page }) => {
    await page.getByLabel("Email").fill("alex@example.com");
    await page.getByLabel("Password").fill("password123");

    await page.route("/api/auth/sign-in/email", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/json",
        body: JSON.stringify({ user: { id: "usr_01" }, token: "mock" }),
      })
    );

    await page.getByRole("button", { name: /sign in$/i }).click();
    await page.waitForURL("**/dashboard");
    expect(page.url()).toContain("/dashboard");
  });
});

test.describe("Signup page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/signup");
  });

  test("renders signup form with design-system styling", async ({ page }) => {
    await expect(page.locator("h1")).toContainText("Create");
    await expect(page.locator("h1 .italic")).toContainText("account");
    await expect(page.getByLabel("Name")).toBeVisible();
    await expect(page.getByLabel("Email")).toBeVisible();
    await expect(page.getByLabel("Password")).toBeVisible();
    await expect(
      page.getByRole("button", { name: /create account$/i })
    ).toBeVisible();
  });

  test("shows GitHub sign-up button", async ({ page }) => {
    await expect(
      page.getByRole("button", { name: /sign up with github/i })
    ).toBeVisible();
  });

  test("shows link to login page", async ({ page }) => {
    const link = page.getByRole("link", { name: /sign in/i });
    await expect(link).toBeVisible();
    await expect(link).toHaveAttribute("href", "/login");
  });

  test("validates empty form submission", async ({ page }) => {
    await page.getByRole("button", { name: /create account$/i }).click();
    await expect(page.getByText("name is required")).toBeVisible();
    await expect(page.getByText("enter a valid email")).toBeVisible();
    await expect(
      page.getByText("password must be at least 8 characters")
    ).toBeVisible();
  });

  test("validates short password", async ({ page }) => {
    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill("test@example.com");
    await page.getByLabel("Password").fill("short");
    await page.getByRole("button", { name: /create account$/i }).click();
    await expect(
      page.getByText("password must be at least 8 characters")
    ).toBeVisible();
  });

  test("shows error on duplicate email", async ({ page }) => {
    await page.getByLabel("Name").fill("Test User");
    await page.getByLabel("Email").fill("taken@example.com");
    await page.getByLabel("Password").fill("password123");

    await page.route("/api/auth/sign-up/email", (route) =>
      route.fulfill({
        status: 409,
        contentType: "application/json",
        body: JSON.stringify({
          message: "an account with this email already exists",
        }),
      })
    );

    await page.getByRole("button", { name: /create account$/i }).click();
    await expect(
      page.getByText("an account with this email already exists")
    ).toBeVisible();
  });

  test("redirects to /dashboard on success", async ({ page }) => {
    await page.getByLabel("Name").fill("New User");
    await page.getByLabel("Email").fill("new@example.com");
    await page.getByLabel("Password").fill("password123");

    await page.route("/api/auth/sign-up/email", (route) =>
      route.fulfill({
        status: 201,
        contentType: "application/json",
        body: JSON.stringify({ user: { id: "usr_new" }, token: "mock" }),
      })
    );

    await page.getByRole("button", { name: /create account$/i }).click();
    await page.waitForURL("**/dashboard");
    expect(page.url()).toContain("/dashboard");
  });
});
