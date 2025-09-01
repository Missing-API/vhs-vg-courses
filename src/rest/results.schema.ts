import { z } from "zod";
import { ResultSchema } from "./result.schema";

export const ResultsSchema = ResultSchema.extend({
  results: z.number(),
});
export type ResultsSchema = z.infer<typeof ResultsSchema>;