import { ISO8601Schema, ISO8601DateSchema } from "./iso8601.types";
import { ZodError } from "zod";
import { describe, test, expect } from "vitest";

describe("ISO8601Schema", () => {
  describe("valid formats", () => {
    test("accepts full ISO8601 format with Z timezone", () => {
      const dateString = "2023-04-12T14:30:45Z";
      const result = ISO8601Schema.parse(dateString);
      expect(result).toBe(new Date(dateString).toISOString());
    });

    test("accepts ISO8601 with milliseconds", () => {
      const dateString = "2023-04-12T14:30:45.123Z";
      const result = ISO8601Schema.parse(dateString);
      expect(result).toBe(new Date(dateString).toISOString());
    });

    test("accepts ISO8601 with positive timezone offset", () => {
      const dateString = "2023-04-12T14:30:45+02:00";
      const result = ISO8601Schema.parse(dateString);
      expect(result).toBe(new Date(dateString).toISOString());
    });

    test("accepts ISO8601 with negative timezone offset", () => {
      const dateString = "2023-04-12T14:30:45-05:00";
      const result = ISO8601Schema.parse(dateString);
      expect(result).toBe(new Date(dateString).toISOString());
    });
  });

  describe("invalid formats", () => {
    test("rejects non-ISO8601 string", () => {
      const dateString = "April 12, 2023";
      expect(() => ISO8601Schema.parse(dateString)).toThrow(ZodError);
    });

    test("rejects date without time", () => {
      const dateString = "2023-04-12";
      expect(() => ISO8601Schema.parse(dateString)).toThrow(ZodError);
    });

    test("rejects time without date", () => {
      const dateString = "14:30:45Z";
      expect(() => ISO8601Schema.parse(dateString)).toThrow(ZodError);
    });

    test("rejects malformed ISO8601 (incorrect separators)", () => {
      const dateString = "2023/04/12T14:30:45Z";
      expect(() => ISO8601Schema.parse(dateString)).toThrow(ZodError);
    });

    test("rejects malformed ISO8601 (incorrect time format)", () => {
      const dateString = "2023-04-12T14-30-45Z";
      expect(() => ISO8601Schema.parse(dateString)).toThrow(ZodError);
    });
  });

  describe("transformation", () => {
    test("transforms valid ISO8601 to date ISO string", () => {
      const dateString = "2023-04-12T14:30:45Z";
      const result = ISO8601Schema.parse(dateString);
      expect(typeof result).toBe("string");
      expect(result).toMatch(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/);
      expect(result).toBe(new Date(dateString).toISOString());
    });
  });
});

describe("ISO8601DateSchema", () => {
  describe("valid formats", () => {
    test("accepts valid ISO8601 date format", () => {
      const dateString = "2023-04-12";
      const result = ISO8601DateSchema.parse(dateString);
      expect(result).toBe(dateString);
    });

    test("accepts date with leading zeros", () => {
      const dateString = "2023-01-05";
      const result = ISO8601DateSchema.parse(dateString);
      expect(result).toBe(dateString);
    });
  });

  describe("invalid formats", () => {
    test("rejects non-ISO8601 date string", () => {
      const dateString = "04/12/2023";
      expect(() => ISO8601DateSchema.parse(dateString)).toThrow(ZodError);
    });

    test("rejects date with time", () => {
      const dateString = "2023-04-12T14:30:45Z";
      expect(() => ISO8601DateSchema.parse(dateString)).toThrow(ZodError);
    });

    test("rejects date with incorrect separator", () => {
      const dateString = "2023/04/12";
      expect(() => ISO8601DateSchema.parse(dateString)).toThrow(ZodError);
    });

    test("rejects malformed date format", () => {
      const dateString = "20230412";
      expect(() => ISO8601DateSchema.parse(dateString)).toThrow(ZodError);
    });

    test("rejects invalid date values", () => {
      const dateString = "2023-13-45"; // Invalid month and day
      expect(() => ISO8601DateSchema.parse(dateString)).toThrow(ZodError);
    });
  });
});
