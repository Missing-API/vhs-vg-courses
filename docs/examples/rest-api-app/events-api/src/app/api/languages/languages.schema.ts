import { ResultSchema } from "@/src/rest/result.schema";
import { z } from "zod";

/**
 * Language list
 */
export const LanguageListSchema = z.object({
  de: z.string().optional(),
  en: z.string().optional(),
  pl: z.string().optional(),
  uk: z.string().optional(),
  ru: z.string().optional(),
});
export type LanguageList = z.infer<typeof LanguageListSchema>;

export const LanguagesSuccessfulSchema = ResultSchema.extend({
  data: LanguageListSchema,
});
