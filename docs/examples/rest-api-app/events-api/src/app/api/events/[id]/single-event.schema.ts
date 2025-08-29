import { ResultSchema } from "@/src/rest/result.schema";
import { z } from "zod";

export const GetEventSuccessfulSchema = ResultSchema.extend({
  data: z.any().optional(), // TODO: Add typing
});

export type GetEventSuccessfulSchema = z.infer<typeof GetEventSuccessfulSchema>;

export const DeleteEventSuccessfulSchema = ResultSchema.extend({
  data: z.any().optional(),
});

export type DeleteEventSuccessfulSchema = z.infer<
  typeof DeleteEventSuccessfulSchema
>;
