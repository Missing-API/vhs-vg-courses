import { describe, it, expect, vi, beforeEach } from "vitest";
import { futureOrPastDate } from "./future-or-past-date";
import * as nowModule from "./now";

describe("futureOrPastDate", () => {
  const fixedDate = new Date("2023-05-15T12:00:00Z"); // Fixed date for testing: May 15, 2023, 12:00 UTC

  beforeEach(() => {
    // Mock the now function to return a fixed date
    vi.spyOn(nowModule, "now").mockImplementation(() => fixedDate);
  });

  describe("today / 0 days", () => {
    it('should return start of today when using "today"', () => {
      const result = futureOrPastDate("today");
      expect(result).toEqual(new Date("2023-05-15T00:00:00Z"));
    });

    it('should return end of today when using "today" with eod=true', () => {
      const result = futureOrPastDate("today", true);
      expect(result).toEqual(new Date("2023-05-15T23:59:59.999Z"));
    });

    it("should return start of today when using 0", () => {
      const result = futureOrPastDate(0);
      expect(result).toEqual(new Date("2023-05-15T00:00:00Z"));
    });

    it("should return end of today when using 0 with eod=true", () => {
      const result = futureOrPastDate(0, true);
      expect(result).toEqual(new Date("2023-05-15T23:59:59.999Z"));
    });
  });

  describe("yesterday / -1 days", () => {
    it('should return start of yesterday when using "yesterday"', () => {
      const result = futureOrPastDate("yesterday");
      expect(result).toEqual(new Date("2023-05-14T00:00:00Z"));
    });

    it('should return end of yesterday when using "yesterday" with eod=true', () => {
      const result = futureOrPastDate("yesterday", true);
      expect(result).toEqual(new Date("2023-05-14T23:59:59.999Z"));
    });

    it("should return start of yesterday when using -1", () => {
      const result = futureOrPastDate(-1);
      expect(result).toEqual(new Date("2023-05-14T00:00:00Z"));
    });

    it("should return end of yesterday when using -1 with eod=true", () => {
      const result = futureOrPastDate(-1, true);
      expect(result).toEqual(new Date("2023-05-14T23:59:59.999Z"));
    });
  });

  describe("tomorrow / 1 days", () => {
    it('should return start of tomorrow when using "tomorrow"', () => {
      const result = futureOrPastDate("tomorrow");
      expect(result).toEqual(new Date("2023-05-16T00:00:00Z"));
    });

    it('should return end of tomorrow when using "tomorrow" with eod=true', () => {
      const result = futureOrPastDate("tomorrow", true);
      expect(result).toEqual(new Date("2023-05-16T23:59:59.999Z"));
    });

    it("should return start of tomorrow when using 1", () => {
      const result = futureOrPastDate(1);
      expect(result).toEqual(new Date("2023-05-16T00:00:00Z"));
    });

    it("should return end of tomorrow when using 1 with eod=true", () => {
      const result = futureOrPastDate(1, true);
      expect(result).toEqual(new Date("2023-05-16T23:59:59.999Z"));
    });
  });

  describe("future and past dates", () => {
    it("should return start of a future date (7 days ahead)", () => {
      const result = futureOrPastDate(7);
      expect(result).toEqual(new Date("2023-05-22T00:00:00Z"));
    });

    it("should return end of a future date (7 days ahead) with eod=true", () => {
      const result = futureOrPastDate(7, true);
      expect(result).toEqual(new Date("2023-05-22T23:59:59.999Z"));
    });

    it("should return start of a past date (7 days before)", () => {
      const result = futureOrPastDate(-7);
      expect(result).toEqual(new Date("2023-05-08T00:00:00Z"));
    });

    it("should return end of a past date (7 days before) with eod=true", () => {
      const result = futureOrPastDate(-7, true);
      expect(result).toEqual(new Date("2023-05-08T23:59:59.999Z"));
    });
  });

  describe("error cases", () => {
    it("should throw an error for invalid input", () => {
      // @ts-expect-error Testing invalid input
      expect(() => futureOrPastDate("invalid")).toThrow("Invalid date");
    });
  });
});
