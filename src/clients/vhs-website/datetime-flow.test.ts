import { describe, it, expect } from "vitest";
import { parseGermanDate } from "./parse-course-dates";

function formatGermanDateTime(iso?: string): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return undefined;

  const datePart = new Intl.DateTimeFormat("de-DE", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    timeZone: "Europe/Berlin",
  }).format(d);

  const timePart = new Intl.DateTimeFormat("de-DE", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Berlin",
  }).format(d);

  return `${datePart}, um ${timePart} Uhr`;
}

describe("End-to-end datetime flow", () => {
  it("should parse and format German datetime correctly", () => {
    // Input from the user's example
    const input = "Mo., 03.11.2025, um 17:00 Uhr";
    
    // Parse the date
    const parsed = parseGermanDate(input);
    expect(parsed.getHours()).toBe(17); // Should be 17:00 local time
    
    // Convert to ISO (for storage)
    const iso = parsed.toISOString();
    expect(iso).toBe("2025-11-03T16:00:00.000Z"); // 17:00 CET = 16:00 UTC
    
    // Format back to German for display
    const formatted = formatGermanDateTime(iso);
    expect(formatted).toBe("Mo., 03.11.2025, um 17:00 Uhr"); // Should show original German time
  });
});
