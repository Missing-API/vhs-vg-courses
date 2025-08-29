import { describe, expect, test } from "vitest";

import { mapScope, defaultScope } from "./map-scope";
import { scopeSynonyms } from "./scope-synonyms";

describe("mapScope", () => {
  test("returns default scope when input is undefined", () => {
    expect(mapScope(undefined)).toBe(defaultScope);
  });

  test("returns default scope when input is null", () => {
    expect(mapScope(null)).toBe(defaultScope);
  });

  test("returns default scope when input is empty string", () => {
    expect(mapScope("")).toBe(defaultScope);
  });

  test("maps community scope synonyms correctly", () => {
    scopeSynonyms.community.forEach((synonym) => {
      expect(mapScope(synonym)).toBe("community");
      expect(mapScope(synonym.toLowerCase())).toBe("community");
      expect(mapScope(synonym.toUpperCase())).toBe("community");
    });
  });

  test("maps nearby scope synonyms correctly", () => {
    scopeSynonyms.nearby.forEach((synonym) => {
      expect(mapScope(synonym)).toBe("nearby");
      expect(mapScope(synonym.toLowerCase())).toBe("nearby");
      expect(mapScope(synonym.toUpperCase())).toBe("nearby");
    });
  });

  test("maps region scope synonyms correctly", () => {
    scopeSynonyms.region.forEach((synonym) => {
      expect(mapScope(synonym)).toBe("region");
      expect(mapScope(synonym.toLowerCase())).toBe("region");
      expect(mapScope(synonym.toUpperCase())).toBe("region");
    });
  });

  test("maps municipality scope synonyms correctly", () => {
    scopeSynonyms.municipality.forEach((synonym) => {
      expect(mapScope(synonym)).toBe("municipality");
      expect(mapScope(synonym.toLowerCase())).toBe("municipality");
      expect(mapScope(synonym.toUpperCase())).toBe("municipality");
    });
  });

  test("maps county scope synonyms correctly", () => {
    scopeSynonyms.county.forEach((synonym) => {
      expect(mapScope(synonym)).toBe("county");
      expect(mapScope(synonym.toLowerCase())).toBe("county");
      expect(mapScope(synonym.toUpperCase())).toBe("county");
    });
  });

  test("maps state scope synonyms correctly", () => {
    scopeSynonyms.state.forEach((synonym) => {
      expect(mapScope(synonym)).toBe("state");
      expect(mapScope(synonym.toLowerCase())).toBe("state");
      expect(mapScope(synonym.toUpperCase())).toBe("state");
    });
  });

  test("maps country scope synonyms correctly", () => {
    scopeSynonyms.country.forEach((synonym) => {
      expect(mapScope(synonym)).toBe("country");
      expect(mapScope(synonym.toLowerCase())).toBe("country");
      expect(mapScope(synonym.toUpperCase())).toBe("country");
    });
  });

  test("returns default scope for unknown input", () => {
    expect(mapScope("unknown")).toBe(defaultScope);
    expect(mapScope("invalid")).toBe(defaultScope);
    expect(mapScope("randomtext")).toBe(defaultScope);
  });
});
