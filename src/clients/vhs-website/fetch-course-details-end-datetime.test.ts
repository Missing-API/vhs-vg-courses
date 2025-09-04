import { describe, it, expect } from "vitest";
import { fetchCourseDetails } from "./fetch-course-details";
import { vi } from "vitest";

// Mock dependencies
vi.mock("./fetch-with-timeout");
vi.mock("./parse-json-ld");
vi.mock("./parse-course-dates");
vi.mock("./optimize-location-address");

describe("fetchCourseDetails - end datetime calculation", () => {
  it("should calculate end datetime from schedule duration", async () => {
    const mockHtml = `
      <h1>Test Course</h1>
      <div class="kw-kurs-info-text">Course description</div>
      <table id="kw-kurstage">
        <tr><td>15.01.2024 • 10:00-12:30 • Room A</td></tr>
      </table>
    `;

    // Mock fetch response
    const { fetchWithTimeout } = await import("./fetch-with-timeout");
    vi.mocked(fetchWithTimeout).mockResolvedValue({
      text: async () => mockHtml,
    } as any);

    // Mock parseScheduleEntry to return proper schedule
    const { parseScheduleEntry } = await import("./parse-course-dates");
    vi.mocked(parseScheduleEntry).mockReturnValue({
      date: "2024-01-15",
      start: "2024-01-15T10:00:00.000Z",
      end: "2024-01-15T12:30:00.000Z",
      room: "Room A"
    });

    // Mock other dependencies
    const { findCourseJsonLd } = await import("./parse-json-ld");
    vi.mocked(findCourseJsonLd).mockReturnValue(undefined);

    const { optimizeLocationAddress } = await import("./optimize-location-address");
    vi.mocked(optimizeLocationAddress).mockImplementation((addr) => addr);

    const result = await fetchCourseDetails("TEST123");

    expect(result.start).toBe("2024-01-15T10:00:00.000Z");
    expect(result.end).toBe("2024-01-15T12:30:00.000Z");
    
    // Verify duration calculation
    const startTime = new Date(result.start).getTime();
    const endTime = new Date(result.end!).getTime();
    const durationHours = (endTime - startTime) / (1000 * 60 * 60);
    expect(durationHours).toBe(2.5);
  });

  it("should handle missing schedule gracefully", async () => {
    const mockHtml = `
      <h1>Test Course</h1>
      <div class="kw-kurs-info-text">Course description</div>
    `;

    const { fetchWithTimeout } = await import("./fetch-with-timeout");
    vi.mocked(fetchWithTimeout).mockResolvedValue({
      text: async () => mockHtml,
    } as any);

    const { findCourseJsonLd } = await import("./parse-json-ld");
    vi.mocked(findCourseJsonLd).mockReturnValue(undefined);

    const { optimizeLocationAddress } = await import("./optimize-location-address");
    vi.mocked(optimizeLocationAddress).mockImplementation((addr) => addr);

    const result = await fetchCourseDetails("TEST123");

    expect(result.end).toBeUndefined();
  });

  it("should handle invalid schedule times gracefully", async () => {
    const mockHtml = `
      <h1>Test Course</h1>
      <div class="kw-kurs-info-text">Course description</div>
      <table id="kw-kurstage">
        <tr><td>Invalid date format</td></tr>
      </table>
    `;

    const { fetchWithTimeout } = await import("./fetch-with-timeout");
    vi.mocked(fetchWithTimeout).mockResolvedValue({
      text: async () => mockHtml,
    } as any);

    const { parseScheduleEntry } = await import("./parse-course-dates");
    vi.mocked(parseScheduleEntry).mockReturnValue({
      date: "2024-01-15",
      start: "invalid-date",
      end: "invalid-date",
      room: "Room A"
    });

    const { findCourseJsonLd } = await import("./parse-json-ld");
    vi.mocked(findCourseJsonLd).mockReturnValue(undefined);

    const { optimizeLocationAddress } = await import("./optimize-location-address");
    vi.mocked(optimizeLocationAddress).mockImplementation((addr) => addr);

    const result = await fetchCourseDetails("TEST123");

    expect(result.end).toBeUndefined();
  });
});
