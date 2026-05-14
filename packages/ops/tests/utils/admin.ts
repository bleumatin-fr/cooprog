import { Page, expect } from "@playwright/test";

const adminCredentials = {
  email: "admin@bleumatin.fr",
  password: "password",
};

export interface AdminOptions {
  baseURL?: string;
}
export async function approveRegistration(
  page: Page,
  options: AdminOptions = {},
  email: string
): Promise<boolean> {
  const { baseURL = process.env.URL || "http://localhost:3000" } = options;
  await page.goto(`${baseURL}/admin/login`);
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Username").fill(adminCredentials.email);
  await page
    .getByLabel("Password *", { exact: true })
    .fill(adminCredentials.password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await page.waitForLoadState("networkidle");

  await page.getByRole("menuitem", { name: "Users" }).click();
  await page.getByRole("button", { name: "Awaiting moderation" }).click();
  await page.waitForLoadState("networkidle");
  await page.getByLabel("Search").fill(email);
  await page.waitForLoadState("networkidle");
  await page.getByText(email).click();

  await page.getByLabel("Status *", { exact: true }).click();
  await page.locator("li", { hasText: "OK" }).click();
  await page.getByRole("button", { name: "Save" }).click();
  return true;
}
