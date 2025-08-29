import { describe, expect, it } from "vitest";

import { getCommunityFilter } from "./get-community-filter";

describe("getCommunityFilter", () => {
  it("should return correct filter string for valid geoname id", () => {
    const filter = getCommunityFilter("geoname.2838887");
    expect(filter).toBe("community.id:geoname.2838887");
  });

  it("should throw error for empty community id", () => {
    expect(() => {
      getCommunityFilter("");
    }).toThrow();
  });

  it("should throw error for invalid geoname id format", () => {
    expect(() => {
      getCommunityFilter("abc");
    }).toThrow();

    expect(() => {
      getCommunityFilter("geoname.");
    }).toThrow();

    expect(() => {
      getCommunityFilter("geoname.abc");
    }).toThrow();
  });
});
