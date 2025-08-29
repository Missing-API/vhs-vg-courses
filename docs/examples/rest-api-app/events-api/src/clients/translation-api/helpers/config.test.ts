import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import {
  getTranslationApiConfig,
  getTranslationApiHost,
  getTranslationApiToken,
} from "./config";

describe("Translation API Config", () => {
  const mockEnv = {
    SVF_TRANSLATIONAPI_HOST: "https://translation-api.example.com",
    SVF_TRANSLATIONAPI_TOKEN: "test-token-123",
  };

  beforeEach(() => {
    vi.resetModules();
    process.env = { ...mockEnv };
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("getTranslationApiHost", () => {
    it("should return the host when properly configured", () => {
      expect(getTranslationApiHost()).toBe(
        "https://translation-api.example.com/"
      );
    });

    it("should throw error when host is not configured", () => {
      delete process.env.SVF_TRANSLATIONAPI_HOST;
      expect(() => getTranslationApiHost()).toThrow(
        "SVF_TRANSLATIONAPI_HOST is not properly configured"
      );
    });

    it("should throw error when host is invalid URL", () => {
      process.env.SVF_TRANSLATIONAPI_HOST = "invalid-url";
      expect(() => getTranslationApiHost()).toThrow();
    });
  });

  describe("getTranslationApiToken", () => {
    it("should return the token when properly configured", () => {
      expect(getTranslationApiToken()).toBe("test-token-123");
    });

    it("should throw error when token is not configured", () => {
      delete process.env.SVF_TRANSLATIONAPI_TOKEN;
      expect(() => getTranslationApiToken()).toThrow(
        "SVF_TRANSLATIONAPI_TOKEN is not properly configured"
      );
    });
  });

  describe("getTranslationApiConfig", () => {
    it("should return both host and token when properly configured", () => {
      expect(getTranslationApiConfig()).toEqual({
        host: "https://translation-api.example.com/",
        token: "test-token-123",
      });
    });

    it("should throw error when either config is missing", () => {
      delete process.env.SVF_TRANSLATIONAPI_HOST;
      expect(() => getTranslationApiConfig()).toThrow();
    });
  });
});
