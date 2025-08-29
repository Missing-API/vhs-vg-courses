import { describe, expect, it } from "vitest";

import { getBeforeFilter } from "./get-before-filter";

describe("getBeforeFilter", () => {
  it("should return undefined when no date is provided", () => {
    const filter = getBeforeFilter(undefined);
    expect(filter).toBeUndefined();
  });

  it("should return correct filter string for valid ISO8601 date", () => {
    const date = "2024-01-01T12:00:00Z";
    const timestamp = new Date(date).getTime();
    const filter = getBeforeFilter(date);
    expect(filter).toBe(`start:<= ${timestamp}`);
  });

  it("should throw error for invalid ISO8601 date format", () => {
    expect(() => {
      getBeforeFilter("invalid-date");
    }).toThrow();

    expect(() => {
      getBeforeFilter("2024-13-01T12:00:00Z");
    }).toThrow();
  });
});
