import { containsHtml } from "./containsHtml";
import { cleanSpaces } from "./cleanSpaces";

/**
 * Convert HTML content to clean plain text.
 * - Removes all HTML tags
 * - Preserves line breaks from block elements
 * - Cleans up whitespace and normalizes line breaks
 */
const htmlToText = (html: string): string => {
  if (!html) return "";
  
  let text = html;
  
  // If HTML tags are present, process them
  if (containsHtml(html)) {
    // Convert obvious line break boundaries to \n
    text = html
      .replace(/<\s*br\s*\/?>/gi, "\n")
      .replace(/<\/\s*(p|div|li|h[1-6])\s*>/gi, "\n")
      // remove scripts/styles entirely
      .replace(/<\s*(script|style)[^>]*>[\s\S]*?<\/\s*\1\s*>/gi, "");

    // Strip all remaining HTML tags
    text = text.replace(/<[^>]+>/g, "");
  }

  // Decode common HTML entities (whether from HTML tags or plain text)
  text = text
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&nbsp;/g, " ");

  // Clean up whitespace and normalize line breaks
  return cleanSpaces(text);
};

export { htmlToText };
