import { z } from "zod";

export const OccurrenceSchema = z.enum([
  "once",
  "recurring",
  "series",
  "openinghours",
  "schedule",
]);

export type Occurrence = z.infer<typeof OccurrenceSchema>;
