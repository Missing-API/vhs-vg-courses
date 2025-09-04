import { describe, it, expect } from "vitest";
import type { Course } from "./courses.schema";
import type { CourseDetails } from "./course-details.schema";

describe("End DateTime Integration", () => {
  it("should include end field in Course schema", () => {
    const course: Course = {
      id: "TEST123",
      title: "Test Course",
      link: "https://example.com/course/TEST123",
      start: "2024-01-15T10:00:00.000Z",
      end: "2024-01-15T12:30:00.000Z", // This should compile without errors
      location: "Test Location",
      available: true,
      bookable: true,
      summary: "<div>Test summary</div>"
    };

    expect(course.end).toBe("2024-01-15T12:30:00.000Z");
  });

  it("should include end field in CourseDetails schema", () => {
    const courseDetails: CourseDetails = {
      id: "TEST123",
      title: "Test Course",
      description: "<div>Test description</div>",
      start: "2024-01-15T10:00:00.000Z",
      end: "2024-01-15T12:30:00.000Z", // This should compile without errors
      duration: "2.5 hours",
      numberOfDates: 1,
      schedule: [{
        date: "2024-01-15",
        start: "2024-01-15T10:00:00.000Z",
        end: "2024-01-15T12:30:00.000Z",
        room: "Room A"
      }],
      location: {
        name: "Test Location",
        address: "Test Address"
      },
      summary: "<div>Test summary</div>"
    };

    expect(courseDetails.end).toBe("2024-01-15T12:30:00.000Z");
  });

  it("should handle optional end field", () => {
    const course: Course = {
      id: "TEST123",
      title: "Test Course",
      link: "https://example.com/course/TEST123",
      start: "2024-01-15T10:00:00.000Z",
      // end is optional and can be omitted
      location: "Test Location",
      available: true,
      bookable: true
    };

    expect(course.end).toBeUndefined();
  });
});
