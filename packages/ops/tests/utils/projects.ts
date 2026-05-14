import { Page, expect } from "@playwright/test";

/**
 * Get the first available project title from the projects list
 */
export async function getFirstProjectTitle(page: Page): Promise<string> {
  const projectTitle = await page
    .locator(".project-card")
    .first()
    .locator("p")
    .first()
    .textContent();

  if (!projectTitle) {
    throw new Error("No project found on the page");
  }

  return projectTitle;
}

export async function fillNewProjectPage(
  page: Page,
  projectData: {
    discipline: string;
    artist: string;
    work: string;
    cities?: { search: string; result: string }[];
    genres: string[];
    targetAudiences: string[];
    description?: string;
    artisticTeam?: {
      email: string;
      firstName: string;
      lastName: string;
      company: string;
      address: { search: string; result: string };
    };
  }
): Promise<void> {
  await page.getByText(projectData.discipline).click();

  // Fill in project details
  await page.getByLabel("Artist *").fill(projectData.artist);
  await page.getByLabel("Work *").fill(projectData.work);

  if (projectData.cities) {
    await Promise.all(
      projectData.cities.map(async ({ search, result }) => {
        await page
          .getByLabel("Cities of implementation (several possible choices) *")
          .fill(search);
        await page.waitForLoadState("networkidle");
        await page.getByText(result).click();
      })
    );
  }

  await Promise.all(
    projectData.genres.map(async (genre) => {
      await page
        .getByTestId("genre-selector")
        .getByText(genre, { exact: true })
        .click();
    })
  );

  await Promise.all(
    projectData.targetAudiences.map(async (targetAudience) => {
      await page
        .getByTestId("target-audience-selector")
        .getByText(targetAudience, { exact: true })
        .click();
    })
  );

  if (projectData.description) {
    await page
      .getByLabel(
        "Indicate here any information you think would be useful to convince partners to join you in organising a tour"
      )
      .fill(projectData.description);
  }

  if (projectData.artisticTeam) {
    await page
      .getByLabel("Search for an artistic team by name or email")
      .fill(projectData.artisticTeam.email);

    await page
      .getByText(
        "This artistic team doesn't seem to be registered on CooProg yet. Would you like to invite them to join the platform?"
      )
      .click();
    await page
      .getByLabel("Company *", { exact: true })
      .fill(projectData.artisticTeam.company);
    await page
      .getByLabel("First name")
      .fill(projectData.artisticTeam.firstName);
    await page.getByLabel("Last name").fill(projectData.artisticTeam.lastName);
    await page
      .getByLabel("Email *", { exact: true })
      .fill(projectData.artisticTeam.email);
    await page
      .getByLabel("Address")
      .fill(projectData.artisticTeam.address.search);
    await page
      .getByText(projectData.artisticTeam.address.result)
      .first()
      .click();
  }
}

export async function fillNewTourPage(
  page: Page,
  tourData?: {
    name?: string;
    user?: string;
  }
): Promise<void> {
  if (tourData?.name) {
    await page.getByLabel("Tour name").fill(tourData.name);
  }

  const today = new Date();
  await page.getByTestId("date-selector").getByLabel("Month").click();
  await page.locator("#menu-month").getByText("August").click();
  await page
    .getByTestId("date-selector")
    .getByLabel("Year")
    .fill(`${today.getFullYear() + 1}`);

  if (tourData?.user) {
    await fillScheduleWithConfirmedDateForOtherUserForFirstDay(
      page,
      tourData.user
    );
  } else {
    await fillScheduleWithConfirmedDateForFirstDay(page);
  }
}

export async function fillScheduleWithWishedDateForFirstDay(
  page: Page
): Promise<void> {
  await page.getByTestId("day-row").first().locator("td:nth-child(3)").hover();
  await page
    .getByTestId("day-row")
    .first()
    .locator("td:nth-child(3)")
    .getByTestId("add-wished-date-button")
    .click();
}

export async function fillScheduleWithConfirmedDateForFirstDay(
  page: Page
): Promise<void> {
  await page.getByTestId("day-row").first().locator("td:nth-child(3)").hover();
  await page
    .getByTestId("day-row")
    .first()
    .locator("td:nth-child(3)")
    .getByTestId("add-confirmed-date-button")
    .click();
}

export async function fillScheduleWithConfirmedDateForOtherUserForFirstDay(
  page: Page,
  user: string
): Promise<void> {
  await page.getByTestId("day-row").first().locator("td:nth-child(3)").hover();
  await page
    .getByTestId("day-row")
    .first()
    .locator("td:nth-child(3)")
    .getByTestId("add-confirmed-date-for-others-button")
    .click();

  await page
    .getByLabel("Search for programmation structure by their name or email")
    .fill(user);
  await page.locator(".MuiPopper-root").getByText(user).click();

  await page.getByText("Add this date").click();
}

export async function fillScheduleWithConfirmedDateForNewUserForFirstDay(
  page: Page,
  user: {
    email: string;
    firstName: string;
    lastName: string;
    company: string;
    address: {
      search: string;
      result: string;
    };
  }
): Promise<void> {
  await page.getByTestId("day-row").first().locator("td:nth-child(3)").hover();
  await page
    .getByTestId("day-row")
    .first()
    .locator("td:nth-child(3)")
    .getByTestId("add-confirmed-date-for-others-button")
    .click();

  await page
    .getByLabel("Search for programmation structure by their name or email")
    .fill(user.email);

  await page
    .getByText(
      "This programmation structure doesn't seem to be registered on CooProg yet. Would you like to invite them to join the platform?"
    )
    .click();

  await page.getByLabel("Company *", { exact: true }).fill(user.company);
  await page.getByLabel("First name").fill(user.firstName);
  await page.getByLabel("Last name").fill(user.lastName);
  await page.getByLabel("Email", { exact: true }).fill(user.email);
  await page.getByLabel("Address").fill(user.address.search);
  await page.getByText(user.address.result).first().click();

  await page.getByText("Add this date").click();
}

/**
 * Join a project (click join button)
 */
export async function joinProject(page: Page): Promise<void> {
  await page.getByRole("button", { name: /rejoindre|join/i }).click();
  await page.waitForLoadState("networkidle");
}

/**
 * Check if user has joined the project
 */
export async function isProjectJoined(page: Page): Promise<boolean> {
  try {
    await page.getByText("My programmation").waitFor({ timeout: 2000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Edit project details
 */
export async function fillEditProjectPage(
  page: Page,
  updates: {
    description?: string;
  }
): Promise<void> {
  await page
    .getByLabel(
      "Indicate here any information you think would be useful to convince partners to join you in organising a tour"
    )
    .fill(updates.description);
}

export async function fillEditTourPage(
  page: Page,
  tourData?: {
    name?: string;
  }
): Promise<void> {
  if (tourData?.name) {
    await page.getByLabel("Tour name *", { exact: true }).fill(tourData.name);
  }
}
