import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getClassificationApiConfig,
  getClassificationApiHost,
  getClassificationApiToken,
} from "./config";

describe("Classification API Config", () => {
  const mockEnv = {
    SVF_CLASSIFICATIONAPI_HOST: "https://classification-api.example.com",
    SVF_CLASSIFICATIONAPI_TOKEN: "test-token-123",
  };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...mockEnv };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getClassificationApiHost", () => {
    it("should return the host when properly configured", () => {
      expect(getClassificationApiHost()).toBe(
        "https://classification-api.example.com/"
      );
    });

    it("should throw error when host is not configured", () => {
      delete process.env.SVF_CLASSIFICATIONAPI_HOST;
      expect(() => getClassificationApiHost()).toThrow(
        "SVF_CLASSIFICATIONAPI_HOST is not properly configured"
      );
    });

    it("should throw error when host is invalid URL", () => {
      process.env.SVF_CLASSIFICATIONAPI_HOST = "invalid-url";
      expect(() => getClassificationApiHost()).toThrow();
    });
  });

  describe("getClassificationApiToken", () => {
    it("should return the token when properly configured", () => {
      expect(getClassificationApiToken()).toBe("test-token-123");
    });

    it("should throw error when token is not configured", () => {
      delete process.env.SVF_CLASSIFICATIONAPI_TOKEN;
      expect(() => getClassificationApiToken()).toThrow(
        "SVF_CLASSIFICATIONAPI_TOKEN is not properly configured"
      );
    });
  });

  describe("getClassificationApiConfig", () => {
    it("should return both host and token when properly configured", () => {
      expect(getClassificationApiConfig()).toEqual({
        host: "https://classification-api.example.com/",
        token: "test-token-123",
      });
    });

    it("should throw error when either config is missing", () => {
      delete process.env.SVF_CLASSIFICATIONAPI_HOST;
      expect(() => getClassificationApiConfig()).toThrow();
    });
  });
});
