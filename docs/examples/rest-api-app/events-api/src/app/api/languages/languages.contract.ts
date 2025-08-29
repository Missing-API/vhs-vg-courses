import { initContract } from "@ts-rest/core";
import { LanguagesSuccessfulSchema } from "./languages.schema";
import { z } from "zod";
import { LanguageSchema } from "@/src/events/localization/types/languages.types";

const c = initContract();

export const LanguagesContract = c.router({
  getLanguages: {
    method: "GET",
    path: "/api/languages",
    query: z.object({
      language: LanguageSchema.optional()
        .default("de")
        .describe("Language code to filter labels."),
    }),
    responses: {
      200: LanguagesSuccessfulSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary: "Returns a list of supported languages.",
    description: "Returns a list of supported languages.",
  },
});
