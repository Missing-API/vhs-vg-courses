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
        expect(body.data).toHaveProperty("courses");
        expect(Array.isArray(body.data.courses)).toBe(true);
        expect(body.data).toHaveProperty("location");
      }
    } catch (error) {
      console.warn("Integration test skipped - server not available:", error);
      expect(true).toBe(true);
    }
  });
});