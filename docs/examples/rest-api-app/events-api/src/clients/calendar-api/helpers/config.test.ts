import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getCalendarApiHost, getCalendarApiToken } from "./config";
import * as baseConfigModule from "../../helpers/config";
import { ClientCalendar } from "@/src/logging/loggerApps.config";

// Mock the base config functions
vi.mock("../../helpers/config", () => ({
  getApiHost: vi.fn(),
  getApiToken: vi.fn(),
}));

describe("Calendar API Configuration Helpers", () => {
  const mockHost = "https://calendar-api.example.com";
  const mockToken = "cal-123456789";

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

  describe("getCalendarApiHost", () => {
    it("should call getApiHost with correct parameters", () => {
      const result = getCalendarApiHost();

      expect(baseConfigModule.getApiHost).toHaveBeenCalledWith(
        "SVF_CALENDARAPI_HOST",
        ClientCalendar.config
      );
      expect(result).toBe(mockHost);
    });

    it("should propagate errors from getApiHost", () => {
      const mockError = new Error("Host not configured");
      vi.mocked(baseConfigModule.getApiHost).mockImplementation(() => {
        throw mockError;
      });

      expect(() => getCalendarApiHost()).toThrow(mockError);
    });
  });

  describe("getCalendarApiToken", () => {
    it("should call getApiToken with correct parameters", () => {
      const result = getCalendarApiToken();

      expect(baseConfigModule.getApiToken).toHaveBeenCalledWith(
        "SVF_CALENDARAPI_TOKEN",
        ClientCalendar.config
      );
      expect(result).toBe(mockToken);
    });

    it("should propagate errors from getApiToken", () => {
      const mockError = new Error("Token not configured");
      vi.mocked(baseConfigModule.getApiToken).mockImplementation(() => {
        throw mockError;
      });

      expect(() => getCalendarApiToken()).toThrow(mockError);
    });
  });
});
