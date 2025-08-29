import { z } from "zod";
import { ResultSchema } from "@/src/rest/result.schema";

// Supported languages configuration
export const SupportedLanguages = z.enum(["de", "en", "pl", "uk", "ru"]);
export type SupportedLanguagesType = z.infer<typeof SupportedLanguages>;
// add "auto" as extra option
export const SupportedLanguagesParameterSchema = SupportedLanguages.or(z.literal("auto"));
export type SupportedLanguagesParameter = z.infer<typeof SupportedLanguagesParameterSchema>;

// Translation request schema
export const TranslationRequestSchema = z.object({
    content: z.any().nonoptional().describe("Prefer to have content to be translated here, can be any JSON structure"),
    language: SupportedLanguagesParameterSchema.optional().describe("Given language of the content to be translated"),
});
export type TranslationRequest = z.infer<typeof TranslationRequestSchema>;



export const TranslatedContentSchema = z.object().extend({
   language: SupportedLanguages,
   original: z.boolean().describe("Indicates if this is the original content or a translation").default(false),
   content: z.any().describe("Translated content for the specified language"),
});

// Translation result data schema
export const TranslationDataSchema = z.array(TranslatedContentSchema).describe("Array of translated content for each supported language");
export type TranslationData = z.infer<typeof TranslationDataSchema>;

// Successful translation response schema extending ResultSchema
export const TranslationSuccessfulSchema = ResultSchema.extend({
  data: TranslationDataSchema,
});
export type TranslationSuccessful = z.infer<typeof TranslationSuccessfulSchema>;
