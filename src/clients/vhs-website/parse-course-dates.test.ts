import { describe, it, expect } from "vitest";
import { parseGermanDate, parseTimeRange, convertToISO8601, parseScheduleEntry } from "./parse-course-dates";

describe("parse-course-dates utilities", () => {
  it("parses typical German date strings", () => {
    const d1 = parseGermanDate("Sa., 15.11.2025, um 09:00 Uhr");
    expect(d1.getFullYear()).toBe(2025);
    expect(d1.getMonth()).toBe(10);
    expect(d1.getDate()).toBe(15);

    const d2 = parseGermanDate("Montag • 10.11.2025 • 17:00 - 20:15 Uhr");
    expect(d2.getFullYear()).toBe(2025);
    expect(d2.getMonth()).toBe(10);
    expect(d2.getDate()).toBe(10);
  });

  it("parses time ranges", () => {
    const r = parseTimeRange("17:00 - 20:15 Uhr");
    expect(r.start.h).toBe(17);
    expect(r.end.m).toBe(15);
  });

  it("converts to ISO", () => {
    const iso = convertToISO8601(new Date(Date.UTC(2025, 10, 15, 8, 0, 0)));
    expect(iso).toMatch(/^2025-11-15T08:00:00\.000Z$/);
  });

  it("parses schedule entry with room and location", () => {
    const s = parseScheduleEntry("Mittwoch • 12.11.2025 • 17:00 - 20:15 Uhr • VHS in Greifswald • Raum 12");
    expect(s.date).toBe("2025-11-12");
    expect(s.location).toContain("Greifswald");
    expect(s.room).toBe("Raum 12");
  });

  it("parses schedule entry with only 'um' time", () => {
    const s = parseScheduleEntry("Sa., 15.11.2025, um 09:00 Uhr • VHS in Pasewalk");
    expect(s.date).toBe("2025-11-15");
    expect(s.location).toContain("VHS in Pasewalk");
    expect(new Date(s.end).getTime()).toBeGreaterThan(new Date(s.start).getTime());
  });
});