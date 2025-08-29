import { describe, it, expect } from "vitest";
import { NextRequest } from "next/server";
import { GET } from "./route";

const createMockRequest = (
  url: string = "http://localhost:9200/api/locations"
) => {
  return new NextRequest(url, {
    method: "GET",
  });
};

describe("/api/locations", () => {
  it("should return 200 with all 3 locations", async () => {
    const request = createMockRequest();

    const response = await GET(request);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(200);
    expect(response.headers.get("content-type")).toContain("application/json");

    const body = await response.json();

    expect(body).toHaveProperty("locations");
    expect(Array.isArray(body.locations)).toBe(true);
    expect(body.locations.length).toBe(3);

    const ids = body.locations.map((l: any) => l.id).sort();
    expect(ids).toEqual(["anklam", "greifswald", "pasewalk"].sort());
  });

  it("should have correct structure and data types", async () => {
    const response = await GET(createMockRequest());
    const body = await response.json();

    // top-level
    expect(typeof body.totalLocations).toBe("number");
    expect(typeof body.totalCourses).toBe("number");
    expect(typeof body.lastUpdated).toBe("string");

    // items
    body.locations.forEach((loc: any) => {
      expect(typeof loc.id).toBe("string");
      expect(typeof loc.name).toBe("string");
      expect(typeof loc.address).toBe("string");
      if (loc.email) expect(typeof loc.email).toBe("string");
    });
  });

  it("should include 1-day cache control header", async () => {
    const response = await GET(createMockRequest());
    const cache = response.headers.get("cache-control") || "";
    expect(cache).toContain("max-age=86400");
  });
});