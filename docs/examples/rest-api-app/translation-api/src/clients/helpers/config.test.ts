import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getApiHost, getApiToken } from "./config";

describe("API Configuration Helpers", () => {
  const mockEnv = {
    TEST_API_HOST: "https://api.example.com",
    TEST_API_TOKEN: "test-token-123",
  };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...mockEnv };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getApiHost", () => {
    it("should return the host when properly configured", () => {
      expect(getApiHost("TEST_API_HOST")).toBe("https://api.example.com/");
    });

    it("should throw error when host is not configured", () => {
      delete process.env.TEST_API_HOST;
      expect(() => getApiHost("TEST_API_HOST")).toThrow(
        "TEST_API_HOST is not properly configured"
      );
    });

    it("should throw error when host is empty", () => {
      process.env.TEST_API_HOST = "";
      expect(() => getApiHost("TEST_API_HOST")).toThrow(
        "TEST_API_HOST is not properly configured"
      );
    });

    it("should throw error when host is invalid URL", () => {
      process.env.TEST_API_HOST = "invalid-url";
      expect(() => getApiHost("TEST_API_HOST")).toThrow();
    });
  });

  describe("getApiToken", () => {
    it("should return the token when properly configured", () => {
      expect(getApiToken("TEST_API_TOKEN")).toBe("test-token-123");
    });

    it("should throw error when token is not configured", () => {
      delete process.env.TEST_API_TOKEN;
      expect(() => getApiToken("TEST_API_TOKEN")).toThrow(
        "TEST_API_TOKEN is not properly configured"
      );
    });

    it("should throw error when token is empty", () => {
      process.env.TEST_API_TOKEN = "";
      expect(() => getApiToken("TEST_API_TOKEN")).toThrow(
        "TEST_API_TOKEN is not properly configured"
      );
    });
  });
});
