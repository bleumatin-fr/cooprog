import { expect, test } from "@playwright/test";
import { loginWithDefaults } from "./utils/auth";

const URL = process.env.URL;

test("it can reach CooProg and perform basic actions", async ({ page }) => {
  // AUTHENTICATION
  await loginWithDefaults(page, { baseURL: URL });

  // PROJECTS
  await page.getByRole("tab", { name: "Projets" }).click();
  await page.waitForURL(`**/projects`);

  // TAKE FIRST PROJECT
  const projectTitle = await page
    .getByTestId("project-card")
    .first()
    .locator("p")
    .first()
    .textContent();

  // Search by project title
  const searchInput = page.getByPlaceholder(
    "Saisissez le nom d'un artiste ou de son œuvre pour commencer la recherche..."
  );

  await searchInput.fill(projectTitle);
  await searchInput.press("Enter");
  await page.waitForLoadState("networkidle");

  await page.getByTestId("project-card").first().click();
  await page.waitForURL(`**/projects/**`);
});
