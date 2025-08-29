import {
  CountrySchema,
  LanguageSchema,
} from "@/src/events/localization/types/languages.types";
import { ISO8601Schema } from "@/src/rest/iso8601.types";
import { z } from "zod";

export const SearchEventsQuerySchema = z.object({
  after: ISO8601Schema.optional().describe(
    "Datetime in ISO8601 format to filter for events occurring after this point in time"
  ),
  before: ISO8601Schema.optional().describe(
    "Datetime in ISO8601 format to filter for events occurring before this point in time"
  ),
  language: LanguageSchema.optional()
    .default("de")
    .describe("Language to receive events in"),
  country: CountrySchema.optional()
    .default("DE")
    .describe("Country to show location name for"),
});
