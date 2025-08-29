import { describe, expect, test } from "vitest";

import { isValidGeonameId } from "./is-valid-geoname-id";

describe("should check if a string is a valid geoname id", () => {
  test("return true for valid geoname id", () => {
    expect(isValidGeonameId("geoname.12345")).toBeTruthy();
  });

  test("return false for invalid geoname id", () => {
    expect(isValidGeonameId("geoname-12345")).toBeFalsy();
    expect(isValidGeonameId("geoname-")).toBeFalsy();
  });

  test("return false for missing string", () => {
    expect(isValidGeonameId("")).toBeFalsy();
  });
});
