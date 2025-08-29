import { z } from "zod";

export const ErrorSchema = z.object({
  status: z.number().min(400).max(599),
  error: z.string(),
  trace: z.any().optional(),
});

export type ErrorSchema = z.infer<typeof ErrorSchema>;
