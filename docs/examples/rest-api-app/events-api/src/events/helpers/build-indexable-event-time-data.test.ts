import { describe, it, expect } from "vitest";
import { buildIndexableEventTimeData } from "./build-indexable-event-time-data";
import { GoogleEventTimeData } from "../types/google-event.types";

describe("buildIndexableEventTimeData", () => {
  it("should handle datetime events correctly", () => {
    const input: GoogleEventTimeData = {
      start: { dateTime: "2025-03-21T17:00:00.000Z" },
      end: { dateTime: "2025-03-21T19:00:00.000Z" },
    };

    const result = buildIndexableEventTimeData(input);

    expect(new Date(result.start).toISOString()).toEqual(
      "2025-03-21T17:00:00.000Z"
    );
    expect(new Date(result.end).toISOString()).toEqual(
      "2025-03-21T19:00:00.000Z"
    );
    expect(result.allday).toBe(false);
    expect(result.occurrence).toBe("once");
    expect(result["series.id"]).toBe("");
  });

  it("should handle all-day events correctly", () => {
    const input: GoogleEventTimeData = {
      start: { date: "2023-12-01" },
      end: { date: "2023-12-02" },
    };

    const result = buildIndexableEventTimeData(input);

    expect(
      new Date(result.start).toLocaleDateString("de-DE", { dateStyle: "short" })
    ).toEqual("01.12.23");

    expect(
      new Date(result.end).toLocaleDateString("de-DE", { dateStyle: "short" })
    ).toEqual("02.12.23");

    expect(result.allday).toBe(true);
  });

  it("should handle recurring events correctly", () => {
    const input: GoogleEventTimeData = {
      start: { dateTime: "2023-12-01T10:00:00+01:00" },
      end: { dateTime: "2023-12-01T11:00:00+01:00" },
      recurringEventId: "recurring123",
    };

    const result = buildIndexableEventTimeData(input);

    expect(result.occurrence).toBe("recurring");
    expect(result["series.id"]).toMatch(
      /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i
    );
  });

  it("should throw an error when no time data is provided", () => {
    expect(() =>
      buildIndexableEventTimeData({} as GoogleEventTimeData)
    ).toThrow("No start date provided");

    expect(() =>
      buildIndexableEventTimeData({ start: {} } as GoogleEventTimeData)
    ).toThrow("No start date or dateTime provided");

    expect(() =>
      buildIndexableEventTimeData({
        start: { date: undefined, dateTime: undefined },
      } as GoogleEventTimeData)
    ).toThrow();
  });
});
