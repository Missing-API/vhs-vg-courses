import { describe, expect, test } from "vitest";

import { mapScopes } from "./map-scopes";
import { defaultScope } from "./map-scope";

describe("mapScopes", () => {
  test("returns default scope for empty array", async () => {
    expect(await mapScopes([])).toBe(defaultScope);
  });

  test("returns default scope for undefined input", async () => {
    expect(await mapScopes(undefined as unknown as string[])).toBe(
      defaultScope
    );
  });

  test("maps single scope correctly", async () => {
    expect(await mapScopes(["Ort"])).toBe("community");
    expect(await mapScopes(["Umgebung"])).toBe("nearby");
    expect(await mapScopes(["Region"])).toBe("region");
  });

  test("returns highest range scope when multiple scopes provided", async () => {
    expect(await mapScopes(["Ort", "Region"])).toBe("region");
    expect(await mapScopes(["Umgebung", "Gemeinde", "Landkreis"])).toBe(
      "county"
    );
    expect(await mapScopes(["Stadt", "Bundesland"])).toBe("state");
    expect(await mapScopes(["Ort", "Land"])).toBe("country");
  });

  test("handles mixed case input", async () => {
    expect(await mapScopes(["ort", "REGION"])).toBe("region");
    expect(await mapScopes(["gemeinde", "UMGEBUNG"])).toBe("nearby");
  });

  test("returns default scope for unknown inputs", async () => {
    expect(await mapScopes(["unknown", "invalid"])).toBe(defaultScope);
  });

  test("prioritizes scopes in correct order", async () => {
    const scopes = [
      "Ort",
      "Gemeinde",
      "Region",
      "Landkreis",
      "Bundesland",
      "Land",
    ];
    expect(await mapScopes(scopes)).toBe("country");

    const scopesNoCountry = [
      "Ort",
      "Gemeinde",
      "Region",
      "Landkreis",
      "Bundesland",
    ];
    expect(await mapScopes(scopesNoCountry)).toBe("state");

    const scopesNoState = ["Ort", "Gemeinde", "Region", "Landkreis"];
    expect(await mapScopes(scopesNoState)).toBe("county");
  });
});
