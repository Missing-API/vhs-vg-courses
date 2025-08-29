import { describe, it, expect } from "vitest";
import { ISO8601Schema } from "./iso8601.types";

describe("ISO8601Schema", () => {
  it("should validate correct ISO8601 format with milliseconds and Z", () => {
    const dateString = "2025-04-01T07:58:15.735Z";
    const result = ISO8601Schema.parse(dateString);
    // The schema transforms to ISO format which always includes milliseconds
    expect(result).toBe("2025-04-01T07:58:15.735Z");
  });

  it("should validate correct ISO8601 format without milliseconds", () => {
    const dateString = "2025-05-28T07:15:00Z";
    const result = ISO8601Schema.parse(dateString);
    // The schema transforms to ISO format which always includes milliseconds
    expect(result).toBe("2025-05-28T07:15:00.000Z");
  });

  it("should validate correct ISO8601 format with timezone offset", () => {
    const dateString = "2025-04-01T07:58:15+02:00";
    const parsed = ISO8601Schema.parse(dateString);
    // When timezone offset is provided, toISOString converts to UTC
    expect(parsed).toBe("2025-04-01T05:58:15.000Z");
  });

  it("should validate correct ISO8601 format with negative timezone offset", () => {
    const dateString = "2025-04-01T07:58:15-05:00";
    const parsed = ISO8601Schema.parse(dateString);
    // When timezone offset is provided, toISOString converts to UTC
    expect(parsed).toBe("2025-04-01T12:58:15.000Z");
  });

  it("should reject incorrect date format", () => {
    // Testing only formats that should definitely fail with the current regex
    const invalidFormats = [
      "2025/04/01T07:58:15Z", // Wrong date separator
      "2025-04-01 07:58:15Z", // Missing T separator
      "abcdefg", // Not a date at all
      "2025-04-01T07:58:15Z extra", // Extra text
    ];

    for (const invalid of invalidFormats) {
      expect(() => ISO8601Schema.parse(invalid)).toThrow();
    }
  });

  it("should reject invalid date values despite passing regex", () => {
    // These may pass the regex but should fail date validation
    const invalidDates = [
      "2025-13-01T07:58:15Z", // Invalid month
      "2025-04-32T07:58:15Z", // Invalid day
      "2025-04-01T25:58:15Z", // Invalid hour
      "2025-04-01T07:60:15Z", // Invalid minute
      "2025-04-01T07:58:60Z", // Invalid second
    ];

    for (const invalid of invalidDates) {
      expect(() => ISO8601Schema.parse(invalid)).toThrow();
    }
  });

  it("should transform date string to ISO string", () => {
    const dateString = "2025-04-01T07:58:15Z";
    const result = ISO8601Schema.parse(dateString);
    expect(result).toBe("2025-04-01T07:58:15.000Z");
  });

  it("should handle leap year dates", () => {
    const leapYearDate = "2024-02-29T12:30:45Z";
    const result = ISO8601Schema.parse(leapYearDate);
    expect(result).toBe("2024-02-29T12:30:45.000Z");
  });
});
