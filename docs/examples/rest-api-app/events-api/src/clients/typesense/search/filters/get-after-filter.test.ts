import { describe, expect, it } from "vitest";

import { getAfterFilter } from "./get-after-filter";

describe("getAfterFilter", () => {
  it("should return undefined when no date is provided", () => {
    const filter = getAfterFilter(undefined);
    expect(filter).toBeUndefined();
  });

  it("should return correct filter string for valid ISO8601 date", () => {
    const date = "2024-01-01T12:00:00Z";
    const timestamp = new Date(date).getTime();
    const filter = getAfterFilter(date);
    expect(filter).toBe(`start:>= ${timestamp} || end:>= ${timestamp}`);
  });

  it("should throw error for invalid ISO8601 date format", () => {
    expect(() => {
      getAfterFilter("invalid-date");
    }).toThrow();

    expect(() => {
      getAfterFilter("2024-13-01T12:00:00Z");
    }).toThrow();
  });
});
