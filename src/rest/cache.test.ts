import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { getCacheDurationSeconds, setCacheControlHeader } from "./cache";

describe("Cache utility", () => {
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

  describe("getCacheDurationSeconds", () => {
    it("should return default duration when env var is not set", () => {
      const duration = getCacheDurationSeconds();
      expect(duration).toBe(60 * 60 * 24); // 1 day in seconds
    });

    it("should return env var value when set to valid number", () => {
      process.env.HTTP_CACHE_DURATION_SECONDS = "3600";
      const duration = getCacheDurationSeconds();
      expect(duration).toBe(3600);
    });

    it("should return default duration when env var is invalid", () => {
      process.env.HTTP_CACHE_DURATION_SECONDS = "invalid";
      const duration = getCacheDurationSeconds();
      expect(duration).toBe(60 * 60 * 24);
    });

    it("should return default duration when env var is negative", () => {
      process.env.HTTP_CACHE_DURATION_SECONDS = "-100";
      const duration = getCacheDurationSeconds();
      expect(duration).toBe(60 * 60 * 24);
    });

    it("should return default duration when env var is zero", () => {
      process.env.HTTP_CACHE_DURATION_SECONDS = "0";
      const duration = getCacheDurationSeconds();
      expect(duration).toBe(60 * 60 * 24);
    });
  });

  describe("setCacheControlHeader", () => {
    it("should set cache control header with default duration", () => {
      const headers = new Headers();
      setCacheControlHeader(headers);
      
      expect(headers.get("Cache-Control")).toBe("public, max-age=86400, s-maxage=86400, stale-while-revalidate=300");
    });

    it("should set cache control header with custom duration", () => {
      const headers = new Headers();
      setCacheControlHeader(headers, 3600);
      
      expect(headers.get("Cache-Control")).toBe("public, max-age=3600, s-maxage=3600, stale-while-revalidate=12");
    });

    it("should use env var duration when available", () => {
      process.env.HTTP_CACHE_DURATION_SECONDS = "7200";
      const headers = new Headers();
      setCacheControlHeader(headers);
      
      expect(headers.get("Cache-Control")).toBe("public, max-age=7200, s-maxage=7200, stale-while-revalidate=25");
    });

    it("should override env var when custom duration provided", () => {
      process.env.HTTP_CACHE_DURATION_SECONDS = "7200";
      const headers = new Headers();
      setCacheControlHeader(headers, 1800);
      
      expect(headers.get("Cache-Control")).toBe("public, max-age=1800, s-maxage=1800, stale-while-revalidate=6");
    });

    it("should cap stale-while-revalidate at 300 seconds", () => {
      const headers = new Headers();
      setCacheControlHeader(headers, 604800); // 1 week
      
      expect(headers.get("Cache-Control")).toBe("public, max-age=604800, s-maxage=604800, stale-while-revalidate=300");
    });
  });
});
