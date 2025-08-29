import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getTypesenseHost, getTypesenseApiKey } from "./config";
import * as baseConfigModule from "../../helpers/config";
import { ClientTypesense } from "@/src/logging/loggerApps.config";

// Mock the base config functions
vi.mock("../../helpers/config", () => ({
  getApiHost: vi.fn(),
  getApiToken: vi.fn(),
}));

describe("Typesense Configuration Helpers", () => {
  const mockHost = "https://typesense.example.com";
  const mockToken = "ts-123456789";

  // Set up mocks before each test
  beforeEach(() => {
    // Reset mocks
    vi.resetAllMocks();

    // Set up mock implementations
    vi.mocked(baseConfigModule.getApiHost).mockReturnValue(mockHost);
    vi.mocked(baseConfigModule.getApiToken).mockReturnValue(mockToken);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("getTypesenseHost", () => {
    it("should call getApiHost with correct parameters", () => {
      const result = getTypesenseHost();

      expect(baseConfigModule.getApiHost).toHaveBeenCalledWith(
        "TYPESENSE_HOST",
        ClientTypesense.config
      );
      expect(result).toBe(mockHost);
    });

    it("should propagate errors from getApiHost", () => {
      const mockError = new Error("Host not configured");
      vi.mocked(baseConfigModule.getApiHost).mockImplementation(() => {
        throw mockError;
      });

      expect(() => getTypesenseHost()).toThrow(mockError);
    });
  });

  describe("getTypesenseApiKey", () => {
    it("should call getApiToken with correct parameters", () => {
      const result = getTypesenseApiKey();

      expect(baseConfigModule.getApiToken).toHaveBeenCalledWith(
        "TYPESENSE_TOKEN",
        ClientTypesense.config
      );
      expect(result).toBe(mockToken);
    });

    it("should propagate errors from getApiToken", () => {
      const mockError = new Error("Token not configured");
      vi.mocked(baseConfigModule.getApiToken).mockImplementation(() => {
        throw mockError;
      });

      expect(() => getTypesenseApiKey()).toThrow(mockError);
    });
  });
});
