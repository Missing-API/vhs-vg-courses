import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { generateCourseIcs } from "./generate-course-ics";
import type * as detailsMod from "./fetch-course-details";

const mockLocation = { id: "anklam", name: "Anklam", address: "Am Markt 1, 17389 Anklam" };

const mockCourses = [
  {
    id: "252A00101",
    title: "Deutsch A1",
    detailUrl: "https://www.vhs-vg.de/kurse/kurs/252A00101",
    start: "2025-09-01T08:00:00.000Z",
    locationText: "VHS Anklam",
    available: true,
    bookable: true,
  },
  {
    id: "252A00102",
    title: "Englisch A2",
    detailUrl: "https://www.vhs-vg.de/kurse/kurs/252A00102",
    start: "2025-09-05T10:00:00.000Z",
    locationText: "VHS Anklam",
    available: true,
    bookable: false,
  },
];

describe("generateCourseIcs", () => {
  let spy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    vi.resetModules();
    spy = vi.spyOn(await vi.importActual<typeof detailsMod>("./fetch-course-details"), "fetchCourseDetails");
    spy.mockReset();
    // First course: two sessions
    spy.mockResolvedValueOnce({
      id: "252A00101",
      title: "Deutsch A1",
      description: "<div><p>Kursbeschreibung</p></div>",
      start: "2025-09-01T08:00:00.000Z",
      duration: "2 Termine",
      numberOfDates: 2,
      schedule: [
        {
          date: "2025-09-01",
          startTime: "2025-09-01T08:00:00.000Z",
          endTime: "2025-09-01T09:30:00.000Z",
          location: "VHS Anklam",
          room: "Raum 1",
        },
        {
          date: "2025-09-08",
          startTime: "2025-09-08T08:00:00.000Z",
          endTime: "2025-09-08T09:30:00.000Z",
          location: "VHS Anklam",
          room: "Raum 1",
        },
      ],
      location: {
        name: "VHS Anklam",
        room: "Raum 1",
        address: "Am Markt 1, 17389 Anklam",
      },
      summary: "<div><p>Deutsch A1 Einführung</p><p>Der Kurs beginnt am Mo., 01.09.2025, um 08:00 Uhr.</p><p><a href=\"https://www.vhs-vg.de/kurse/kurs/252A00101\">alle Kursinfos</a></p></div>",
    } as any);
    // Second course: no schedule -> fallback event
    spy.mockResolvedValueOnce({
      id: "252A00102",
      title: "Englisch A2",
      description: "<div><p>Grundlagen Englisch</p></div>",
      start: "2025-09-05T10:00:00.000Z",
      duration: "1 Termin",
      numberOfDates: 0,
      schedule: [],
      location: {
        name: "VHS Anklam",
        address: "Am Markt 1, 17389 Anklam",
      },
      summary: "<div><p>Grundlagen Englisch</p><p>Der Kurs beginnt am Fr., 05.09.2025, um 12:00 Uhr.</p></div>",
    } as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("creates a VCALENDAR with VEVENTs per session and proper fields", async () => {
    const ics = await generateCourseIcs({
      location: mockLocation as any,
      courses: mockCourses as any,
    });

    expect(ics).toContain("BEGIN:VCALENDAR");
    expect(ics).toContain("END:VCALENDAR");
    // Two sessions for first + one fallback for second = 3 events
    const veventCount = (ics.match(/BEGIN:VEVENT/g) || []).length;
    expect(veventCount).toBe(3);

    // Titles include session info
    expect(ics).toContain("SUMMARY:Deutsch A1 (Termin 1/2)");
    expect(ics).toContain("SUMMARY:Deutsch A1 (Termin 2/2)");
    // Fallback has no termin annotation
    expect(ics).toContain("SUMMARY:Englisch A2");

    // Timezone markers
    expect(ics).toMatch(/DTSTART;TZID=Europe\/Berlin:/);

    // HTML alternate description should be present
    expect(ics).toMatch(/X-ALT-DESC;FMTTYPE=text\/html:/);

    // UID uniqueness
    expect(ics).toContain("UID:anklam-252a00101-1@vhs-vg.de");
    expect(ics).toContain("UID:anklam-252a00101-2@vhs-vg.de");
    expect(ics).toContain("UID:anklam-252a00102@vhs-vg.de");

    // URL included
    expect(ics).toContain("URL:https://www.vhs-vg.de/kurse/kurs/252A00101");
  });
});