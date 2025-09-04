import { describe, it, expect } from "vitest";
import { generateCourseIcs } from "./generate-course-ics";
import type { Course } from "./courses.schema";

describe("ICS Generation with End DateTime", () => {
  it("should include DTEND in ICS when end datetime is available", () => {
    const courses: Course[] = [
      {
        id: "TEST123",
        title: "Test Course with End Time",
        link: "https://example.com/course/TEST123",
        start: "2024-01-15T10:00:00.000Z",
        end: "2024-01-15T12:30:00.000Z",
        location: "Test Location, Test Address",
        available: true,
        bookable: true,
        summary: "<div>Test course with proper duration</div>"
      }
    ];

    const ics = generateCourseIcs("test", courses);

    // Verify the ICS contains both DTSTART and DTEND
    expect(ics).toContain("DTSTART");
    expect(ics).toContain("DTEND");
    expect(ics).toContain("SUMMARY:vhs Kurs: Test Course with End Time");
  });

  it("should handle courses without end datetime gracefully", () => {
    const courses: Course[] = [
      {
        id: "TEST124",
        title: "Test Course without End Time",
        link: "https://example.com/course/TEST124",
        start: "2024-01-15T10:00:00.000Z",
        // no end datetime
        location: "Test Location, Test Address",
        available: true,
        bookable: true,
        summary: "<div>Test course without duration</div>"
      }
    ];

    const ics = generateCourseIcs("test", courses);

    // Should contain DTSTART but not DTEND
    expect(ics).toContain("DTSTART");
    expect(ics).toContain("SUMMARY:vhs Kurs: Test Course without End Time");
    
    // Should not contain DTEND when end is not available
    expect(ics).not.toMatch(/DTEND[^:]*:20240115T/);
  });

  it("should handle multiple courses with mixed end datetime availability", () => {
    const courses: Course[] = [
      {
        id: "TEST123",
        title: "Course with End",
        link: "https://example.com/course/TEST123",
        start: "2024-01-15T10:00:00.000Z",
        end: "2024-01-15T12:30:00.000Z",
        location: "Test Location",
        available: true,
        bookable: true
      },
      {
        id: "TEST124", 
        title: "Course without End",
        link: "https://example.com/course/TEST124",
        start: "2024-01-16T14:00:00.000Z",
        location: "Test Location",
        available: true,
        bookable: true
      }
    ];

    const ics = generateCourseIcs("test", courses);

    // Should contain both courses
    expect(ics).toContain("Course with End");
    expect(ics).toContain("Course without End");
    
    // First course should have DTEND, but we can't easily check which DTEND belongs to which event
    // in a simple string match, so we just verify DTEND exists
    expect(ics).toContain("DTEND");
  });
});
