import { describe, it, expect } from "vitest";
import { localizedEvent } from "./localized-event";
import { IndexedEvent } from "../types/indexed-event.types";
import { LocalizedEvent } from "../types/localized-event.types";
import { Language, Country } from "../localization/types/languages.types";

describe("localizedEvent", () => {
  // Create a mock IndexedEvent for testing
  const mockIndexedEvent: IndexedEvent = {
    id: "event-123",
    "org.id": "org-456",
    "summary.de": "Zusammenfassung auf Deutsch",
    "summary.en": "Summary in English",
    "summary.pl": "Podsumowanie po polsku",
    "summary.uk": "Підсумок українською",
    "summary.ru": "Резюме на русском",
    "description.de": "Beschreibung auf Deutsch",
    "description.en": "Description in English",
    "description.pl": "Opis po polsku",
    "description.uk": "Опис українською",
    "description.ru": "Описание на русском",
    link: "https://example.com/event",
    image: "https://example.com/image.jpg",
    "image.exists": true,
    document: "https://example.com/document.pdf",
    "document.exists": true,
    categories: ["category1", "category2"],
    tags: ["tag1", "tag2"],
    start: 1672531200000, // January 1, 2023 00:00:00 UTC
    end: 1672617600000, // January 2, 2023 00:00:00 UTC
    allday: true,
    occurrence: "once",
    "series.id": "series-789",
    "location.raw": "Example Location",
    "location.name.de": "Beispielort",
    "location.localname.de": "Lokaler Beispielort",
    "location.address": "Example Street 123, Example City",
    "location.geopoint": { lat: 52.52, lon: 13.405 },
    scope: "region",
    "community.id": "123456",
    "community.geopoint": { lat: 52.52, lon: 13.405 },
    "community.name.de": "Beispielgemeinde",
    "municipality.id": "789012",
    "municipality.name.de": "Beispielstadt",
    "county.id": "345678",
    "county.name.de": "Beispielkreis",
    "state.id": "901234",
    "state.name.de": "Beispielland",
    "country.id": "DE",
    "country.name.de": "Deutschland",
    "organizer.id": "organizer-123",
    "organizer.name": "Example Organizer",
    "calendar.id": "calendar-123",
    "calendar.name": "Example Calendar",
    created: 1672444800000, // December 31, 2022 00:00:00 UTC
    changed: 1672444800000, // December 31, 2022 00:00:00 UTC
    deleted: 0,
  };

  it("should localize an event in German", () => {
    const result = localizedEvent(
      mockIndexedEvent,
      "de" as Language,
      "DE" as Country
    );

    // Test that the result has the correct structure
    expect(result).toHaveProperty("id", "event-123");
    expect(result).toHaveProperty("summary", "Zusammenfassung auf Deutsch");
    expect(result).toHaveProperty("description", "Beschreibung auf Deutsch");

    // Test that location properties use German names (as per current implementation)
    expect(result).toHaveProperty("location.name", "Beispielort");
    expect(result).toHaveProperty("location.localname", "Lokaler Beispielort");
    expect(result).toHaveProperty("community.name", "Beispielgemeinde");
    expect(result).toHaveProperty("municipality.name", "Beispielstadt");
    expect(result).toHaveProperty("county.name", "Beispielkreis");
    expect(result).toHaveProperty("state.name", "Beispielland");
    expect(result).toHaveProperty("country.name", "Deutschland");

    // Test other properties are copied correctly
    expect(result).toHaveProperty("link", "https://example.com/event");
    expect(result).toHaveProperty("image", "https://example.com/image.jpg");
    expect(result).toHaveProperty("image.exists", true);
    expect(result).toHaveProperty(
      "document",
      "https://example.com/document.pdf"
    );
    expect(result).toHaveProperty("document.exists", true);
    expect(result).toHaveProperty("categories", ["category1", "category2"]);
    expect(result).toHaveProperty("tags", ["tag1", "tag2"]);
    expect(result).toHaveProperty("start", 1672531200000);
    expect(result).toHaveProperty("end", 1672617600000);
    expect(result).toHaveProperty("allday", true);
    expect(result).toHaveProperty("occurrence", "once");
    expect(result).toHaveProperty("series.id", "series-789");
  });

  it("should localize an event in English", () => {
    const result = localizedEvent(
      mockIndexedEvent,
      "en" as Language,
      "DE" as Country
    );

    // Check that the language-specific fields are properly localized
    expect(result).toHaveProperty("summary", "Summary in English");
    expect(result).toHaveProperty("description", "Description in English");

    // Location names should still be in German (per current implementation)
    expect(result).toHaveProperty("location.name", "Beispielort");
    expect(result).toHaveProperty("community.name", "Beispielgemeinde");
  });

  it("should localize an event in Polish", () => {
    const result = localizedEvent(
      mockIndexedEvent,
      "pl" as Language,
      "PL" as Country
    );

    // Check that the language-specific fields are properly localized
    expect(result).toHaveProperty("summary", "Podsumowanie po polsku");
    expect(result).toHaveProperty("description", "Opis po polsku");

    // Location names should still be in German (per current implementation)
    expect(result).toHaveProperty("location.name", "Beispielort");
  });

  it("should handle different country settings (though currently unused)", () => {
    // Currently the country parameter doesn't affect the results, but testing for future compatibility
    const result = localizedEvent(
      mockIndexedEvent,
      "de" as Language,
      "PL" as Country
    );

    // Results should be the same regardless of country parameter with current implementation
    expect(result).toHaveProperty("summary", "Zusammenfassung auf Deutsch");
    expect(result).toHaveProperty("location.name", "Beispielort");
  });

  it("should correctly map all properties from IndexedEvent to LocalizedEvent", () => {
    const result = localizedEvent(
      mockIndexedEvent,
      "de" as Language,
      "DE" as Country
    );

    // Test that result contains all expected properties of LocalizedEvent
    const expectedKeys: (keyof LocalizedEvent)[] = [
      "id",
      "summary",
      "description",
      "link",
      "image",
      "image.exists",
      "document",
      "document.exists",
      "categories",
      "tags",
      "start",
      "end",
      "allday",
      "occurrence",
      "series.id",
      "location.raw",
      "location.name",
      "location.localname",
      "location.address",
      "location.geopoint",
      "scope",
      "community.id",
      "community.geopoint",
      "community.name",
      "municipality.id",
      "municipality.name",
      "county.id",
      "county.name",
      "state.id",
      "state.name",
      "country.id",
      "country.name",
      "organizer.id",
      "organizer.name",
      "calendar.id",
      "calendar.name",
      "created",
      "changed",
      "deleted",
    ];

    expectedKeys.forEach((key) => {
      expect(result).toHaveProperty(key);
    });
  });
});
