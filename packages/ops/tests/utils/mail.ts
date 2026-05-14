export interface EmailAddress {
  address: string;
  name: string;
}

export interface EmailAttachment {
  contentType: string;
  contentDisposition: string;
  fileName: string;
  generatedFileName: string;
  contentId: string;
  checksum: string;
}

export interface EmailHeaders {
  "content-type": string;
  from: string;
  to: string;
  subject: string;
  "x-some-header"?: string;
  "x-mailer"?: string;
  date: string;
  "message-id": string;
  "mime-version": string;
}

export interface EmailEnvelope {
  from: string;
  to: string[];
  host: string;
  remoteAddress: string;
}

export interface Email {
  id: string;
  time: string;
  from: EmailAddress[];
  to: EmailAddress[];
  subject: string;
  text: string;
  html: string;
  headers: EmailHeaders;
  read: boolean;
  messageId: string;
  priority: string;
  attachments?: EmailAttachment[];
  envelope: EmailEnvelope;
}

// MailDev configuration constant
const MAILDEV_URL = process.env.MAILDEV_URL || "http://localhost:3000/mailbox";

/**
 * Reset all emails in MailDev
 * This clears the email queue and removes all stored emails
 */
export async function resetEmails(): Promise<void> {
  try {
    const response = await fetch(`${MAILDEV_URL}/email/all`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(`Failed to reset emails: ${response.statusText}`);
    }
  } catch (error) {
    console.error("Error resetting emails:", error);
    throw error;
  }
}

/**
 * Get all emails from MailDev
 * Returns an array of all emails currently stored in MailDev
 */
export async function getEmails(): Promise<Email[]> {
  try {
    const response = await fetch(`${MAILDEV_URL}/email`);

    if (!response.ok) {
      throw new Error(`Failed to fetch emails: ${response.statusText}`);
    }

    const emails = await response.json();
    return emails;
  } catch (error) {
    console.error("Error fetching emails:", error);
    throw error;
  }
}

/**
 * Get a specific email by ID
 */
export async function getEmailById(emailId: string): Promise<Email> {
  try {
    const response = await fetch(`${MAILDEV_URL}/email/${emailId}`);

    if (!response.ok) {
      throw new Error(
        `Failed to fetch email ${emailId}: ${response.statusText}`
      );
    }

    const email = await response.json();
    return email;
  } catch (error) {
    console.error(`Error fetching email ${emailId}:`, error);
    throw error;
  }
}

/**
 * Delete a specific email by ID
 */
export async function deleteEmailById(emailId: string): Promise<void> {
  try {
    const response = await fetch(`${MAILDEV_URL}/email/${emailId}`, {
      method: "DELETE",
    });

    if (!response.ok) {
      throw new Error(
        `Failed to delete email ${emailId}: ${response.statusText}`
      );
    }
  } catch (error) {
    console.error(`Error deleting email ${emailId}:`, error);
    throw error;
  }
}

/**
 * Wait for an email to arrive with a specific subject
 * Useful for testing email notifications
 */
export async function waitForEmail(
  subject: string,
  timeout: number = 50000
): Promise<Email | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const emails = await getEmails();
    const matchingEmail = emails.find((email) =>
      email.subject.includes(subject)
    );

    if (matchingEmail) {
      return matchingEmail;
    }

    // Wait 500ms before checking again
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return null;
}

/**
 * Wait for an email to arrive from a specific sender
 */
export async function waitForEmailFrom(
  from: string,
  timeout: number = 10000
): Promise<Email | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const emails = await getEmails();
    const matchingEmail = emails.find((email) =>
      email.from.some((sender) => sender.address.includes(from))
    );

    if (matchingEmail) {
      return matchingEmail;
    }

    // Wait 500ms before checking again
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return null;
}

/**
 * Wait for an email to arrive to a specific recipient
 */
export async function waitForEmailTo(
  to: string,
  timeout: number = 10000
): Promise<Email | null> {
  const startTime = Date.now();

  while (Date.now() - startTime < timeout) {
    const emails = await getEmails();
    const matchingEmail = emails.find((email) =>
      email.to.some((recipient) => recipient.address.includes(to))
    );

    if (matchingEmail) {
      return matchingEmail;
    }

    // Wait 500ms before checking again
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  return null;
}

/**
 * Get the latest email (most recent)
 */
export async function getLatestEmail(): Promise<Email | null> {
  const emails = await getEmails();
  return emails.length > 0 ? emails[emails.length - 1] : null;
}

/**
 * Get emails count
 */
export async function getEmailsCount(): Promise<number> {
  const emails = await getEmails();
  return emails.length;
}

/**
 * Check if MailDev is running and accessible
 */
export async function isMailDevRunning(): Promise<boolean> {
  try {
    const response = await fetch(`${MAILDEV_URL}/email`);
    return response.ok;
  } catch (error) {
    return false;
  }
}
