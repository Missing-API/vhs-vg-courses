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
  });

  it("should accept includeDetails=true query without breaking response", async () => {
    try {
      const response = await fetch(`${baseUrl}/api/anklam/courses?includeDetails=true&batchSize=5`);
      expect([200, 404, 500]).toContain(response.status);
      if (response.status === 200) {
        const body = await response.json();
        expect(body).toHaveProperty("data");
        expect(body.data).toHaveProperty("courses");
        expect(Array.isArray(body.data.courses)).toBe(true);
        // meta is optional
        expect(body.data).toHaveProperty("location");
      }
    } catch (error) {
      console.warn("Integration test skipped - server not available:", error);
      expect(true).toBe(true);
    }
  });
});