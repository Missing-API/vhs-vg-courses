import { describe, it, expect, vi, beforeEach } from "vitest";
import { getGeoLocation } from "./get-geo-location";

// Mock the config module
vi.mock("./helpers/config", () => ({
  getGeoApiConfig: () => ({
    host: "https://geo.api-v2.schafe-vorm-fenster.de",
    token: "test-token",
  }),
}));

// Mock the logger
vi.mock("../../logging/logger", () => ({
  getLogger: () => ({
    trace: vi.fn(),
    debug: vi.fn(),
    warn: vi.fn(),
    error: vi.fn(),
  }),
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe("getGeoLocation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("should successfully fetch geo location data for valid geonameId", async () => {
    const mockApiResponse = {
      status: 200,
      message: "Success",
      timestamp: "2025-01-07T10:00:00Z",
      data: {
        geonameId: 2838887,
        name: "Düsseldorf",
        geo: {
          point: {
            lat: 51.2217,
            lng: 6.77616,
          },
        },
        hierarchy: {
          country: {
            geonameId: 2921044,
            name: "Federal Republic of Germany",
            ISO3166: "DE",
          },
          state: {
            geonameId: 2861876,
            name: "North Rhine-Westphalia",
            ISO3166: "NW",
          },
          county: {
            geonameId: 3247449,
            name: "Regierungsbezirk Düsseldorf",
          },
          municipality: {
            geonameId: 6295630,
            name: "Düsseldorf",
            zip: "40210",
            wikidataId: "Q1718",
          },
          community: {
            geonameId: 6255148,
            name: "Düsseldorf Community",
            wikidataId: "Q1718",
          },
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockApiResponse,
    } as Response);

    const result = await getGeoLocation(2838887);

    expect(result).toEqual(mockApiResponse.data);
    expect(fetch).toHaveBeenCalledWith(expect.any(URL), {
      method: "GET",
      headers: {
        "Sheep-Token": "test-token",
        Accept: "application/json",
      },
    });

    // Verify the URL is correct
    const callArgs = mockFetch.mock.calls[0];
    const url = callArgs[0] as URL;
    expect(url.toString()).toBe(
      "https://geo.api-v2.schafe-vorm-fenster.de/api/community/2838887"
    );
  });

  it("should handle 500 error response from geo API", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      json: async () => ({
        status: 500,
        error: "Internal Server Error",
        message: "Error fetching data from geonames API",
        timestamp: "2025-06-16T12:27:30.330Z",
      }),
    } as Response);

    const result = await getGeoLocation(2838887);
    expect(result).toBeNull();
  });

  it("should handle 400 error response for invalid geonameId format", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 400,
      json: async () => ({
        status: 400,
        error: "Bad Request",
        message:
          "Invalid ID format. Expected numeric ID, but received: invalid-id",
        timestamp: "2025-06-16T12:27:30.330Z",
      }),
    } as Response);

    const result = await getGeoLocation(2838887);
    expect(result).toBeNull();
  });

  it("should handle network errors", async () => {
    mockFetch.mockRejectedValueOnce(new Error("Network error"));

    const result = await getGeoLocation(2838887);
    expect(result).toBeNull();
  });

  it("should handle response without data field", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => ({
        status: 200,
        message: "Success",
        timestamp: "2025-01-07T10:00:00Z",
        // Missing data field
      }),
    } as Response);

    const result = await getGeoLocation(2838887);
    expect(result).toBeNull();
  });

  it("should handle response with missing geo coordinates", async () => {
    const mockApiResponse = {
      status: 200,
      message: "Success",
      timestamp: "2025-01-07T10:00:00Z",
      data: {
        geonameId: 2838887,
        name: "Düsseldorf",
        hierarchy: {
          country: {
            geonameId: 2921044,
            name: "Federal Republic of Germany",
            ISO3166: "DE",
          },
        },
        // Missing geo field
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockApiResponse,
    } as Response);

    const result = await getGeoLocation(2838887);

    expect(result).toBeDefined();
    expect(result!.geo).toBeUndefined();
    expect(result!.geonameId).toBe(2838887);
  });

  it("should handle response with incomplete hierarchy data", async () => {
    const mockApiResponse = {
      status: 200,
      message: "Success",
      timestamp: "2025-01-07T10:00:00Z",
      data: {
        geonameId: 2838887,
        name: "Düsseldorf",
        geo: {
          point: {
            lat: 51.2217,
            lng: 6.77616,
          },
        },
        hierarchy: {
          country: {
            geonameId: 2921044,
            name: "Federal Republic of Germany",
            ISO3166: "DE",
          },
          // Missing other hierarchy levels
        },
      },
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => mockApiResponse,
    } as Response);

    const result = await getGeoLocation(2838887);

    expect(result).toBeDefined();
    expect(result!.geonameId).toBe(2838887);
    expect(result!.geo).toEqual({
      point: {
        lat: 51.2217,
        lng: 6.77616,
      },
    });
    expect(result!.hierarchy?.country).toBeDefined();
  });

  it("should handle different geonameId values", async () => {
    const testCases = [
      {
        geonameId: 1,
        name: "Test Location 1",
        geo: { point: { lat: 10.0, lng: 20.0 } },
      },
    ];

    for (const testCase of testCases) {
      const mockApiResponse = {
        status: 200,
        message: "Success",
        timestamp: "2025-01-07T10:00:00Z",
        data: {
          geonameId: testCase.geonameId,
          name: testCase.name,
          geo: testCase.geo,
          hierarchy: {},
        },
      };

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockApiResponse,
      } as Response);

      const result = await getGeoLocation(testCase.geonameId);

      expect(result).toBeDefined();
      expect(result!.geonameId).toBe(testCase.geonameId);
      expect(result!.name).toBe(testCase.name);
      expect(fetch).toHaveBeenCalledWith(expect.any(URL), {
        method: "GET",
        headers: {
          "Sheep-Token": "test-token",
          Accept: "application/json",
        },
      });

      // Verify the URL is correct
      const callArgs = mockFetch.mock.calls[mockFetch.mock.calls.length - 1];
      const url = callArgs[0] as URL;
      expect(url.toString()).toBe(
        `https://geo.api-v2.schafe-vorm-fenster.de/api/community/${testCase.geonameId}`
      );
    }
  });

  it("should handle empty response data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      status: 200,
      json: async () => null,
    } as Response);

    const result = await getGeoLocation(2838887);
    expect(result).toBeNull();
  });
});
