import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import * as details from "@/clients/vhs-website/fetch-course-details";
import { GET } from "./route";

const createMockRequest = (url: string = "http://localhost:9200/api/courses/252P40405") => {
  return new NextRequest(url, {
    method: "GET",
  });
};

describe("/api/courses/[id]", () => {
  const mockDetails = {
    id: "252P40405",
    title: "telc-Prüfung Deutsch B2 (nur mit persönlicher Anmeldung)",
    description: "Wenn Sie Ihre Deutschkenntnisse auf dem Niveau B2 nachweisen müssen...",
    start: "2025-11-15T09:00:00.000Z",
    duration: "1 Termin",
    numberOfDates: 1,
    schedule: [
      {
        date: "2025-11-15",
        startTime: "2025-11-15T09:00:00.000Z",
        endTime: "2025-11-15T16:00:00.000Z",
        location: "VHS in Pasewalk",
        room: "Raum 302",
      },
    ],
    location: {
      name: "VHS in Pasewalk",
      room: "Raum 302",
      address: "Gemeindewiesenweg 8, 17309, Pasewalk",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(details, "fetchCourseDetails").mockResolvedValue(mockDetails as any);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return course details for a valid id", async () => {
    const response = await GET(createMockRequest());
    expect(response.status).toBe(200);

    const body = await response.json();
    expect(body).toHaveProperty("status");
    expect(body.status).toBe(200);
    expect(body).toHaveProperty("data");
    expect(body.data).toHaveProperty("id");
    expect(body.data.id).toBe("252P40405");

    const cc = response.headers.get("cache-control");
    expect(cc).toContain("max-age=86400");
  });

  it("should return 400 for invalid id format", async () => {
    const response = await GET(createMockRequest("http://localhost:9200/api/courses/invalid-id"));
    expect(response.status).toBe(400);
    const body = await response.json();
    expect(body).toMatchObject({
      status: 400,
    });
  });

  it("should return 404 when course not found", async () => {
    (details.fetchCourseDetails as any).mockRejectedValueOnce(new Error("HTTP 404 Not Found"));
    const response = await GET(createMockRequest());
    expect(response.status).toBe(404);
    const body = await response.json();
    expect(body).toMatchObject({
      status: 404,
    });
  });

  it("should return 408 on timeout", async () => {
    const err = new Error("Aborted");
    (err as any).name = "AbortError";
    (details.fetchCourseDetails as any).mockRejectedValueOnce(err);
    const response = await GET(createMockRequest());
    expect(response.status).toBe(408);
    const body = await response.json();
    expect(body).toMatchObject({
      status: 408,
    });
  });

  it("should return 500 on other errors", async () => {
    (details.fetchCourseDetails as any).mockRejectedValueOnce(new Error("Network error"));
    const response = await GET(createMockRequest());
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toMatchObject({
      status: 500,
      error: "Network error",
    });
  });
});