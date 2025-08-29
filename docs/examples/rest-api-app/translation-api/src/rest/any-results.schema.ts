import { z } from "zod";
import { ResultsSchema } from "./results.schema";

export const AnyResultsSchema = ResultsSchema.extend({
  data: z.array(z.any()),
});
export type AnyResults = z.infer<typeof AnyResultsSchema>;
