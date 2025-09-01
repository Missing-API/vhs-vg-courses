import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import * as client from "@/clients/vhs-website/vhs-search.client";
import * as gen from "@/clients/vhs-website/generate-course-ics";
import { GET } from "./route";

const createMockRequest = (
  url: string = "http://localhost:9200/api/anklam/courses/ics"
) => {
  return new NextRequest(url, {
    method: "GET",
  });
};

describe("/api/[location]/courses/ics", () => {
  const mockLocations = {
    locations: [
      { id: "anklam", name: "Anklam", address: "Am Markt 1, 17389 Anklam" },
      {
        id: "greifswald",
        name: "Greifswald",
        address: "Nexö-Platz 1, 17489 Greifswald",
      },
    ],
  };

  const mockCourses = {
    courses: [
      {
        id: "252A00101",
        title: "Course 1",
        detailUrl: "https://www.vhs-vg.de/kurse/kurs/252A00101",
        start: "2025-09-01T10:00:00.000Z",
        locationText: "Ort A",
        available: true,
        bookable: true,
      },
      {
        id: "252A00102",
        title: "Course 2",
        detailUrl: "https://www.vhs-vg.de/kurse/kurs/252A00102",
        start: "2025-09-02T11:00:00.000Z",
        locationText: "Ort B",
        available: true,
        bookable: false,
      },
    ],
    count: 2,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(client, "getLocations").mockResolvedValue(mockLocations as any);
    vi.spyOn(client, "getCourses").mockResolvedValue(mockCourses as any);
    vi.spyOn(gen, "generateCourseIcs").mockResolvedValue("BEGIN:VCALENDAR\nEND:VCALENDAR");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return ICS for a valid location", async () => {
    const response = await GET(createMockRequest());
    expect(response.status).toBe(200);

    const text = await response.text();
    expect(text).toContain("BEGIN:VCALENDAR");

    expect(response.headers.get("content-type")).toContain("text/calendar");
    const cd = response.headers.get("content-disposition") || "";
    expect(cd).toContain("attachment");
    expect(cd).toContain("anklam-courses.ics");

    const cc = response.headers.get("cache-control") || "";
    expect(cc).toContain("max-age=900");
  });

  it("should respond 404 for unknown location", async () => {
    (client.getLocations as any).mockResolvedValueOnce({
      locations: [{ id: "greifswald", name: "Greifswald", address: "" }],
    });

    const response = await GET(
      createMockRequest("http://localhost:9200/api/anklam/courses/ics")
    );
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toMatchObject({
      status: 404,
    });
  });

  it("should handle getCourses errors with 500", async () => {
    (client.getCourses as any).mockRejectedValueOnce(new Error("Scrape failed"));
    const response = await GET(createMockRequest());
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toMatchObject({
      status: 500,
      error: "Scrape failed",
    });
  });
});