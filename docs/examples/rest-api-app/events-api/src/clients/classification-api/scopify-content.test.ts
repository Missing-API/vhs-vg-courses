import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { scopifyContent } from "./scopify-content";
import {
  FallbackScopification,
  ScopifyContentQuery,
} from "./scopify-content.types";
import { getClassificationApiConfig } from "./helpers/config";

// Mock the config helper
vi.mock("./helpers/config");
const mockGetClassificationApiConfig = vi.mocked(getClassificationApiConfig);

// Mock the logger
vi.mock("../../logging/logger", () => ({
  getLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("scopifyContent", () => {
  const mockConfig = {
    host: "https://classify.api.schafe-vorm-fenster.de/",
    token: "test-token-123",
  };

  const validQuery = {
    category: "event",
    tags: ["music", "concert"],
    timespan: "2hours",
    occurrence: "once" as const,
  };

  beforeEach(() => {
    vi.clearAllMocks();
    mockGetClassificationApiConfig.mockReturnValue(mockConfig);
  });

  afterEach(() => {
    vi.resetAllMocks();
  });

  describe("successful API responses", () => {
    it("should return the scope value from a valid API response", async () => {
      const mockResponse = {
        status: 200,
        timestamp: "2025-06-16T10:12:49.347Z",
        data: {
          scope: "region",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map([["content-type", "application/json"]]),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await scopifyContent(validQuery);

      expect(result).toBe("region");
      expect(mockFetch).toHaveBeenCalledWith(
        new URL("/api/scopify", mockConfig.host),
        {
          method: "POST",
          headers: {
            "Sheep-Token": mockConfig.token,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
          body: JSON.stringify(validQuery),
        }
      );
    });

    it("should handle all valid scope values", async () => {
      const validScopes = [
        "community",
        "municipality",
        "county",
        "state",
        "country",
        "nearby",
        "region",
      ];

      for (const scope of validScopes) {
        const mockResponse = {
          status: 200,
          timestamp: "2025-06-16T10:12:49.347Z",
          data: { scope },
        };

        mockFetch.mockResolvedValueOnce({
          ok: true,
          status: 200,
          headers: new Map(),
          json: () => Promise.resolve(mockResponse),
        });

        const result = await scopifyContent(validQuery);
        expect(result).toBe(scope);
      }
    });

    it("should handle minimal query parameters", async () => {
      const minimalQuery = {
        category: "event",
      };

      const mockResponse = {
        status: 200,
        timestamp: "2025-06-16T10:12:49.347Z",
        data: {
          scope: "community",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await scopifyContent(minimalQuery);

      expect(result).toBe("community");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          body: JSON.stringify(minimalQuery),
        })
      );
    });
  });

  describe("API error responses", () => {
    it("should return fallback when API returns 400 error", async () => {
      const errorResponse = {
        status: 400,
        error: "Validation Error",
        trace: {
          request: {
            method: "POST",
            url: "/api/scopify",
            headers: {
              "Sheep-Token": mockConfig.token,
              "Content-Type": "application/json",
            },
            body: JSON.stringify(validQuery),
          },
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: "Bad Request",
        headers: new Map(),
        json: () => Promise.resolve(errorResponse),
      });

      const result = await scopifyContent(validQuery);

      expect(result).toBe(FallbackScopification);
    });

    it("should return fallback when API returns 500 error", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: "Internal Server Error",
        headers: new Map(),
        json: () => Promise.resolve({ error: "Internal server error" }),
      });

      const result = await scopifyContent(validQuery);

      expect(result).toBe(FallbackScopification);
    });

    it("should return fallback when network request fails", async () => {
      mockFetch.mockRejectedValueOnce(new Error("Network error"));

      const result = await scopifyContent(validQuery);

      expect(result).toBe(FallbackScopification);
    });
  });

  describe("response parsing errors", () => {
    it("should return fallback when response has invalid JSON", async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.reject(new Error("Invalid JSON")),
      });

      const result = await scopifyContent(validQuery);

      expect(result).toBe(FallbackScopification);
    });

    it("should return fallback when response has invalid scope value", async () => {
      const invalidResponse = {
        status: 200,
        timestamp: "2025-06-16T10:12:49.347Z",
        data: {
          scope: "invalid-scope-value",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(invalidResponse),
      });

      const result = await scopifyContent(validQuery);

      expect(result).toBe(FallbackScopification);
    });

    it("should return fallback when response is missing data.scope", async () => {
      const incompleteResponse = {
        status: 200,
        timestamp: "2025-06-16T10:12:49.347Z",
        data: {},
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(incompleteResponse),
      });

      const result = await scopifyContent(validQuery);

      expect(result).toBe(FallbackScopification);
    });

    it("should return fallback when response is missing data property", async () => {
      const incompleteResponse = {
        status: 200,
        timestamp: "2025-06-16T10:12:49.347Z",
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(incompleteResponse),
      });

      const result = await scopifyContent(validQuery);

      expect(result).toBe(FallbackScopification);
    });
  });

  describe("input validation", () => {
    it("should return fallback when query validation fails", async () => {
      const invalidQuery = {
        category: 123, // Should be string
        occurrence: "invalid-occurrence", // Should be enum value
      };

      const result = await scopifyContent(
        invalidQuery as unknown as ScopifyContentQuery
      );

      expect(result).toBe(FallbackScopification);
      expect(mockFetch).not.toHaveBeenCalled();
    });

    it("should handle empty query object", async () => {
      const emptyQuery = {};

      const mockResponse = {
        status: 200,
        timestamp: "2025-06-16T10:12:49.347Z",
        data: {
          scope: "community",
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(mockResponse),
      });

      const result = await scopifyContent(emptyQuery);

      expect(result).toBe("community");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          body: JSON.stringify(emptyQuery),
        })
      );
    });
  });

  describe("configuration errors", () => {
    it("should return fallback when API configuration is invalid", async () => {
      mockGetClassificationApiConfig.mockImplementation(() => {
        throw new Error("Configuration error");
      });

      const result = await scopifyContent(validQuery);

      expect(result).toBe(FallbackScopification);
      expect(mockFetch).not.toHaveBeenCalled();
    });
  });

  describe("request construction", () => {
    it("should construct correct URL with host", async () => {
      const mockResponse = {
        status: 200,
        timestamp: "2025-06-16T10:12:49.347Z",
        data: { scope: "community" },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(mockResponse),
      });

      await scopifyContent(validQuery);

      expect(mockFetch).toHaveBeenCalledWith(
        new URL("/api/scopify", mockConfig.host),
        expect.any(Object)
      );
    });

    it("should include correct headers", async () => {
      const mockResponse = {
        status: 200,
        timestamp: "2025-06-16T10:12:49.347Z",
        data: { scope: "community" },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(mockResponse),
      });

      await scopifyContent(validQuery);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          method: "POST",
          headers: {
            "Sheep-Token": mockConfig.token,
            Accept: "application/json",
            "Content-Type": "application/json",
          },
        })
      );
    });

    it("should serialize query as JSON in request body", async () => {
      const mockResponse = {
        status: 200,
        timestamp: "2025-06-16T10:12:49.347Z",
        data: { scope: "community" },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        headers: new Map(),
        json: () => Promise.resolve(mockResponse),
      });

      const complexQuery = {
        category: "event",
        tags: ["music", "concert", "outdoor"],
        timespan: "3hours",
        occurrence: "recurring" as const,
      };

      await scopifyContent(complexQuery);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(URL),
        expect.objectContaining({
          body: JSON.stringify(complexQuery),
        })
      );
    });
  });
});
