import { initContract } from "@ts-rest/core";
import { CategoriesSuccessfulSchema } from "./categories.schema";
import { z } from "zod";
import { LanguageSchema } from "@/src/events/localization/types/languages.types";
const c = initContract();

export const CategoriesContract = c.router({
  getCategories: {
    method: "GET",
    path: "/api/categories",
    // add query param for "lang" to filter by language
    query: z.object({
      language: LanguageSchema.optional()
        .default("de")
        .describe("Language code to filter labels."),
      examples: z
        .enum(["true", "false"])
        .transform((val) => {
          if (val === "false") {
            return false;
          }
          if (val === "true") {
            return true;
          }
          return true;
        })
        .optional(),
    }),
    responses: {
      200: CategoriesSuccessfulSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary:
      "Returns a list of categories supported by the app incl. all locales.",
    description:
      "Returns a list of categories supported by the app incl. all locales.",
  },
});
