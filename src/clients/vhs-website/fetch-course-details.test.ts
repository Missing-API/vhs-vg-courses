import { describe, expect, it } from "vitest";
import { fetchCourseDetails } from "./fetch-course-details";
import { extractJsonLd, findCourseJsonLd } from "./parse-json-ld";
import { parseGermanDate, parseScheduleEntry, parseTimeRange } from "./parse-course-dates";

// We will mock fetchWithTimeout to return fixture HTML
import * as fetchMod from "./fetch-with-timeout";

const htmlWithJsonLd = `
<html><head>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "telc-Pr\u00fcfung Deutsch B2 (nur mit pers\u00f6nlicher Anmeldung)",
  "hasCourseInstance": [{
    "@type": "CourseInstance",
    "startDate": "2025-11-15T09:00:00+01:00",
    "endDate": "2025-11-15T16:00:00+01:00",
    "location": {
      "name": "VHS in Pasewalk",
      "address": {
        "@type": "PostalAddress",
        "streetAddress": "Gemeindewiesenweg 8",
        "postalCode": "17309",
        "addressLocality": "Pasewalk"
      }
    }
  }]
}
</script>
</head>
<body>
<h1>telc-Prüfung Deutsch B2 (nur mit persönlicher Anmeldung)</h1>
<div class="hauptseite_ohnestatus">
  <p>Wenn Sie Ihre Deutschkenntnisse auf dem Niveau B2 nachweisen müssen...</p>
  <dl>
    <dt>Beginn:</dt><dd>Sa., 15.11.2025, um 09:00 Uhr</dd>
    <dt>Dauer:</dt><dd>1 Termin</dd>
    <dt>Termine:</dt><dd>1</dd>
  </dl>
  <ul class="termine">
    <li>Samstag • 15.11.2025 • 09:00 - 16:00 Uhr • VHS in Pasewalk • Raum 302</li>
  </ul>
</div>
</body></html>
`;

const htmlWithoutJsonLd = `
<html><head><title>Anderer Kurs</title></head>
<body>
<h1>Excel Grundlagen</h1>
<div class="course-detail">
<p>Einführung in Excel.</p>
<p>Sie lernen Formeln, Funktionen und Diagramme.</p>
<dl>
  <dt>Beginn:</dt><dd>Montag, 10.11.2025, um 17:00 Uhr</dd>
  <dt>Dauer:</dt><dd>5 Termine</dd>
  <dt>Termine:</dt><dd>5</dd>
</dl>
<ul class="course-dates">
  <li>Montag • 10.11.2025 • 17:00 - 20:15 Uhr • VHS in Greifswald • Raum 12</li>
  <li>Mittwoch • 12.11.2025 • 17:00 - 20:15 Uhr • VHS in Greifswald • Raum 12</li>
</ul>
</div>
</body></html>
`;

describe("parse-json-ld helpers", () => {
  it("extracts and finds course JSON-LD", () => {
    const blocks = extractJsonLd(htmlWithJsonLd);
    expect(blocks.length).greaterThan(0);
    const course = findCourseJsonLd(htmlWithJsonLd);
    expect(course?.name).toContain("telc-Pr");
  });
});

describe("date parsing utilities", () => {
  it("parses German date", () => {
    const d = parseGermanDate("Sa., 15.11.2025, um 09:00 Uhr");
    expect(d.getFullYear()).toBe(2025);
    expect(d.getMonth()).toBe(10);
    expect(d.getDate()).toBe(15);
  });

  it("parses time range", () => {
    const r = parseTimeRange("09:00 - 16:00 Uhr");
    expect(r.start.h).toBe(9);
    expect(r.end.h).toBe(16);
  });

  it("parses schedule entry", () => {
    const s = parseScheduleEntry("Montag • 10.11.2025 • 17:00 - 20:15 Uhr • VHS in Pasewalk • Raum 302");
    expect(s.location).toContain("VHS");
    expect(s.room).toContain("Raum");
  });
});

describe("fetchCourseDetails", () => {
  it("parses course with JSON-LD", async () => {
    vi.spyOn(fetchMod, "fetchWithTimeout").mockResolvedValue({
      ok: true,
      text: async () => htmlWithJsonLd,
    } as any);

    const details = await fetchCourseDetails("252P40405");
    expect(details.id).toBe("252P40405");
    expect(details.title).toContain("telc");
    expect(details.location.name).toContain("VHS");
    expect(details.schedule.length).toBeGreaterThan(0);
  });

  it("parses course without JSON-LD", async () => {
    vi.spyOn(fetchMod, "fetchWithTimeout").mockResolvedValue({
      ok: true,
      text: async () => htmlWithoutJsonLd,
    } as any);

    const details = await fetchCourseDetails("252A21003");
    expect(details.title).toContain("Excel");
    expect(details.numberOfDates).toBe(5);
    expect(details.schedule.length).toBe(2);
  });

  it("handles HTTP error", async () => {
    vi.spyOn(fetchMod, "fetchWithTimeout").mockImplementation(async () => {
      const err: any = new Error("HTTP 404 Not Found");
      err.ok = false;
      throw err;
    });
    await expect(fetchCourseDetails("252A99999")).rejects.toBeTruthy();
  });
});