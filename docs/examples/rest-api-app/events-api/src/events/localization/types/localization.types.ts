/**
 * Locale
 */

import {
  CountrySchema,
  LanguageSchema,
} from "@/src/events/localization/types/languages.types";
import { z } from "zod";

// Localization as object
export const LocalizationObjectSchema = z.object({
  language: LanguageSchema,
  country: CountrySchema,
});
export type LocalizationObject = z.infer<typeof LocalizationObjectSchema>;

// Localization as string
export const LocalizationStringSchema = z.enum([
  "de_DE",
  "de_PL",
  "en_DE",
  "en_PL",
  "pl_DE",
  "pl_PL",
  "uk_DE",
  "uk_PL",
  "ru_DE",
  "ru_PL",
]);
export type LocalizationString = z.infer<typeof LocalizationStringSchema>;
