import { describe, it, expect } from "vitest";
import { parseGermanDate } from "./parse-course-dates";

describe("parseGermanDate timezone fix", () => {
  it("should correctly parse German date with time (CET, November)", () => {
    const dateString = "Mo., 03.11.2025, um 17:00 Uhr";
    const result = parseGermanDate(dateString);
    
    // Should be Monday, November 3, 2025 at 17:00 local time
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(10); // November (0-indexed)
    expect(result.getDate()).toBe(3);
    expect(result.getHours()).toBe(17);
    expect(result.getMinutes()).toBe(0);
    
    // When converted to ISO (UTC), November 2025 is CET (UTC+1)
    // So 17:00 local becomes 16:00 UTC
    const isoString = result.toISOString();
    expect(isoString).toBe("2025-11-03T16:00:00.000Z");
  });

  it("should correctly parse German date with time (CEST, September)", () => {
    const dateString = "Mo., 08.09.2025, um 16:00 Uhr";
    const result = parseGermanDate(dateString);

    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(8); // September
    expect(result.getDate()).toBe(8);
    expect(result.getHours()).toBe(16);
    expect(result.getMinutes()).toBe(0);

    // September in Berlin is CEST (UTC+2), so 16:00 local -> 14:00 UTC
    const isoString = result.toISOString();
    expect(isoString).toBe("2025-09-08T14:00:00.000Z");
  });

  it("should handle date without time", () => {
    const dateString = "Sa., 15.11.2025";
    const result = parseGermanDate(dateString);
    
    expect(result.getFullYear()).toBe(2025);
    expect(result.getMonth()).toBe(10); // November
    expect(result.getDate()).toBe(15);
    expect(result.getHours()).toBe(0); // Should default to midnight
    expect(result.getMinutes()).toBe(0);
  });
});
