import { z } from "zod";
import { OkaySchema } from "./okay.schema";

export const ResultSchema = OkaySchema.extend({
  timestamp: z
    .string()
    .transform((val) => new Date(val).toISOString()),
});
export type ResultSchema = z.infer&lt;typeof ResultSchema&gt;;