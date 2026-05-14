import { Page, expect } from "@playwright/test";

/**
 * Navigate to the projects page
 */
export async function navigateToProjects(page: Page): Promise<void> {
  await page.getByRole("tab", { name: "Projects" }).click();
  await page.waitForURL(/\/projects/);
}

/**
 * Navigate to the structures page
 */
export async function navigateToStructures(page: Page): Promise<void> {
  await page.getByRole("tab", { name: "Venues" }).click();
  await page.waitForURL(/\/structures/);
}

/**
 * Navigate to the artistic teams page
 */
export async function navigateToArtisticTeams(page: Page): Promise<void> {
  await page.getByRole("tab", { name: "Artistic teams" }).click();
  await page.waitForURL(/\/artistic/);
}

/**
 * Navigate to a specific project by clicking on it
 */
export async function navigateToProject(
  page: Page,
  artist: string,
  work: string
): Promise<void> {
  // Search for the project
  const searchInput = page.getByPlaceholder(
    "Type an artist name or their work to start searching..."
  );
  await searchInput.fill(work);
  await searchInput.press("Enter");
  await page.waitForLoadState("networkidle");

  // Click on the first project card
  await page
    .locator(".project-card")
    .filter({ hasText: work })
    .filter({ hasText: artist })
    .first()
    .click();
  await page.waitForURL(/\/projects\/[a-f0-9]{24}/);
}

/**
 * Navigate to the home page
 */
export async function navigateToHome(page: Page): Promise<void> {
  await page.goto("/home");
  await page.waitForLoadState("networkidle");
}
