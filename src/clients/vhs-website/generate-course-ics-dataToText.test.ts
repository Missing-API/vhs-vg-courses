import { describe, it, expect } from "vitest";
import { generateCourseIcs } from "@/clients/vhs-website/generate-course-ics";
import type { Course } from "@/clients/vhs-website/courses.schema";

describe("generateCourseIcs with simplified dataToText", () => {
  it("should generate ICS with properly formatted plain text description using course URL", () => {
    const mockCourse: Course = {
      id: "252A40609",
      title: "Test Course",
      link: "https://www.vhs-vg.de/kurse/kurs/252A40609",
      start: "2025-09-08T15:00:00.000Z",
      end: "2025-09-08T17:00:00.000Z",
      location: "VHS Greifswald",
      available: true,
      bookable: true,
      // Now using structured data instead of HTML summary
      description: "Dieser Kurs eignet sich für Interessierte mit guten Vorkenntnissen, die ihre Kompetenzen im beruflichen Kontext erweitern möchten. Der Kurs beginnt am Mo., 08.09.2025, um 17:00 Uhr und hat 10 Termine.",
      url: "https://www.vhs-vg.de/kurse/kurs/252A40609",
      tags: ["Bildung", "Volkshochschule"],
      scopes: ["Region"],
      summary: `<div>
  <p class="description">Dieser Kurs eignet sich für Interessierte mit guten Vorkenntnissen, die ihre Kompetenzen im beruflichen Kontext erweitern möchten.</p>
  <p>Der Kurs beginnt am Mo., 08.09.2025, um 17:00 Uhr und hat 10 Termine.</p>
  <p class="link"><a href="https://www.vhs-vg.de/kurse/kurs/252A40609">alle Kursinfos</a></p>
  <p class="taxonomy">
    <span class="tag">#Bildung</span> 
    <span class="tag">#Volkshochschule</span> 
    <span class="scope">@Region</span>
  </p>
</div>`
    };

    const ics = generateCourseIcs("greifswald", [mockCourse]);
    
    // Should contain the course
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
    
    // Should include both plain text description and HTML description
    expect(ics).toContain("DESCRIPTION:");
    expect(ics).toContain("X-ALT-DESC;FMTTYPE=text/html:");
    
    // The plain text description should contain the URL from the course schema, not parsed from HTML
    expect(ics).toContain("https://www.vhs-vg.de/kurse/kurs/252A40609");
    
    // Should contain tags and scopes in plain text format (either parsed or default)
    expect(ics).toContain("#Bildung");
    expect(ics).toContain("#Volkshochschule");
    expect(ics).toContain("@Region");
    
    // Should have the course description in plain text - let's check that it's not HTML
    const descriptionMatch = ics.match(/DESCRIPTION:([\s\S]*?)(?:\r?\n[A-Z])/);
    if (descriptionMatch) {
      const description = descriptionMatch[1];
      // Should not contain HTML tags in the description field
      expect(description).not.toContain("<div>");
      expect(description).not.toContain("<p>");
      // Should contain the plain text
      expect(description).toContain("Dieser Kurs eignet sich für Interessierte");
    } else {
      throw new Error("Could not find DESCRIPTION field in ICS output");
    }
  });

  it("should use fallback formatting when HTML parsing fails", () => {
    const mockCourse: Course = {
      id: "252A40610",
      title: "Simple Course",
      link: "https://www.vhs-vg.de/kurse/kurs/252A40610",
      start: "2025-09-08T15:00:00.000Z",
      location: "VHS Greifswald",
      available: true,
      bookable: true,
      summary: "Just plain text with some <em>simple</em> HTML"
    };

    const ics = generateCourseIcs("greifswald", [mockCourse]);
    
    // Should still generate valid ICS
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("SUMMARY:vhs Kurs: Simple Course");
    
    // Should include the course URL
    expect(ics).toContain("https://www.vhs-vg.de/kurse/kurs/252A40610");
    
    // Should include default tags
    expect(ics).toContain("#Bildung");
    expect(ics).toContain("#Volkshochschule");
    expect(ics).toContain("@Region");
  });

  it("should handle empty summary gracefully", () => {
    const mockCourse: Course = {
      id: "252A40611",
      title: "Minimal Course",
      link: "https://www.vhs-vg.de/kurse/kurs/252A40611",
      start: "2025-09-08T15:00:00.000Z",
      location: "VHS Greifswald",
      available: true,
      bookable: true
      // no summary
    };

    const ics = generateCourseIcs("greifswald", [mockCourse]);
    
    // Should still generate valid ICS
    expect(ics).toContain("BEGIN:VEVENT");
    expect(ics).toContain("END:VEVENT");
    expect(ics).toContain("SUMMARY:vhs Kurs: Minimal Course");
  });
});
