import { describe, expect, test } from "vitest";
import { calculateTimespan } from "./calculate-timespan";
import { GoogleEventDateTime } from "../../types/google-event.types";

describe("calculateTimespan", () => {
  describe("Date-only format (all-day events)", () => {
    test("returns '1day' for a single day event", () => {
      const start: GoogleEventDateTime = { date: "2025-04-03" };
      const end: GoogleEventDateTime = { date: "2025-04-04" };

      expect(calculateTimespan(start, end)).toBe("1day");
    });

    test("returns '2days' for a two-day event", () => {
      const start: GoogleEventDateTime = { date: "2025-04-03" };
      const end: GoogleEventDateTime = { date: "2025-04-04" };

      expect(calculateTimespan(start, end)).toBe("2days");
    });

    test("returns '7days' for a week-long event", () => {
      const start: GoogleEventDateTime = { date: "2025-04-03" };
      const end: GoogleEventDateTime = { date: "2025-04-09" };

      expect(calculateTimespan(start, end)).toBe("7days");
    });
  });

  describe("DateTime format (time-specific events)", () => {
    test("returns '30minutes' for a 30-minute event", () => {
      const start: GoogleEventDateTime = {
        dateTime: "2025-04-03T14:00:00+01:00",
      };
      const end: GoogleEventDateTime = {
        dateTime: "2025-04-03T14:30:00+01:00",
      };

      expect(calculateTimespan(start, end)).toBe("30minutes");
    });

    test("returns '1minute' for a 1-minute event", () => {
      const start: GoogleEventDateTime = {
        dateTime: "2025-04-03T14:00:00+01:00",
      };
      const end: GoogleEventDateTime = {
        dateTime: "2025-04-03T14:01:00+01:00",
      };

      expect(calculateTimespan(start, end)).toBe("1minute");
    });

    test("returns '45minutes' for a 45-minute event", () => {
      const start: GoogleEventDateTime = {
        dateTime: "2025-04-03T14:00:00+01:00",
      };
      const end: GoogleEventDateTime = {
        dateTime: "2025-04-03T14:45:00+01:00",
      };

      expect(calculateTimespan(start, end)).toBe("45minutes");
    });

    test("returns '1hour' for a 1-hour event", () => {
      const start: GoogleEventDateTime = {
        dateTime: "2025-04-03T14:00:00+01:00",
      };
      const end: GoogleEventDateTime = {
        dateTime: "2025-04-03T15:00:00+01:00",
      };

      expect(calculateTimespan(start, end)).toBe("1hour");
    });

    test("returns '2hours' for a 2-hour event", () => {
      const start: GoogleEventDateTime = {
        dateTime: "2025-04-03T14:00:00+01:00",
      };
      const end: GoogleEventDateTime = {
        dateTime: "2025-04-03T16:00:00+01:00",
      };

      expect(calculateTimespan(start, end)).toBe("2hours");
    });

    test("returns '1day' for a 24-hour event", () => {
      const start: GoogleEventDateTime = {
        dateTime: "2025-04-03T14:00:00+01:00",
      };
      const end: GoogleEventDateTime = {
        dateTime: "2025-04-04T14:00:00+01:00",
      };

      expect(calculateTimespan(start, end)).toBe("1day");
    });

    test("returns '3days' for a multi-day event", () => {
      const start: GoogleEventDateTime = {
        dateTime: "2025-04-03T14:00:00+01:00",
      };
      const end: GoogleEventDateTime = {
        dateTime: "2025-04-06T14:00:00+01:00",
      };

      expect(calculateTimespan(start, end)).toBe("3days");
    });
  });

  describe("Edge cases", () => {
    test("returns '1day' when no end date is provided", () => {
      const start: GoogleEventDateTime = { date: "2025-04-03" };

      expect(calculateTimespan(start)).toBe("1day");
    });

    test("returns '1day' when no end datetime is provided", () => {
      const start: GoogleEventDateTime = {
        dateTime: "2025-04-03T14:00:00+01:00",
      };

      expect(calculateTimespan(start)).toBe("1day");
    });

    test("returns '1day' for default fallback when incompatible formats are used", () => {
      // Testing with date in start and dateTime in end
      const start: GoogleEventDateTime = { date: "2025-04-03" };
      const end: GoogleEventDateTime = {
        dateTime: "2025-04-03T14:00:00+01:00",
      };

      expect(calculateTimespan(start, end)).toBe("1day");
    });
  });
});
