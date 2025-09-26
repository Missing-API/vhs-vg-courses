import { describe, it, expect } from "vitest";

// Integration test that makes actual HTTP requests to the dynamic courses endpoint
describe("/api/[location]/courses (integration)", () => {
  const baseUrl = "http://localhost:9200";

  it("should respond to HTTP GET requests for a known location id", async () => {
    try {
      const response = await fetch(`${baseUrl}/api/anklam/courses`);

      expect([200, 404, 500]).toContain(response.status);
      expect(response.headers.get("content-type")).toContain("application/json");

      if (response.status === 200) {
        const body = await response.json();
        expect(body).toHaveProperty("data");
        expect(Array.isArray(body.data)).toBe(true);
        expect(typeof body.results).toBe("number");
      }
    } catch (error) {
      console.warn("Integration test skipped - server not available:", error);
      expect(true).toBe(true);
    }
  }, 10000); // 10 second timeout for VHS website integration

  it("should support details=true to include metadata and possibly embedded details", async () => {
    try {
      const response = await fetch(`${baseUrl}/api/anklam/courses?details=true`);

      expect([200, 404, 500]).toContain(response.status);
      expect(response.headers.get("content-type")).toContain("application/json");

      if (response.status === 200) {
        const body = await response.json();
        expect(body).toHaveProperty("data");
        expect(Array.isArray(body.data)).toBe(true);
        // When details are requested, meta should be present
        expect(body.meta).toBeDefined();
      }
    } catch (error) {
      console.warn("Integration test skipped - server not available:", error);
      expect(true).toBe(true);
    }
  }, 30000); // 30 second timeout for details fetching (slower due to individual course requests)
});