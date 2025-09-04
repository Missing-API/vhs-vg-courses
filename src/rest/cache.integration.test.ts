import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { setCacheControlHeader, getCacheDurationSeconds } from "@/rest/cache";

describe("Cache Configuration Integration", () => {
  const originalEnv = process.env.HTTP_CACHE_DURATION_SECONDS;

  beforeEach(() => {
    delete process.env.HTTP_CACHE_DURATION_SECONDS;
  });

  afterEach(() => {
    if (originalEnv !== undefined) {
      process.env.HTTP_CACHE_DURATION_SECONDS = originalEnv;
    } else {
      delete process.env.HTTP_CACHE_DURATION_SECONDS;
    }
  });

  it("should set cache headers correctly with default duration", () => {
    const headers = new Headers();
    setCacheControlHeader(headers);
    
    expect(headers.get("Cache-Control")).toBe("public, max-age=86400, s-maxage=86400, stale-while-revalidate=300");
    expect(getCacheDurationSeconds()).toBe(86400);
  });

  it("should respect environment variable configuration", () => {
    process.env.HTTP_CACHE_DURATION_SECONDS = "3600";
    
    const headers = new Headers();
    setCacheControlHeader(headers);
    
    expect(headers.get("Cache-Control")).toBe("public, max-age=3600, s-maxage=3600, stale-while-revalidate=12");
    expect(getCacheDurationSeconds()).toBe(3600);
  });

  it("should handle all API response scenarios", () => {
    // Test with different durations
    const testCases = [
      { envValue: "300", expected: "public, max-age=300, s-maxage=300, stale-while-revalidate=1" },    // 5 minutes
      { envValue: "3600", expected: "public, max-age=3600, s-maxage=3600, stale-while-revalidate=12" },  // 1 hour  
      { envValue: "86400", expected: "public, max-age=86400, s-maxage=86400, stale-while-revalidate=300" }, // 1 day
      { envValue: "604800", expected: "public, max-age=604800, s-maxage=604800, stale-while-revalidate=300" }, // 1 week
    ];

    testCases.forEach(({ envValue, expected }) => {
      process.env.HTTP_CACHE_DURATION_SECONDS = envValue;
      const headers = new Headers();
      setCacheControlHeader(headers);
      
      expect(headers.get("Cache-Control")).toBe(expected);
    });
  });

  it("should fall back to default when environment variable is invalid", () => {
    const invalidValues = ["", "invalid", "-100", "0", "abc"];
    
    invalidValues.forEach((invalidValue) => {
      process.env.HTTP_CACHE_DURATION_SECONDS = invalidValue;
      const headers = new Headers();
      setCacheControlHeader(headers);
      
      expect(headers.get("Cache-Control")).toBe("public, max-age=86400, s-maxage=86400, stale-while-revalidate=300");
    });
  });
});
