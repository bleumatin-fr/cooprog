import { Page, expect } from "@playwright/test";

export interface LoginCredentials {
  email: string;
  password: string;
}

export const performingArtsArtisticTeamCredentials: LoginCredentials = {
  email: "artistic.sv@bleumatin.fr",
  password: "password",
};

export const musicArtisticTeamCredentials: LoginCredentials = {
  email: "artistic.ma@bleumatin.fr",
  password: "password",
};

export const diffusionStructureCredentials: LoginCredentials = {
  email: "direction@centremalraux.com",
  password: "password",
};

export interface LoginOptions {
  baseURL?: string;
  waitForNavigation?: boolean;
  expectedRedirect?: string;
}

/**
 * Login function that can be reused across tests
 * @param page - Playwright page object
 * @param credentials - Login credentials
 * @param options - Additional login options
 */
export async function login(
  page: Page,
  credentials: LoginCredentials,
  options: LoginOptions = {}
): Promise<void> {
  const {
    baseURL = process.env.URL || "http://localhost:3000",
    waitForNavigation = true,
    expectedRedirect = "/home",
  } = options;

  // Navigate to login page
  await page.goto(`${baseURL}/authentication/login`);

  // Verify we're on the login page
  await expect(page).toHaveTitle(/CooProg/);

  // Fill in credentials
  await page
    .getByLabel(/^(Mail address|Adresse e-mail)$/)
    .fill(credentials.email);
  await page.getByLabel(/^(Password|Mot de passe)$/).fill(credentials.password);

  // Click login button
  await page.getByRole("button", { name: /^(Login|Se connecter)$/ }).click();

  // Wait for navigation if requested
  if (waitForNavigation) {
    await page.waitForURL(`${baseURL}${expectedRedirect}`);
  }
}

/**
 * Login with default credentials from environment variables
 * @param page - Playwright page object
 * @param options - Additional login options
 */
export async function loginWithDefaults(
  page: Page,
  options: LoginOptions = {}
): Promise<void> {
  const credentials: LoginCredentials = {
    email: process.env.EMAIL || "",
    password: process.env.PASSWORD || "",
  };

  if (!credentials.email || !credentials.password) {
    throw new Error("EMAIL and PASSWORD environment variables must be set");
  }

  await login(page, credentials, options);
}

/**
 * Check if user is already logged in by looking for user menu or profile elements
 * @param page - Playwright page object
 * @returns boolean indicating if user is logged in
 */
export async function isLoggedIn(page: Page): Promise<boolean> {
  try {
    // Look for common elements that indicate a logged-in state
    const userMenu = page.getByText("Florian Ferbach");
    await userMenu.waitFor({ timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Logout function
 * @param page - Playwright page object
 */
export async function logout(page: Page): Promise<void> {
  try {
    // Click on user menu
    await page.getByText("Florian Ferbach").click();

    // Look for logout button (adjust selector based on your UI)
    await page.getByRole("button", { name: /déconnexion|logout/i }).click();

    // Wait for redirect to login page
    await page.waitForURL(/authentication\/login/);
  } catch (error) {
    console.warn("Logout failed:", error);
  }
}

/**
 * Ensure user is logged in, login if necessary
 * @param page - Playwright page object
 * @param credentials - Login credentials (optional, uses env vars if not provided)
 */
export async function ensureLoggedIn(
  page: Page,
  credentials?: LoginCredentials
): Promise<void> {
  const isAlreadyLoggedIn = await isLoggedIn(page);

  if (!isAlreadyLoggedIn) {
    if (credentials) {
      await login(page, credentials);
    } else {
      await loginWithDefaults(page);
    }
  }
}
