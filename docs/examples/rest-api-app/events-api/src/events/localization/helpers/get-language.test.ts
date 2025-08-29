import { describe, expect, it } from "vitest";

import { getLanguage } from "./get-language";
import { Language } from "../types/languages.types";
import {
  LocalizationObject,
  LocalizationString,
} from "../types/localization.types";

describe("getLanguage", () => {
  describe("with LocalizationString", () => {
    it("should extract language from string format", () => {
      const testCases: { input: LocalizationString; expected: Language }[] = [
        { input: "de_DE", expected: "de" },
        { input: "en_PL", expected: "en" },
        { input: "pl_DE", expected: "pl" },
        { input: "uk_PL", expected: "uk" },
        { input: "ru_DE", expected: "ru" },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(getLanguage(input)).toBe(expected);
      });
    });
  });

  describe("with LocalizationObject", () => {
    it("should return language from object format", () => {
      const testCases: { input: LocalizationObject; expected: Language }[] = [
        { input: { language: "de", country: "DE" }, expected: "de" },
        { input: { language: "en", country: "PL" }, expected: "en" },
        { input: { language: "pl", country: "DE" }, expected: "pl" },
        { input: { language: "uk", country: "PL" }, expected: "uk" },
        { input: { language: "ru", country: "DE" }, expected: "ru" },
      ];

      testCases.forEach(({ input, expected }) => {
        expect(getLanguage(input)).toBe(expected);
      });
    });
  });
});
