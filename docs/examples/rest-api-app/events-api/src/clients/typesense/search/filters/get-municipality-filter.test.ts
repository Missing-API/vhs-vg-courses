import { describe, expect, test } from "vitest";

import { getMunicipalityFilter } from "./get-municipality-filter";

describe("should create a municipality filter", () => {
  test("return a municipality filter string", () => {
    const filter: string = getMunicipalityFilter("geoname.12345678");
    expect(filter).toBe(
      "municipality.id: geoname.12345678 && scope: [municipality,nearby,region,county,state,country]"
    );
  });
  test("throws an error on missing or invaid municipality id", () => {
    expect(() => {
      getMunicipalityFilter("");
    }).toThrow();
    expect(() => {
      getMunicipalityFilter("abc");
    }).toThrow();
  });
});
