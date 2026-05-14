import { Page, expect } from "@playwright/test";
import { Role, Discipline, StructureType } from "@cooprog/core";

export interface RegistrationData {
  accountType?: Role;
  email?: string;
  password?: string;
  firstName?: string;
  lastName?: string;
  company?: string;
  companyDescription?: string;
  link?: string;
  address?: { search: string; result: string };
  contactType?: "email" | "phone" | "none";
  contactEmail?: string;
  contactPhone?: string;
  instructions?: string;
  programmingDisciplines?: Discipline[];
  structureTypes?: StructureType[];
  programmingPeriods?: string;
  programmingGenres?: string[];
}

export interface RegistrationOptions {
  baseURL?: string;
}

/**
 * Navigate to the registration page
 */
export async function navigateToRegistration(
  page: Page,
  options: RegistrationOptions = {}
): Promise<void> {
  const { baseURL = process.env.URL || "http://localhost:3000" } = options;
  await page.goto(`${baseURL}/authentication/register`);
  await page.waitForLoadState("networkidle");
}

/**
 * Fill the registration information step (first step)
 */
export async function fillRegistrationInformation(
  page: Page,
  data: RegistrationData
): Promise<void> {
  if (data.programmingDisciplines) {
    for (const discipline of data.programmingDisciplines) {
      if (discipline === Discipline.PERFORMING_ARTS) {
        await page.getByText("Performing Arts", { exact: true }).click();
      } else if (discipline === Discipline.MUSIC) {
        await page.getByText("Music", { exact: true }).click();
      }
    }
  }
  // Fill email
  if (data.email) {
    await page.getByLabel("Mail address").fill(data.email);
  }

  // Fill password
  if (data.password) {
    await page.getByLabel("Choose password").fill(data.password);
  }

  // Fill first name
  if (data.firstName) {
    await page.getByLabel("First name").fill(data.firstName);
  }

  // Fill last name
  if (data.lastName) {
    await page.getByLabel("Last name").fill(data.lastName);
  }

  // Fill company
  if (data.company) {
    await page.getByLabel("Name of structure").fill(data.company);
  }

  // Fill company description if provided
  if (data.companyDescription) {
    await page
      .getByLabel("Structure description")
      .fill(data.companyDescription);
  }

  // Fill link if provided
  if (data.link) {
    await page
      .getByLabel(
        "Internet link referencing your position as programmer in the structure"
      )
      .fill(data.link);
  }

  // Fill structure types for diffusion structures
  if (data.accountType === Role.DIFFUSION_STRUCTURE && data.structureTypes) {
    for (const structureType of data.structureTypes) {
      await page.getByLabel(structureType).check();
    }
  }

  // Fill programming genres for diffusion structures
  if (data.accountType === Role.DIFFUSION_STRUCTURE && data.programmingGenres) {
    for (const genre of data.programmingGenres) {
      await page.getByText(genre, { exact: true }).click();
    }
  }

  // Fill programming periods for diffusion structures
  if (
    data.accountType === Role.DIFFUSION_STRUCTURE &&
    data.programmingPeriods
  ) {
    await page.getByLabel("Programming periods").fill(data.programmingPeriods);
  }

  // Check required checkboxes
  await page.getByLabel("Terms of service").check();
  await page.getByLabel("Privacy policy").check();
  await page.getByLabel("Manifesto").check();
}

/**
 * Fill the address step
 */
export async function fillAddressStep(
  page: Page,
  data: RegistrationData
): Promise<void> {
  page.on("dialog", (dialog) => dialog.accept());
  // Fill address
  await page.getByLabel("Address").fill(data.address.search);

  await page.waitForLoadState("networkidle");
  await page.getByText(data.address.result).click();
}

/**
 * Fill the contact information step
 */
export async function fillContactInformation(
  page: Page,
  data: RegistrationData
): Promise<void> {
  // Select contact type
  if (data.contactType === "email") {
    await page.getByLabel("Email", { exact: true }).check();
  } else if (data.contactType === "phone") {
    await page.getByLabel("Phone", { exact: true }).check();
  }

  // Fill contact details based on type
  if (data.contactType === "email" && data.contactEmail) {
    await page.getByLabel("Email address").fill(data.contactEmail);
  } else if (data.contactType === "phone" && data.contactPhone) {
    await page.getByLabel("Phone number").fill(data.contactPhone);
  }

  // Fill instructions if provided
  if (data.instructions) {
    await page
      .getByLabel("Message for people trying to contact you")
      .fill(data.instructions);
  }
}

/**
 * Select account type (diffusion structure or artistic team)
 */
export async function selectAccountType(
  page: Page,
  accountType: Role
): Promise<void> {
  const buttonLabel =
    accountType === Role.DIFFUSION_STRUCTURE
      ? "Diffusion Structure"
      : "Artistic Team";

  await page.getByText(buttonLabel, { exact: true }).click();
}

/**
 * Complete the full registration process
 */
export async function completeRegistration(
  page: Page,
  data: RegistrationData,
  options: RegistrationOptions = {}
): Promise<void> {
  await navigateToRegistration(page, options);

  // Step 0: Select account type
  await selectAccountType(page, data.accountType);
  await page.getByRole("button", { name: "Next" }).click();

  // Step 1: Registration information
  await fillRegistrationInformation(page, data);
  await page.getByRole("button", { name: "Next" }).click();

  // Step 2: Address
  await fillAddressStep(page, data);
  await page.getByRole("button", { name: "Next" }).click();

  // Step 3: Contact information
  await fillContactInformation(page, data);
  await page.getByRole("button", { name: "Next" }).click();

  // Wait for registration to complete
  await page.waitForLoadState("networkidle");
}

/**
 * Test data for diffusion structure registration
 */
export const diffusionStructureRegistrationData: RegistrationData = {
  accountType: Role.DIFFUSION_STRUCTURE,
  programmingDisciplines: [Discipline.PERFORMING_ARTS],
  email: `test-diffusion-${Date.now()}@example.com`,
  password: "TestPassword123!",
  firstName: "Test",
  lastName: "Diffusion",
  company: "Test Diffusion Company",
  companyDescription: "A test diffusion company",
  link: "https://test-diffusion.com",
  address: {
    search: "Nancy",
    result: "Nancy, Meurthe-et-Moselle, Grand Est, Metropolitan France, France",
  },
  contactType: "email",
  contactEmail: "contact@test-diffusion.com",
  instructions: "Test contact instructions",
  programmingPeriods: "2024-2025",
  programmingGenres: ["Theater", "Dance"],
};

/**
 * Test data for artistic team registration
 */
export const artisticTeamRegistrationData: RegistrationData = {
  accountType: Role.ARTISTIC_TEAM,
  programmingDisciplines: [Discipline.PERFORMING_ARTS],
  email: `test-artistic-${Date.now()}@example.com`,
  password: "TestPassword123!",
  firstName: "Test",
  lastName: "Artist",
  company: "Test Artistic Company",
  companyDescription: "A test artistic company",
  address: {
    search: "Nancy",
    result: "Nancy, Meurthe-et-Moselle, Grand Est, Metropolitan France, France",
  },
  contactType: "phone",
  contactPhone: "+1234567890",
  instructions: "Test artistic contact instructions",
};

/**
 * Navigate to password reset page
 */
export async function navigateToPasswordReset(
  page: Page,
  options: RegistrationOptions = {}
): Promise<void> {
  const { baseURL = process.env.URL || "http://localhost:3000" } = options;
  await page.goto(`${baseURL}/authentication/recover`);
  await page.waitForLoadState("networkidle");
}

/**
 * Fill password reset form
 */
export async function fillPasswordResetForm(
  page: Page,
  email: string
): Promise<void> {
  await page.getByLabel("Mail address").fill(email);
  await page.getByRole("button", { name: "Send recovery email" }).click();
}

/**
 * Fill new password form
 */
export async function fillNewPasswordForm(
  page: Page,
  newPassword: string
): Promise<void> {
  await page.getByLabel("New password").fill(newPassword);
  await page.getByRole("button", { name: "Reset password" }).click();
}

/**
 * Navigate to invitation confirmation page
 */
export async function navigateToInvitationConfirmation(
  page: Page,
  token: string,
  options: RegistrationOptions = {}
): Promise<void> {
  const { baseURL = process.env.URL || "http://localhost:3000" } = options;
  await page.goto(`${baseURL}/authentication/confirm-account/${token}`);
  await page.waitForLoadState("networkidle");
}

export interface InvitationConfirmationData {
  programmingDisciplines: Discipline[];
}
/**
 * Fill invitation confirmation form
 */
export async function fillInvitationConfirmationForm(
  page: Page,
  data: {
    programmingDisciplines: Discipline[];
    password: string;
    address?: { search: string; result: string };
  }
): Promise<void> {
  await page.getByText("Next").click();

  await fillRegistrationInformation(page, {
    programmingDisciplines: data.programmingDisciplines,
  });
  await page.getByRole("button", { name: "Next" }).click();

  if (data.address) {
    await fillAddressStep(page, { address: data.address });
  }
  await page.getByRole("button", { name: "Next" }).click();

  // Step 3: Contact information
  await page.getByLabel("Password").first().fill(data.password);
  await page.getByRole("button", { name: "Submit" }).click();

  // Wait for registration to complete
  await page.waitForLoadState("networkidle");
}
