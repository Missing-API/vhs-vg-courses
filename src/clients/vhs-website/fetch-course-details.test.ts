import { describe, expect, it, vi } from "vitest";
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
  <!-- Sidebar lists should be ignored -->
  <ul class="termine">
    <li>Samstag • 15.11.2025 • 09:00 - 16:00 Uhr • VHS in Pasewalk • Raum 302</li>
  </ul>
  <!-- Official schedule table -->
  <table id="kw-kurstage">
    <thead>
      <tr><th>Datum</th><th>Uhrzeit</th><th>Ort</th><th>Raum</th></tr>
    </thead>
    <tbody>
      <tr>
        <td>15.11.2025</td>
        <td>09:00 - 16:00 Uhr</td>
        <td>VHS in Pasewalk</td>
        <td>Raum 302</td>
      </tr>
    </tbody>
  </table>
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
<!-- Sidebar list should be ignored -->
<ul class="course-dates">
  <li>Montag • 10.11.2025 • 17:00 - 20:15 Uhr • VHS in Greifswald • Raum 12</li>
  <li>Mittwoch • 12.11.2025 • 17:00 - 20:15 Uhr • VHS in Greifswald • Raum 12</li>
</ul>
<!-- Official schedule table -->
<table id="kw-kurstage">
  <thead>
    <tr><th>Datum</th><th>Uhrzeit</th><th>Ort</th><th>Raum</th></tr>
  </thead>
  <tbody>
    <tr>
      <td>10.11.2025</td>
      <td>17:00 - 20:15 Uhr</td>
      <td>VHS in Greifswald</td>
      <td>Raum 12</td>
    </tr>
    <tr>
      <td>12.11.2025</td>
      <td>17:00 - 20:15 Uhr</td>
      <td>VHS in Greifswald</td>
      <td>Raum 12</td>
    </tr>
  </tbody>
</table>
</div>
</body></html>
`;

// Case where JSON-LD has date only, but label/schedule include time
const htmlJsonLdDateOnlyWithLabelTime = `
<html><head>
<script type="application/ld+json">
{
  "@context": "https://schema.org",
  "@type": "Course",
  "name": "Hatha Yoga - zertifizierter Kurs*",
  "hasCourseInstance": {
    "@type": "CourseInstance",
    "startDate": "2025-09-08",
    "endDate": "2025-11-24",
    "location": {
      "@type": "Place",
      "name": "Torgelow, Haus an der Schleuse, Schleusenstraße 5B",
      "address": {
        "@type": "PostalAddress",
        "addressLocality": "Torgelow",
        "postalCode": "17358",
        "streetAddress": "Schleusenstraße 5B"
      }
    }
  }
}
</script>
</head>
<body>
<h1>Hatha Yoga - zertifizierter Kurs*</h1>
<div class="kw-kurs-info-text"><p>Beschreibung</p></div>
<table id="kw-kurstage">
  <tbody>
    <tr>
      <td>Montag • 08.09.2025 • 16:00 - 17:30 Uhr</td>
      <td>Torgelow, Haus an der Schleuse</td>
    </tr>
  </tbody>
</table>
<dl>
  <dt>Beginn</dt>
  <dd><abbr title="Montag">Mo.</abbr>, 08.09.2025, <br> um 16:00 Uhr</dd>
</dl>
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
    // Note: room is no longer included in CourseSession
    expect(s.date).toBe("2025-11-10");
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
    // Note: summary is no longer part of CourseDetails schema
    expect(details.description).toContain('Der Kurs beginnt am');
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
    // Note: summary is no longer part of CourseDetails schema
    expect(details.description).toContain('Der Kurs beginnt am');
  });

  it("prefers schedule/label time over date-only JSON-LD", async () => {
    vi.spyOn(fetchMod, "fetchWithTimeout").mockResolvedValue({
      ok: true,
      text: async () => htmlJsonLdDateOnlyWithLabelTime,
    } as any);

    const details = await fetchCourseDetails("252P30120");
    // Start should reflect 16:00 local (CEST -> 14:00Z)
    expect(details.start).toBe("2025-09-08T14:00:00.000Z");
  });

  it("extracts and sanitizes description from kw-kurs-info-text", async () => {
    const html = `
    <html><body>
      <h1>ABC</h1>
      <div class="kw-kurs-info-text">
        <p style="color:red">Hallo <strong>Welt</strong> & Co.</p>
        <p><br></p>
        <div>Weitere Infos<span style="display:none">x</span></div>
        <ul><li>Punkt 1</li><li>Punkt 2</li></ul>
      </div>
      <dl>
        <dt>Beginn:</dt><dd>Sa., 15.11.2025, um 09:00 Uhr</dd>
        <dt>Dauer:</dt><dd>1 Termin</dd>
      </dl>
      <table id="kw-kurstage"><tbody><tr><td>15.11.2025</td><td>09:00 - 12:00 Uhr</td><td>VHS</td><td>Raum</td></tr></tbody></table>
    </body></html>`;
    vi.spyOn(fetchMod, "fetchWithTimeout").mockResolvedValue({
      ok: true,
      text: async () => html,
    } as any);

    const details = await fetchCourseDetails("252B00001");
    expect(details.description).toMatch(/^Hallo Welt & Co\.\s+Weitere Infos\s+Punkt 1\s+Punkt 2/);
    expect(details.description).toContain("Der Kurs beginnt am Sa., 15.11.2025, um 09:00 Uhr und hat 1 Termin.");
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