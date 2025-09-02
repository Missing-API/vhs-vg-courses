import { describe, it, expect } from "vitest";
import { optimizeLocationAddress } from "./optimize-location-address";

describe("optimizeLocationAddress", () => {
  it("maps VHS Anklam Markt 7", () => {
    const s = "Raum 1 - VHS Anklam, Markt 7";
    expect(optimizeLocationAddress(s)).toBe(
      "Volkshochschule Vorpommern-Greifswald, Markt 7, 17389 Anklam"
    );
  });

  it("maps VHS Anklam Demminer Str. 15", () => {
    const s = "VHS in Anklam, Saal Demminer Str. 15";
    expect(optimizeLocationAddress(s)).toBe(
      "Volkshochschule Vorpommern-Greifswald, Demminer Str. 15, 17389 Anklam"
    );
  });

  it("maps Runge-Gymnasium Wolgast", () => {
    const s = "Raum 2 • Runge-Gymnasium Wolgast • Haupteingang";
    expect(optimizeLocationAddress(s)).toBe(
      "Runge-Gymnasium, Schulstraße 1, 17438 Wolgast"
    );
  });

  it("maps Turnhalle St. Otto (Zinnowitz)", () => {
    expect(optimizeLocationAddress("Turnhalle St. Otto Zinnowitz")).toBe(
      "Turnhalle, St. Otto Zinnowitz, Dr.-Wachsmann-Str. 29, 17454 Zinnowitz"
    );
    expect(optimizeLocationAddress("St. Otto")).toBe(
      "Turnhalle, St. Otto Zinnowitz, Dr.-Wachsmann-Str. 29, 17454 Zinnowitz"
    );
  });

  it("maps EDPG Löcknitz", () => {
    expect(optimizeLocationAddress("Löcknitz, EDPG, Cafeteria")).toBe(
      "Europaschule Deutsch - Polnisches Gymnasium, Friedrich-Engels-Straße 5-6, 17321 Löcknitz"
    );
    expect(optimizeLocationAddress("EDPG Veranstaltung in Löcknitz")).toBe(
      "Europaschule Deutsch - Polnisches Gymnasium, Friedrich-Engels-Straße 5-6, 17321 Löcknitz"
    );
  });

  it("maps VHS Pasewalk", () => {
    expect(optimizeLocationAddress("VHS in Pasewalk, Raum 107")).toBe(
      "Volkshochschule Vorpommern-Greifswald, Gemeindewiesenweg 8, 17309 Pasewalk"
    );
  });

  it("maps VHS Greifswald", () => {
    expect(optimizeLocationAddress("VHS in Greifswald, Raum 3.3")).toBe(
      "Volkshochschule Vorpommern-Greifswald, Martin-Luther-Str. 7a, 17489 Greifswald"
    );
  });

  it("maps Gartenanlage Erholung Pasewalk", () => {
    expect(optimizeLocationAddress('Gartenanlage "Erholung" Pasewalk')).toBe(
      "Kleingartenverein Erholung e.V., 17309 Pasewalk"
    );
  });

  it("maps Multiples Haus Meiersberg", () => {
    expect(optimizeLocationAddress("Multiples Haus Meiersberg")).toBe(
      "Multiples Haus Meiersberg, Dorfstraße 21 a, 17375 Meiersberg"
    );
  });

  it("maps Haus an der Schleuse, Torgelow", () => {
    expect(optimizeLocationAddress("Haus an der Schleuse, Torgelow")).toBe(
      "Haus an der Schleuse, Schleusenstraße 5b, 17358 Torgelow"
    );
  });

  it("maps Torgelow, Haus an der Schleuse", () => {
    expect(optimizeLocationAddress("Torgelow, Haus an der Schleuse")).toBe(
      "Haus an der Schleuse, Schleusenstraße 5b, 17358 Torgelow"
    );
  });

  it("maps Ueckermünde, Regionalschule, Gymnastikhalle", () => {
    expect(optimizeLocationAddress('Ueckermünde, Regionalschule, Gymnastikhalle')).toBe(
      'Gymnastikhalle, Regionale Schule "Ehm Welk", Goethestraße 3, 17373 Ueckermünde'
    );
  });

  it('maps "Alte Schule" Ferdinandshof', () => {
    expect(optimizeLocationAddress('Ferdinandshof "Alte Schule"')).toBe(
      '"Alte Schule" Ferdinandshof, Schulstraße 4, 17379 Ferdinandshof'
    );
  });

  it('maps Grambin, Dorfstraße 65, Gymnastikraum', () => {
    expect(optimizeLocationAddress('Grambin, Dorfstraße 65, Gymnastikraum')).toBe(
      'Higashi Dojo, Dorfstraße 65, 17375 Grambin'
    );
  });

  it('maps Gemeinschaftsraum "Alte Feuerwehr", Badestraße 23-24, Greifswald', () => {
    expect(optimizeLocationAddress('Gemeinschaftsraum "Alte Feuerwehr", Badestraße 23-24, Greifswald')).toBe(
      'Alte Feuerwehr, Baderstraße 23, 17489 Greifswald'
    );
  });

  it("returns empty string for unmatched", () => {
    expect(optimizeLocationAddress("Unbekannter Ort 123")).toBe("");
  });

  it("uses contextual fallback for generic VHS", () => {
    expect(optimizeLocationAddress("VHS, Raum 12", { locationId: "pasewalk" })).toBe(
      "Volkshochschule Vorpommern-Greifswald, Gemeindewiesenweg 8, 17309 Pasewalk"
    );
    expect(optimizeLocationAddress("VHS, Raum 12", { locationId: "greifswald" })).toBe(
      "Volkshochschule Vorpommern-Greifswald, Martin-Luther-Str. 7a, 17489 Greifswald"
    );
    expect(optimizeLocationAddress("VHS", { locationId: "anklam" })).toBe(
      "Volkshochschule Vorpommern-Greifswald, Markt 7, 17389 Anklam"
    );
  });
});