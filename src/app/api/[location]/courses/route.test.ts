import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import * as client from "@/clients/vhs-website/vhs-search.client";
import { GET } from "./route";

const createMockRequest = (
  url: string = "http://localhost:9200/api/anklam/courses"
) => {
  return new NextRequest(url, {
    method: "GET",
  });
};

describe("/api/[location]/courses", () => {
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
        id: "252A001",
        title: "Course 1",
        detailUrl: "https://www.vhs-vg.de/kurse/kurs/course-1/252A001",
        start: "2025-09-01T10:00:00.000Z",
        locationText: "Ort A",
        available: true,
        bookable: true,
      },
      {
        id: "252A002",
        title: "Course 2",
        detailUrl: "https://www.vhs-vg.de/kurse/kurs/course-2/252A002",
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
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return courses for a valid location", async () => {
    const response = await GET(createMockRequest());
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body.status).toBe(200);
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("results");
    expect(body.results).toBe(2);
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(2);

    const cc = response.headers.get("cache-control");
    expect(cc).toContain("max-age=900");
  });

  it("should respond 404 for unknown location", async () => {
    (client.getLocations as any).mockResolvedValueOnce({
      locations: [{ id: "greifswald", name: "Greifswald", address: "" }],
    });

    const response = await GET(
      createMockRequest("http://localhost:9200/api/anklam/courses")
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