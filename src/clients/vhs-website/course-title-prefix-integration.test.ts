import { describe, it, expect } from "vitest";
import { generateCourseIcs } from "./generate-course-ics";
import { addCoursePrefix } from "./add-course-prefix";
import type { Course } from "./courses.schema";

describe("Course Title Prefix Integration", () => {
  it("should add prefix to course titles in ICS generation", () => {
    const courses: Course[] = [
      {
        id: "TEST001",
        title: "Excel Grundlagen",
        link: "https://example.com/course/TEST001",
        start: "2024-01-15T10:00:00.000Z",
        location: "VHS Greifswald",
        available: true,
        bookable: true,
        summary: "<div>Excel course for beginners</div>"
      },
      {
        id: "TEST002", 
        title: "Deutsch als Fremdsprache A1.1",
        link: "https://example.com/course/TEST002",
        start: "2024-01-16T14:00:00.000Z",
        location: "VHS Anklam",
        available: true,
        bookable: true,
        summary: "<div>German language course</div>"
      }
    ];

    const ics = generateCourseIcs("test", courses);
    
    // Verify both course titles have the prefix in ICS output
    expect(ics).toContain("SUMMARY:vhs Kurs: Excel Grundlagen");
    expect(ics).toContain("SUMMARY:vhs Kurs: Deutsch als Fremdsprache A1.1");
  });

  it("should handle courses that already have the prefix", () => {
    const courses: Course[] = [
      {
        id: "TEST003",
        title: addCoursePrefix("Yoga für Anfänger"),
        link: "https://example.com/course/TEST003",
        start: "2024-01-17T09:00:00.000Z",
        location: "VHS Pasewalk",
        available: true,
        bookable: true,
        summary: "<div>Beginner yoga course</div>"
      }
    ];

    const ics = generateCourseIcs("test", courses);
    
    // Should only have one prefix, not double prefix
    expect(ics).toContain("SUMMARY:vhs Kurs: Yoga für Anfänger");
    expect(ics).not.toContain("SUMMARY:vhs Kurs: vhs Kurs:");
  });

  it("should work with mixed prefix scenarios", () => {
    const courses: Course[] = [
      {
        id: "TEST004",
        title: "Computer Basics", // No prefix
        link: "https://example.com/course/TEST004",
        start: "2024-01-18T10:00:00.000Z",
        location: "VHS Greifswald",
        available: true,
        bookable: true
      },
      {
        id: "TEST005",
        title: "vhs Kurs: Advanced Programming", // Already has prefix
        link: "https://example.com/course/TEST005", 
        start: "2024-01-19T14:00:00.000Z",
        location: "VHS Anklam",
        available: true,
        bookable: true
      }
    ];

    const ics = generateCourseIcs("test", courses);
    
    // Both should have prefix, but no double prefix
    expect(ics).toContain("SUMMARY:vhs Kurs: Computer Basics");
    expect(ics).toContain("SUMMARY:vhs Kurs: Advanced Programming");
    expect(ics).not.toContain("SUMMARY:vhs Kurs: vhs Kurs:");
  });
});
