import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { NextRequest } from "next/server";
import * as client from "@/clients/vhs-website/vhs-search.client";
import { GET } from "./route";

const createMockRequest = (url: string = "http://localhost:9200/api/locations") => {
  return new NextRequest(url, {
    method: "GET",
  });
};

describe("/api/locations", () => {
  const mockLocations = {
    locations: [
      { id: "anklam", name: "Anklam", address: "Am Markt 1, 17389 Anklam" },
      { id: "greifswald", name: "Greifswald", address: "Nexö-Platz 1, 17489 Greifswald" },
      { id: "pasewalk", name: "Pasewalk", address: "Am Markt 5, 17309 Pasewalk" },
    ],
  };

  beforeEach(() => {
    vi.spyOn(client, "getLocations").mockResolvedValue(mockLocations);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should return a successful response with all 3 locations", async () => {
    const response = await GET(createMockRequest());
    expect(response.status).toBe(200);
    const body = await response.json();

    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("data");
    expect(body).toHaveProperty("results");
    expect(body.status).toBe(200);
    expect(body.results).toBe(3);
    expect(Array.isArray(body.data)).toBe(true);
    expect(body.data.length).toBe(3);

    const ids = body.data.map((l: any) => l.id).sort();
    expect(ids).toEqual(["anklam", "greifswald", "pasewalk"].sort());
  });

  it("should return correct structure and data validation", async () => {
    const response = await GET(createMockRequest());
    const body = await response.json();

    expect(body).toHaveProperty("status");
    expect(body).toHaveProperty("timestamp");
    expect(body).toHaveProperty("results");
    expect(typeof body.results).toBe("number");
    expect(body).toHaveProperty("data");
    expect(Array.isArray(body.data)).toBe(true);
    body.data.forEach((loc: any) => {
      expect(loc).toHaveProperty("id");
      expect(loc).toHaveProperty("name");
      expect(typeof loc.id).toBe("string");
      expect(typeof loc.name).toBe("string");
    });

    // ISO date string
    expect(new Date(body.timestamp).toString()).not.toBe("Invalid Date");
  });

  it("should set 1-day cache control header", async () => {
    const response = await GET(createMockRequest());
    const cc = response.headers.get("cache-control");
    expect(cc).toContain("max-age=86400");
  });

  it("should handle errors with 500 status", async () => {
    vi.spyOn(client, "getLocations").mockRejectedValueOnce(new Error("Network error"));
    const response = await GET(createMockRequest());
    expect(response.status).toBe(500);
    const body = await response.json();
    expect(body).toMatchObject({
      status: 500,
      error: "Network error",
    });
  });
});