import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { getLocations } from "./get-locations";

// Mock the individual functions since get-locations imports them
vi.mock("./extract-locations-from-search-form", () => ({
  extractLocationsFromSearchForm: vi.fn()
}));

vi.mock("./extract-location-details", () => ({
  extractLocationDetails: vi.fn()
}));

import { extractLocationsFromSearchForm } from "./extract-locations-from-search-form";
import { extractLocationDetails } from "./extract-location-details";

describe("getLocations", () => {
  beforeEach(() => {
    // Reset all mocks before each test
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  it("should combine data from search form and location details", async () => {
    // Mock the individual functions
    const mockFormLocations = [
      { id: "anklam", name: "Anklam", count: 12 },
      { id: "greifswald", name: "Greifswald", count: 200 },
      { id: "pasewalk", name: "Pasewalk", count: 30 }
    ];

    const mockLocationDetails = {
      anklam: { address: "17389 Anklam" },
      greifswald: { address: "17489 Greifswald" },
      pasewalk: { address: "17309 Pasewalk" }
    };

    (extractLocationsFromSearchForm as any).mockResolvedValue(mockFormLocations);
    (extractLocationDetails as any).mockResolvedValue(mockLocationDetails);

    const result = await getLocations();

    expect(result.locations).toHaveLength(3);
    expect(Array.isArray(result.locations)).toBe(true);
  });

  it("should handle missing address data gracefully", async () => {
    const mockFormLocations = [
      { id: "anklam", name: "Anklam", count: 12 },
      { id: "newlocation", name: "New Location", count: 5 }
    ];

    const mockLocationDetails = {
      anklam: { address: "17389 Anklam" }
      // newlocation is missing from details
    };

    (extractLocationsFromSearchForm as any).mockResolvedValue(mockFormLocations);
    (extractLocationDetails as any).mockResolvedValue(mockLocationDetails);

    const result = await getLocations();

    const anklam = result.locations.find(l => l.id === "anklam");
    const newLocation = result.locations.find(l => l.id === "newlocation");

    expect(anklam?.address).toBe("17389 Anklam");
    expect(newLocation?.address).toBe(""); // Should default to empty string
  });

  it("should return proper LocationsResponse schema", async () => {
    const mockFormLocations = [
      { id: "greifswald", name: "Greifswald", count: 200 }
    ];

    const mockLocationDetails = {
      greifswald: { address: "17489 Greifswald" }
    };

    (extractLocationsFromSearchForm as any).mockResolvedValue(mockFormLocations);
    (extractLocationDetails as any).mockResolvedValue(mockLocationDetails);

    const result = await getLocations();

    expect(result).toHaveProperty("locations");
    
    const location = result.locations[0];
    expect(location).toHaveProperty("id");
    expect(location).toHaveProperty("name");
    expect(location).toHaveProperty("address");
    
    expect(location.id).toBe("greifswald");
    expect(location.name).toBe("Greifswald");
    expect(location.address).toBe("17489 Greifswald");
  });

  it("should call both extraction functions", async () => {
    (extractLocationsFromSearchForm as any).mockResolvedValue([]);
    (extractLocationDetails as any).mockResolvedValue({});

    await getLocations();

    expect(extractLocationsFromSearchForm).toHaveBeenCalledTimes(1);
    expect(extractLocationDetails).toHaveBeenCalledTimes(1);
  });
});
