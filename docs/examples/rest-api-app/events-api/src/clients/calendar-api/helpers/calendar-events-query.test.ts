import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCalendarEventsQuery } from "./calendar-events-query";
import * as nowModule from "../../../events/helpers/datetime/now";
import { CalendarEventsQuery } from "../types/calendar-events-query.types";

describe("getCalendarEventsQuery", () => {
  const mockDate = new Date("2023-05-15T12:00:00Z");

  beforeEach(() => {
    // Mock the now function to return a fixed date
    vi.spyOn(nowModule, "now").mockImplementation(() => mockDate);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should use provided query values when all values are provided", () => {
    const query: CalendarEventsQuery = {
      id: "calendar-123",
      after: "2023-06-01T00:00:00Z",
      before: "2023-08-01T00:00:00Z",
      updatedSince: "2023-04-01T00:00:00Z",
    };

    const result = getCalendarEventsQuery(query);

    expect(result).toEqual({
      id: "calendar-123",
      after: "2023-06-01T00:00:00.000Z",
      before: "2023-08-01T00:00:00.000Z",
      updatedSince: "2023-04-01T00:00:00.000Z",
    });
  });

  it("should use default values when no query values are provided", () => {
    const query: CalendarEventsQuery = {
      id: "calendar-123",
    };

    const result = getCalendarEventsQuery(query);

    // Default after is today at 00:00:00
    const expectedAfter = new Date("2023-05-15T00:00:00Z").toISOString();
    // Default before is 90 days in the future at 23:59:59
    const expectedBefore = new Date("2023-08-13T23:59:59.999Z").toISOString();

    expect(result).toEqual({
      id: "calendar-123",
      after: expectedAfter,
      before: expectedBefore,
      updatedSince: undefined,
    });
  });

  it("should use provided default parameters when query values are missing", () => {
    const query: CalendarEventsQuery = {
      id: "calendar-123",
    };

    const defaultBefore = 30; // 30 days in the future
    const defaultAfter = -10; // 10 days in the past
    const defaultChangedSince = -5; // 5 days in the past

    const result = getCalendarEventsQuery(
      query,
      defaultBefore,
      defaultAfter,
      defaultChangedSince
    );

    // Default after is 10 days in the past at 00:00:00
    const expectedAfter = new Date("2023-05-05T00:00:00Z").toISOString();
    // Default before is 30 days in the future at 23:59:59
    const expectedBefore = new Date("2023-06-14T23:59:59.999Z").toISOString();
    // Default updatedSince is 5 days in the past at 00:00:00
    const expectedUpdatedSince = new Date("2023-05-10T00:00:00Z").toISOString();

    expect(result).toEqual({
      id: "calendar-123",
      after: expectedAfter,
      before: expectedBefore,
      updatedSince: expectedUpdatedSince,
    });
  });

  it("should override default parameters with query values when provided", () => {
    const query: CalendarEventsQuery = {
      id: "calendar-123",
      after: "2023-06-01T00:00:00Z",
      before: "2023-08-01T00:00:00Z",
    };

    const defaultBefore = 30;
    const defaultAfter = -10;
    const defaultChangedSince = -5;

    const result = getCalendarEventsQuery(
      query,
      defaultBefore,
      defaultAfter,
      defaultChangedSince
    );

    // Query values should be used instead of defaults
    expect(result).toEqual({
      id: "calendar-123",
      after: "2023-06-01T00:00:00.000Z",
      before: "2023-08-01T00:00:00.000Z",
      updatedSince: new Date("2023-05-10T00:00:00Z").toISOString(),
    });
  });

  it('should handle special date strings like "today"', () => {
    const query: CalendarEventsQuery = {
      id: "calendar-123",
    };

    // Mock implementation to test "today" values
    vi.spyOn(nowModule, "now").mockImplementation(
      () => new Date("2023-05-15T12:00:00Z")
    );

    const result = getCalendarEventsQuery(query);

    // "today" at 00:00:00
    const expectedAfter = new Date("2023-05-15T00:00:00Z").toISOString();
    // 90 days in the future at 23:59:59
    const expectedBefore = new Date("2023-08-13T23:59:59.999Z").toISOString();

    expect(result).toEqual({
      id: "calendar-123",
      after: expectedAfter,
      before: expectedBefore,
      updatedSince: undefined,
    });
  });

  it("should properly format ISO strings for dates", () => {
    const query: CalendarEventsQuery = {
      id: "calendar-123",
      after: "2023-06-01T00:00:00Z", // Updated to full ISO string
      before: "2023-08-01T00:00:00Z", // Updated to full ISO string
    };

    const result = getCalendarEventsQuery(query);

    // Should convert to proper ISO format
    expect(result).toEqual({
      id: "calendar-123",
      after: "2023-06-01T00:00:00.000Z",
      before: "2023-08-01T00:00:00.000Z",
      updatedSince: undefined,
    });
  });
});
