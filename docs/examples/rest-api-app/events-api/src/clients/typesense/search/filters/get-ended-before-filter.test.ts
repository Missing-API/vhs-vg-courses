import { beforeEach, describe, expect, it, vi, afterEach } from "vitest";
import { getEndedBeforeFilter } from "./get-ended-before-filter";
import * as nowModule from "@/src/events/helpers/datetime/now";

describe("getEndedBeforeFilter", () => {
  const mockFixedDate = new Date("2023-01-01T12:00:00.000Z");
  const mockFixedTimestamp = mockFixedDate.getTime();

  beforeEach(() => {
    // Mock the getCurrentTime function to return a fixed date
    vi.spyOn(nowModule, "now").mockImplementation(() => mockFixedDate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('should return a filter with current timestamp when isoDate is "now"', () => {
    const filter = getEndedBeforeFilter("now");
    expect(filter).toBe(
      `start:<=${mockFixedTimestamp} && end:<=${mockFixedTimestamp}`
    );
  });

  it("should return a filter with current timestamp when isoDate is not provided", () => {
    const filter = getEndedBeforeFilter();
    expect(filter).toBe(
      `start:<=${mockFixedTimestamp} && end:<=${mockFixedTimestamp}`
    );
  });

  it("should return a filter with the specified timestamp when a valid ISO date is provided", () => {
    const testIsoDate = "2022-06-15T10:30:00.000Z";
    const testTimestamp = new Date(testIsoDate).getTime();

    const filter = getEndedBeforeFilter(testIsoDate);
    expect(filter).toBe(`start:<=${testTimestamp} && end:<=${testTimestamp}`);
  });

  it("should throw an error when an invalid ISO date is provided", () => {
    const invalidDate = "not-a-date";
    expect(() => {
      getEndedBeforeFilter(invalidDate as string);
    }).toThrow();
  });
});
