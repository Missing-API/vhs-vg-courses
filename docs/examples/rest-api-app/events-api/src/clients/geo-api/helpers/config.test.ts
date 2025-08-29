import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getGeoApiHost, getGeoApiToken } from "./config";

describe("Geo API Config", () => {
  const mockEnv = {
    SVF_GEOAPI_URL: "https://geo-api.example.com",
    SVF_GEOAPI_TOKEN: "test-token-123",
  };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...mockEnv };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getGeoApiHost", () => {
    it("should return the host when properly configured", () => {
      expect(getGeoApiHost()).toBe("https://geo-api.example.com/");
    });

    it("should throw error when host is not configured", () => {
      delete process.env.SVF_GEOAPI_URL;
      expect(() => getGeoApiHost()).toThrow(
        "SVF_GEOAPI_URL is not properly configured"
      );
    });

    it("should throw error when host is invalid URL", () => {
      process.env.SVF_GEOAPI_URL = "invalid-url";
      expect(() => getGeoApiHost()).toThrow();
    });
  });

  describe("getGeoApiToken", () => {
    it("should return the token when properly configured", () => {
      expect(getGeoApiToken()).toBe("test-token-123");
    });

    it("should throw error when token is not configured", () => {
      delete process.env.SVF_GEOAPI_TOKEN;
      expect(() => getGeoApiToken()).toThrow(
        "SVF_GEOAPI_TOKEN is not properly configured"
      );
    });
  });
});
