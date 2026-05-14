import DOMPurify from "dompurify";
import { JSDOM } from "jsdom";

// Create a DOMPurify instance for server-side use
const window = new JSDOM("").window;
const purify = DOMPurify(window as any);

/**
 * Sanitizes HTML content to prevent XSS attacks
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string
 */
export const sanitizeHtml = (html: string): string => {
  if (!html || typeof html !== "string") {
    return "";
  }

  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
      "pre",
      "span",
      "div",
    ],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
};

/**
 * Sanitizes HTML content for email templates (more restrictive)
 * @param html - The HTML string to sanitize
 * @returns Sanitized HTML string safe for email
 */
export const sanitizeHtmlForEmail = (html: string): string => {
  if (!html || typeof html !== "string") {
    return "";
  }

  return purify.sanitize(html, {
    ALLOWED_TAGS: [
      "p",
      "br",
      "strong",
      "b",
      "em",
      "i",
      "u",
      "ul",
      "ol",
      "li",
      "h1",
      "h2",
      "h3",
      "h4",
      "h5",
      "h6",
      "blockquote",
    ],
    ALLOWED_ATTR: [],
    ALLOW_DATA_ATTR: false,
    ALLOW_UNKNOWN_PROTOCOLS: false,
  });
};
