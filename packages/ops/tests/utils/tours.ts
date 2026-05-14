import { Page, expect } from "@playwright/test";

/**
 * Create a new tour for a project
 */
export async function createNewTour(
  page: Page,
  tourData: {
    name: string;
    startDate?: string;
    endDate?: string;
    venue?: string;
  }
): Promise<void> {
  // Navigate to tours section or click "New tour" button
  await page
    .getByRole("button", { name: /nouvelle tournée|new tour/i })
    .click();

  // Fill in tour details
  await page.getByLabel("Nom de la tournée").fill(tourData.name);

  if (tourData.startDate) {
    await page.getByLabel("Date de début").fill(tourData.startDate);
  }

  if (tourData.endDate) {
    await page.getByLabel("Date de fin").fill(tourData.endDate);
  }

  if (tourData.venue) {
    await page.getByLabel("Lieu").fill(tourData.venue);
  }

  // Submit the form
  await page.getByRole("button", { name: /créer|create/i }).click();

  // Wait for the tour to be created
  await page.waitForLoadState("networkidle");
}

/**
 * Edit tour details
 */
export async function editTour(
  page: Page,
  tourId: string,
  updates: {
    name?: string;
    startDate?: string;
    endDate?: string;
    venue?: string;
  }
): Promise<void> {
  // Navigate to the specific tour
  await page.goto(`/projects/${tourId}/tours/${tourId}`);

  // Click edit button
  await page.getByRole("button", { name: /modifier|edit/i }).click();

  // Update fields if provided
  if (updates.name) {
    await page.getByLabel("Nom de la tournée").fill(updates.name);
  }

  if (updates.startDate) {
    await page.getByLabel("Date de début").fill(updates.startDate);
  }

  if (updates.endDate) {
    await page.getByLabel("Date de fin").fill(updates.endDate);
  }

  if (updates.venue) {
    await page.getByLabel("Lieu").fill(updates.venue);
  }

  // Save changes
  await page.getByRole("button", { name: /sauvegarder|save/i }).click();
  await page.waitForLoadState("networkidle");
}

/**
 * Get tour information
 */
export async function getTourInfo(page: Page): Promise<{
  name: string;
  startDate: string;
  endDate: string;
  venue: string;
}> {
  const name = (await page.getByTestId("tour-name").textContent()) || "";
  const startDate =
    (await page.getByTestId("tour-start-date").textContent()) || "";
  const endDate = (await page.getByTestId("tour-end-date").textContent()) || "";
  const venue = (await page.getByTestId("tour-venue").textContent()) || "";

  return { name, startDate, endDate, venue };
}
