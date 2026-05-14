import { expect, test } from "@playwright/test";
import {
  diffusionStructureCredentials,
  performingArtsArtisticTeamCredentials,
  login,
} from "./utils/auth";
import {
  navigateToProjects,
  navigateToStructures,
  navigateToArtisticTeams,
  navigateToProject,
} from "./utils/navigation";
import {
  isProjectJoined,
  fillNewProjectPage,
  fillNewTourPage,
  fillEditProjectPage,
  fillEditTourPage,
  fillScheduleWithConfirmedDateForFirstDay,
  fillScheduleWithWishedDateForFirstDay,
} from "./utils/projects";
import { sendChatMessage } from "./utils/chat";
import { beforeEach } from "node:test";

const URL = process.env.URL;

test.describe("Diffusion structure", () => {
  test("it should not be able to see my projects", async ({ page }) => {
    await login(page, diffusionStructureCredentials, { baseURL: URL });

    await expect(
      page.getByRole("tab", { name: "My projects" })
    ).not.toBeVisible();
  });

  test("it should be able to see the projects", async ({ page }) => {
    await login(page, diffusionStructureCredentials, { baseURL: URL });

    await navigateToProjects(page);

    const projectCards = page.getByTestId("project-card");
    await expect(projectCards.first()).toBeVisible();
  });

  test("it should be able to see the structures", async ({ page }) => {
    await login(page, diffusionStructureCredentials, { baseURL: URL });

    await navigateToStructures(page);

    const structureCards = page.getByTestId("user-card");
    await expect(structureCards.first()).toBeVisible();
  });

  test("it should be able to see the artistic teams", async ({ page }) => {
    await login(page, diffusionStructureCredentials, { baseURL: URL });

    await navigateToArtisticTeams(page);

    const artisticTeamCards = page.getByTestId("user-card");
    await expect(artisticTeamCards.first()).toBeVisible();
  });

  test("it should be able to create a new project", async ({ page }) => {
    await login(page, diffusionStructureCredentials, { baseURL: URL });

    const projectData = {
      discipline: "Performing Arts",
      artist: "Test Artist",
      work: "Test Work",
      cities: [{ search: "Nancy", result: "Nancy, Grand Est" }],
      genres: ["Dance"],
      targetAudiences: ["All audiences"],
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

    await expect(page.getByText(projectData.artist).first()).toBeVisible();
    await expect(page.getByText(projectData.work).first()).toBeVisible();
  });

  test.describe("on a unjoined project", () => {
    const unjoinedProjectData = {
      artist: "Maya Boquet",
      work: "L'énigme Rosemary Brown",
    };

    test.beforeEach(async ({ page }) => {
      await login(page, diffusionStructureCredentials, { baseURL: URL });
      await navigateToProjects(page);
      await navigateToProject(
        page,
        unjoinedProjectData.artist,
        unjoinedProjectData.work
      );
    });

    test("it should be able to see the project", async ({ page }) => {
      await expect(
        page.getByText(unjoinedProjectData.artist).first()
      ).toBeVisible();
      await expect(
        page.getByText(unjoinedProjectData.work).first()
      ).toBeVisible();

      await expect(
        page.locator(".project-details, .project-info")
      ).toBeVisible();
    });

    test("it should be able to create a new tour", async ({ page }) => {
      await page.getByText("Share a new tour").click();

      const tourName = "Test Tour " + Date.now();
      await fillNewTourPage(page, {
        name: tourName,
      });

      await page.getByText("Share new tour").click();

      await page.waitForURL(/\/projects\/[a-f0-9]{24}\/tours\/[a-f0-9]{24}/);

      await expect(page.getByText(tourName).first()).toBeVisible();
    });

    test("it should be able to join the project", async ({ page }) => {
      await page.getByText("View Tour").last().click();

      const joinButton = page.getByText(
        "I'm interested to participate in this tour"
      );
      await expect(joinButton).toBeVisible();
      await joinButton.click();

      await page.waitForLoadState("networkidle");

      const isJoined = await isProjectJoined(page);
      expect(isJoined).toBe(true);

      await expect(joinButton).not.toBeVisible();
    });
  });

  test.describe("on a joined project", () => {
    const joinedProjectData = {
      artist: "Milo Rau / NTGent",
      work: "Antigone in the Amazon",
    };

    test.beforeEach(async ({ page }) => {
      await login(page, diffusionStructureCredentials, { baseURL: URL });
      await navigateToProjects(page);
      await navigateToProject(
        page,
        joinedProjectData.artist,
        joinedProjectData.work
      );
    });

    test("it should be able to edit the project", async ({ page }) => {
      await page.getByTestId("edit-project-button").click();

      const updates = {
        description: "Updated project description",
      };

      await fillEditProjectPage(page, updates);

      await page.getByText("Save changes").click();
      await page.waitForLoadState("networkidle");

      await expect(page.getByText(updates.description).first()).toBeVisible();
    });

    test("it should be able to edit the tour", async ({ page }) => {
      await page.getByText("View Tour").last().click();
      await page.waitForURL(/\/projects\/[a-f0-9]{24}\/tours\/[a-f0-9]{24}/);
      await page.getByTestId("edit-tour-button").click();

      const newTourName = "Updated tour name " + Date.now();
      await fillEditTourPage(page, {
        name: newTourName,
      });

      await page.getByText("Update tour", { exact: true }).click();
      await page.waitForLoadState("networkidle");

      await expect(page.getByText(newTourName).first()).toBeVisible();
    });

    test("it should be able to see chat and post messages", async ({
      page,
    }) => {
      await page.getByText("View Tour").last().click();
      await page.waitForURL(/\/projects\/[a-f0-9]{24}\/tours\/[a-f0-9]{24}/);

      await expect(
        page.getByText(
          "Welcome to the chat! Here you can discuss the tour with the other partners."
        )
      ).toBeVisible();

      const testMessage = "Test message " + Date.now();
      await sendChatMessage(page, testMessage);
      await page.waitForLoadState("networkidle");

      await expect(page.getByText(testMessage)).toBeVisible();
    });

    test("it should be able to schedule things on the planning", async ({
      page,
    }) => {
      await page.getByText("View Tour").last().click();
      await page.waitForURL(/\/projects\/[a-f0-9]{24}\/tours\/[a-f0-9]{24}/);

      await fillScheduleWithConfirmedDateForFirstDay(page);

      const planningCell = page
        .getByTestId("planning-cell")
        .filter({ hasText: "CCAM SCENE NATIONALE" })
        .first();
      await expect(planningCell).toBeVisible();
    });
  });
});

test.describe("Artistic team", () => {
  const myProjectData = {
    artist: "Halory Goerger & Antoine Defoort",
    work: "Germinal",
  };

  test("it should be able to see my projects", async ({ page }) => {
    await login(page, performingArtsArtisticTeamCredentials, { baseURL: URL });

    await navigateToProjects(page);

    const projectCards = page.getByTestId("project-card");
    await expect(projectCards.first()).toBeVisible();
  });

  test("it should not be able to see the list of all projects", async ({
    page,
  }) => {
    await login(page, performingArtsArtisticTeamCredentials, { baseURL: URL });
    await expect(
      page.getByRole("tab", { name: "Projects", exact: true })
    ).not.toBeVisible();
  });

  test("it should not be able to see the list of venues", async ({ page }) => {
    await login(page, performingArtsArtisticTeamCredentials, { baseURL: URL });

    await expect(
      page.getByRole("tab", { name: "Venues", exact: true })
    ).not.toBeVisible();

    await page.goto(`${URL}/users/role/structures`);
    await expect(page).not.toHaveURL(/\/users\/role\/structures/);
  });

  test("it should not be able to see the list of artistic teams", async ({
    page,
  }) => {
    await login(page, performingArtsArtisticTeamCredentials, { baseURL: URL });

    await expect(
      page.getByRole("tab", { name: "Artistic teams" })
    ).not.toBeVisible();

    await page.goto(`${URL}/users/role/artistic`);
    await expect(page).not.toHaveURL(/\/users\/role\/artistic/);
  });

  test("it should be able to edit my project", async ({ page }) => {
    await login(page, performingArtsArtisticTeamCredentials, { baseURL: URL });
    await navigateToProjects(page);
    await navigateToProject(page, myProjectData.artist, myProjectData.work);

    await page.getByTestId("edit-project-button").click();

    const updates = {
      description: "Updated project description by artistic team",
    };
    await fillEditProjectPage(page, updates);
    await page.getByText("Save changes").click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(updates.description).first()).toBeVisible();
  });

  test("it should be able to create a project without tour", async ({
    page,
  }) => {
    // AUTHENTICATION
    await login(page, performingArtsArtisticTeamCredentials, { baseURL: URL });

    const projectData = {
      discipline: "Performing Arts",
      artist: "Test Artistic Team Artist",
      work: "Test Artistic Team Work",
      genres: ["Theater"],
      targetAudiences: ["All audiences"],
      description: "Test project description for artistic team",
    };

    await page.getByText("New project").click();
    await page.waitForURL(/\/projects\/new/);

    await fillNewProjectPage(page, projectData);

    await page.getByText("create", { exact: true }).click();
    await page.waitForTimeout(5000);
    await page.waitForURL(/\/projects\/[a-f0-9]{24}/);

    await expect(page.getByText(projectData.artist).first()).toBeVisible();
    await expect(page.getByText(projectData.work).first()).toBeVisible();
    await expect(page.getByText(projectData.description).first()).toBeVisible();
  });

  test("it should be able to create a tour on my project", async ({ page }) => {
    // AUTHENTICATION
    await login(page, performingArtsArtisticTeamCredentials, { baseURL: URL });

    // Navigate to projects page and select the first project
    await navigateToProjects(page);
    await navigateToProject(page, myProjectData.artist, myProjectData.work);

    // Click the "Create tour" button
    await page.getByText("Share a new tour").click();

    // Fill the tour creation form
    const tourName = "Test Tour for Artistic Team " + Date.now();
    await fillNewTourPage(page, {
      name: tourName,
      user: "CCAM",
    });

    // Submit the tour creation
    await page.getByText("Share new tour").click();
    await page.waitForTimeout(5000);
    await page.waitForURL(/\/projects\/[a-f0-9]{24}\/tours\/[a-f0-9]{24}/);

    // Verify the tour was created
    await expect(page.getByText(tourName).first()).toBeVisible();
  });

  test("it should be able to edit the tour on my project", async ({ page }) => {
    await login(page, performingArtsArtisticTeamCredentials, { baseURL: URL });
    await navigateToProjects(page);

    await page.getByTestId("project-card").first().click();
    await page.waitForURL(/\/projects\/[a-f0-9]{24}/);

    await page.getByText("View Tour").first().click();
    await page.waitForURL(/\/projects\/[a-f0-9]{24}\/tours\/[a-f0-9]{24}/);

    await page.getByTestId("edit-tour-button").click();

    const newTourName = "Updated tour name by artistic team " + Date.now();
    await fillEditTourPage(page, {
      name: newTourName,
    });
    await page.getByText("Update tour", { exact: true }).click();
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(newTourName).first()).toBeVisible();
  });

  test("it should be able to schedule things on the planning", async ({
    page,
  }) => {
    await login(page, performingArtsArtisticTeamCredentials, { baseURL: URL });

    await navigateToProjects(page);

    await page.getByTestId("project-card").first().click();
    await page.waitForURL(/\/projects\/[a-f0-9]{24}/);

    await page.getByText("View Tour").first().click();
    await page.waitForURL(/\/projects\/[a-f0-9]{24}\/tours\/[a-f0-9]{24}/);

    await fillScheduleWithWishedDateForFirstDay(page);

    const planningCell = page
      .getByTestId("planning-cell")
      .filter({ hasText: "Wished event date" })
      .first();
    await expect(planningCell).toBeVisible();
  });

  test("it should be able to see chat and post messages", async ({ page }) => {
    await login(page, performingArtsArtisticTeamCredentials, { baseURL: URL });

    await navigateToProjects(page);

    await page.getByTestId("project-card").first().click();
    await page.waitForURL(/\/projects\/[a-f0-9]{24}/);

    await page.getByText("View Tour").first().click();
    await page.waitForURL(/\/projects\/[a-f0-9]{24}\/tours\/[a-f0-9]{24}/);

    const testMessage = "Test message from artistic team " + Date.now();
    await sendChatMessage(page, testMessage);
    await page.waitForLoadState("networkidle");

    await expect(page.getByText(testMessage)).toBeVisible();
  });
});
