import { Page, expect } from "@playwright/test";

/**
 * Send a message in the chat
 */
export async function sendChatMessage(
  page: Page,
  message: string
): Promise<void> {
  // Find the chat input
  const chatInput = page.getByPlaceholder("Enter your message");
  await chatInput.fill(message);

  // Send the message (either by pressing Enter or clicking send button)
  await chatInput.press("Enter");

  // Wait for the message to appear
  await page.waitForLoadState("networkidle");
}

/**
 * Get the last message from the chat
 */
export async function getLastChatMessage(page: Page): Promise<string> {
  const messages = page.locator(".chat-message").last();
  return (await messages.textContent()) || "";
}

/**
 * Check if a message appears in the chat
 */
export async function isMessageInChat(
  page: Page,
  message: string
): Promise<boolean> {
  try {
    await page.getByText(message).waitFor({ timeout: 5000 });
    return true;
  } catch {
    return false;
  }
}

/**
 * Navigate to the chat section of a project
 */
export async function navigateToChat(page: Page): Promise<void> {
  await page.getByRole("tab", { name: /chat|messages/i }).click();
  await page.waitForLoadState("networkidle");
}
