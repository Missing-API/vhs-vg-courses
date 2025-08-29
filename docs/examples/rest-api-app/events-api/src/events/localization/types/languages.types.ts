import { z } from "zod";

/**
 * Language
 */
export const LanguageSchema = z.enum(["de", "en", "pl", "uk", "ru"]);
export type Language = z.infer<typeof LanguageSchema>;

/**
 * Country
 */
export const CountrySchema = z.enum(["DE", "PL"]);
export type Country = z.infer<typeof CountrySchema>;
