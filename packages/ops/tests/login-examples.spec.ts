import { expect, test } from "@playwright/test";
import {
  login,
  loginWithDefaults,
  ensureLoggedIn,
  logout,
  isLoggedIn,
} from "./utils/auth";

const URL = process.env.URL;

test.describe("Login Examples", () => {
  test("login with default credentials from environment", async ({ page }) => {
    await loginWithDefaults(page, { baseURL: URL });

    // Verify we're logged in
    await expect(page.getByText("Florian Ferbach")).toBeVisible();
  });

  test("login with custom credentials", async ({ page }) => {
    const credentials = {
      email: "test@example.com",
      password: "testpassword",
    };

    await login(page, credentials, { baseURL: URL });

    // Verify we're logged in
    await expect(page.getByText("Florian Ferbach")).toBeVisible();
  });

  test("login with custom redirect", async ({ page }) => {
    await loginWithDefaults(page, {
      baseURL: URL,
      expectedRedirect: "/projects", // Redirect to projects instead of home
    });

    // Verify we're on the projects page
    await expect(page).toHaveURL(`${URL}/projects`);
  });

  test("ensure logged in - already logged in", async ({ page }) => {
    // First login
    await loginWithDefaults(page, { baseURL: URL });

    // Navigate to another page
    await page.goto(`${URL}/projects`);

    // Ensure logged in should not login again
    await ensureLoggedIn(page);

    // Should still be logged in
    expect(await isLoggedIn(page)).toBe(true);
  });

  test("logout functionality", async ({ page }) => {
    // First login
    await loginWithDefaults(page, { baseURL: URL });

    // Verify we're logged in
    expect(await isLoggedIn(page)).toBe(true);

    // Logout
    await logout(page);

    // Verify we're logged out
    expect(await isLoggedIn(page)).toBe(false);
  });

  test("login without waiting for navigation", async ({ page }) => {
    await loginWithDefaults(page, {
      baseURL: URL,
      waitForNavigation: false,
    });

    // Manually wait for navigation if needed
    await page.waitForURL(`${URL}/home`);

    // Verify we're logged in
    await expect(page.getByText("Florian Ferbach")).toBeVisible();
  });
});
