import { describe, it, expect } from "vitest";
import { Timezone } from "./timezone.types";

describe("Timezone schema", () => {
  it("should accept valid IANA timezone formats", () => {
    const validTimezones = [
      "Europe/Berlin",
      "America/New_York",
      "Asia/Tokyo",
      "Africa/Cairo",
      "Pacific/Auckland",
      "Australia/Sydney",
      "Europe/London",
      "America/Los_Angeles",
    ];

    validTimezones.forEach((timezone) => {
      expect(() => Timezone.parse(timezone)).not.toThrow();
    });
  });

  it("should accept UTC as a valid time standard", () => {
    expect(() => Timezone.parse("UTC")).not.toThrow();
  });

  it("should reject invalid timezone formats", () => {
    const invalidTimezones = [
      "", // Empty string
      "Europe", // Missing slash and second part
      "/Berlin", // Missing first part
      "Europe/", // Missing second part
      "Europe//Berlin", // Double slash
      "Europe/Berlin/Extra", // Extra part
      "123/456", // Numbers not allowed
      "Europe/Ber-lin", // Hyphen not allowed
      "Eur@pe/Berlin", // Special characters not allowed
      " Europe/Berlin", // Leading space
      "Europe/Berlin ", // Trailing space
    ];

    invalidTimezones.forEach((timezone) => {
      expect(() => Timezone.parse(timezone)).toThrow();
    });
  });

  it("should match the correct pattern for IANA timezones", () => {
    // Test the underlying regex pattern
    const pattern = /^[A-Za-z_]+\/[A-Za-z_]+$/;

    expect("Europe/Berlin").toMatch(pattern);
    expect("Europe_East/Berlin_West").toMatch(pattern);
    expect("Invalid-Timezone").not.toMatch(pattern);
  });
});
