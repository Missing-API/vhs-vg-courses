import { z } from "zod";
import { ResultSchema } from "./result.schema";

export const AnyResultSchema = ResultSchema.extend({
  data: z.any(),
});
export type AnyResult = z.infer<typeof AnyResultSchema>;
