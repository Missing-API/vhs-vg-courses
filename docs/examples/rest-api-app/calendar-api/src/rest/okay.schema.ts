import { z } from "zod";

export const OkaySchema = z.object({
  status: z.number().min(200).max(299),
  message: z.string().optional(),
});
