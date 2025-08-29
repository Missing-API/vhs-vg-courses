import { z } from "zod";

export const OkaySchema = z.object({
  status: z.number().min(200).max(299),
  message: z.string().optional(),
});
export type OkaySchema = z.infer&lt;typeof OkaySchema&gt;;