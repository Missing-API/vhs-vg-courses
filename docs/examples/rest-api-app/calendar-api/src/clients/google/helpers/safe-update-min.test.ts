import { safeUpdateMin } from "./safe-update-min";
import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";
import * as nowModule from "./now";

// Mock the now function
vi.mock("./now", () => ({
  now: vi.fn(),
}));

describe("safeUpdateMin", () => {
  // Store the original Date
  const OriginalDate = global.Date;
  let mockDate: Date;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock date to 2023-01-15T12:00:00Z
    mockDate = new OriginalDate(2023, 0, 15, 12, 0, 0);

    // Mock the now function to return our fixed date
    vi.mocked(nowModule.now).mockReturnValue(mockDate);

    // Mock Date constructor for when direct Date objects are created
    global.Date = class extends OriginalDate {
      constructor(...args: (string | number)[]) {
        super();
        if (args.length === 0) {
          return mockDate;
        }
        // Handle ISO string dates properly
        if (args.length === 1 && typeof args[0] === "string") {
          return new OriginalDate(args[0]);
        }
        return new OriginalDate(...args);
      }

      static now() {
        return mockDate.getTime();
      }
    } as typeof Date;
  });

  afterEach(() => {
    // Restore original Date
    global.Date = OriginalDate;
  });

  it("should return null when input is null or undefined", () => {
    expect(safeUpdateMin(null)).toBeNull();
    expect(safeUpdateMin(undefined)).toBeNull();
    expect(safeUpdateMin("")).toBeNull();
  });

  it("should return null for invalid date formats", () => {
    expect(safeUpdateMin("invalid-date")).toBeNull();
    expect(safeUpdateMin("2023/01/01")).toBeNull(); // This format doesn't match ISO8601 requirements
  });

  it("should adjust dates that are too far in the past", () => {
    // Date more than 25 days in the past (2022-12-10)
    const oldDate = "2022-12-10T12:00:00Z";

    // Expected result: 2022-12-21 (15 Jan - 25 days)
    const expectedDate = new OriginalDate(2022, 11, 21, 12, 0, 0).toISOString();

    expect(safeUpdateMin(oldDate)).toBe(expectedDate);
  });

  it("should return the original date if within range", () => {
    // Date within 25 days (10 days ago)
    const recentDate = "2023-01-05T12:00:00.000Z";

    expect(safeUpdateMin(recentDate)).toBe(recentDate);
  });

  it("should return the original date if in the future", () => {
    // Future date
    const futureDate = "2023-01-25T12:00:00.000Z";

    expect(safeUpdateMin(futureDate)).toBe(futureDate);
  });
});
