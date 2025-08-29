import { z } from "zod";
import { ResultsSchema } from "@/src/rest/results.schema";
import { LocalizedEventSchema } from "@/src/events/types/localized-event.types";

export const SearchEventsSuccessfulSchema = ResultsSchema.extend({
  data: z.array(LocalizedEventSchema),
});

export type SearchEventsSuccessfulSchema = z.infer<
  typeof SearchEventsSuccessfulSchema
>;
