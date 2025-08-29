import { describe, expect, test } from "vitest";

import { extractGeonameId } from "./extract-geoname-id";

describe("extractGeonameId", () => {
  test("should extract the numeric ID from a valid geoname ID string", () => {
    expect(extractGeonameId("geoname.2838887")).toBe(2838887);
    expect(extractGeonameId("geoname.123")).toBe(123);
    expect(extractGeonameId("geoname.0")).toBe(0);
  });

  test("should return NaN for invalid geoname ID format", () => {
    expect(Number.isNaN(extractGeonameId("geoname-12345"))).toBe(true);
    expect(Number.isNaN(extractGeonameId("geoname."))).toBe(true);
    expect(Number.isNaN(extractGeonameId("invalid"))).toBe(true);
  });

  test("should return NaN for empty string", () => {
    expect(Number.isNaN(extractGeonameId(""))).toBe(true);
  });
});
