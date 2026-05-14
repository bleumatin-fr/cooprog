import { expect, test } from "@playwright/test";
import {
  completeRegistration,
  diffusionStructureRegistrationData,
  artisticTeamRegistrationData,
  navigateToPasswordReset,
  fillPasswordResetForm,
  fillNewPasswordForm,
  navigateToInvitationConfirmation,
  fillInvitationConfirmationForm,
} from "./utils/registration";
import { resetEmails, waitForEmailTo } from "./utils/mail";
import { approveRegistration } from "./utils/admin";
import { diffusionStructureCredentials, login } from "./utils/auth";
import { navigateToProject, navigateToProjects } from "./utils/navigation";
import {
  fillNewProjectPage,
  fillNewTourPage,
  fillScheduleWithConfirmedDateForNewUserForFirstDay,
  fillScheduleWithConfirmedDateForOtherUserForFirstDay,
} from "./utils";
import { Discipline } from "@cooprog/core";

const URL = process.env.URL;

test.describe("Registration", () => {
  test.beforeEach(async () => {
    await resetEmails();
  });

  test("it should be able to register a new diffusion structure", async ({
    page,
  }) => {
    const registrationData = {
      ...diffusionStructureRegistrationData,
      email: `test-diffusion-${Date.now()}@example.com`,
    };

    await completeRegistration(page, registrationData, { baseURL: URL });

    // Should be redirected to waiting approval page for diffusion structures
    await expect(page).toHaveURL(/\/authentication\/waiting-approval/);
    await expect(page.getByText("Account waiting for approval")).toBeVisible();

    await approveRegistration(page, { baseURL: URL }, registrationData.email);

    // Verify that a confirmation email was sent
    const email = await waitForEmailTo(registrationData.email, 5000);
    expect(email).toBeTruthy();
    expect(email?.subject).toContain("Account");
  });

  test("it should be able to register a new artistic team without moderation", async ({
    page,
  }) => {
    const registrationData = {
      ...artisticTeamRegistrationData,
      email: `test-artistic-${Date.now()}@example.com`,
    };

    await completeRegistration(page, registrationData, { baseURL: URL });

    // Should be redirected to home page for artistic teams (no moderation)
    await expect(page).toHaveURL(/\/home/);
    await expect(
      page.getByText("Welcome to your artistic dashboard")
    ).toBeVisible();
  });

  test("it should be able to reset password", async ({ page }) => {
    const testEmail = "m.dupont@opera-paris.fr";

    // Navigate to password reset page
    await navigateToPasswordReset(page, { baseURL: URL });

    // Fill and submit password reset form
    await fillPasswordResetForm(page, testEmail);

    // Should show success message
    await expect(
      page.getByText(
        "An email has been sent to you with a link to reset your password."
      )
    ).toBeVisible();

    // Verify that a password reset email was sent
    const email = await waitForEmailTo(testEmail, 5000);
    expect(email).toBeTruthy();
    expect(email?.subject).toContain("CooProg - Password Recovery");

    const resetPasswordLink = email?.html.match(/<a href="([^"]+)">/)?.[1];
    expect(resetPasswordLink).toBeDefined();
    expect(resetPasswordLink).toContain("authentication/reset-password/");

    await page.goto(resetPasswordLink);
    await page.waitForLoadState("networkidle");

    // Fill and submit new password form
    await fillNewPasswordForm(page, "NewPassword123!");
    await page.getByRole("button", { name: "Reset password" }).click();

    // Should show success message
    await expect(page.getByText("Your password has been reset.")).toBeVisible();
    await page.waitForLoadState("networkidle");

    // Verify that we can login with the new password
    await login(
      page,
      { email: testEmail, password: "NewPassword123!" },
      { baseURL: URL }
    );
  });

  test("it should be able to confirm an invitation as a diffusion structure", async ({
    page,
  }) => {
    const joinedProjectData = {
      artist: "Milo Rau / NTGent",
      work: "Antigone in the Amazon",
    };

    const newUser = {
      email: `test-artistic-${Date.now()}@example.com`,
      firstName: "Test",
      lastName: "Artist",
      company: "Test Company",
      address: {
        search: "Nancy",
        result:
          "Nancy, Meurthe-et-Moselle, Grand Est, Metropolitan France, France",
      },
    };

    await login(page, diffusionStructureCredentials, { baseURL: URL });
    await navigateToProjects(page);
    await navigateToProject(
      page,
      joinedProjectData.artist,
      joinedProjectData.work
    );

    await page.getByText("View Tour").last().click();
    await page.waitForURL(/\/projects\/[a-f0-9]{24}\/tours\/[a-f0-9]{24}/);

    await fillScheduleWithConfirmedDateForNewUserForFirstDay(page, newUser);

    const email = await waitForEmailTo(newUser.email, 5000);
    expect(email).toBeTruthy();
    expect(email?.subject).toContain("invites you to participate in the tour");

    const invitationLink = email?.html.match(/<a href="([^"]+)">/)?.[1];
    expect(invitationLink).toBeDefined();
    expect(invitationLink).toContain("authentication/confirm-account/");

    await page.goto(invitationLink);
    await page.waitForLoadState("networkidle");

    await fillInvitationConfirmationForm(page, {
      programmingDisciplines: [Discipline.PERFORMING_ARTS],
      password: "NewPassword123!",
    });

    await expect(page).toHaveURL(/\/authentication\/waiting-approval/);
  });

  test("it should be able to confirm an invitation as an artistic team", async ({
    page,
  }) => {
    await login(page, diffusionStructureCredentials, { baseURL: URL });

    const newUser = {
      email: `test-artistic-${Date.now()}@example.com`,
      firstName: "Test",
      lastName: "Artist",
      company: "Test Company",
      address: {
        search: "Nancy",
        result:
          "Nancy, Meurthe-et-Moselle, Grand Est, Metropolitan France, France",
      },
    };

    const projectData = {
      discipline: "Performing Arts",
      artist: "Test Artist ",
      work: `Test Work ${Date.now()}`,
      cities: [{ search: "Nancy", result: "Nancy, Grand Est" }],
      genres: ["Dance"],
      targetAudiences: ["All audiences"],
      artisticTeam: newUser,
    };

    await page.getByText("New project").click();
    await page.waitForURL(/\/projects\/new/);

    await fillNewProjectPage(page, projectData);
    await page.getByText("Next").click();
    await page.waitForURL(/\/projects\/new\/tour/);

    await fillNewTourPage(page);

    await page.getByText("Next").click();
    await page.waitForURL(/\/projects\/new\/share/);

    await page.getByText("create", { exact: true }).click();
    await page.waitForTimeout(10000);
    await page.waitForURL(/\/projects\/[a-f0-9]{24}/);

    const email = await waitForEmailTo(newUser.email, 5000);
    expect(email).toBeTruthy();
    expect(email?.subject).toContain("invites you to join the project");

    const invitationLink = email?.html.match(/<a href="([^"]+)">/)?.[1];
    expect(invitationLink).toBeDefined();
    expect(invitationLink).toContain("authentication/confirm-account/");

    await page.goto(invitationLink);
    await page.waitForLoadState("networkidle");

    await fillInvitationConfirmationForm(page, {
      programmingDisciplines: [Discipline.PERFORMING_ARTS],
      password: "NewPassword123!",
    });

    // Should show success or redirect to appropriate page
    await expect(page).toHaveURL(/\/home/);
  });
});
