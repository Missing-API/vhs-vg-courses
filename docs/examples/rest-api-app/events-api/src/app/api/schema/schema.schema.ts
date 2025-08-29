import { ResultSchema } from "@/src/rest/result.schema";
import { z } from "zod";

export const AddSchemaSuccessfulSchema = ResultSchema.extend({
  data: z.any().optional(),
});

export const DeleteSchemaSuccessfulSchema = ResultSchema.extend({
  data: z.any().optional(),
});

export const GetSchemaSuccessfulSchema = ResultSchema.extend({
  data: z.any().optional(),
});

export type AddSchemaSuccessfulSchema = z.infer<
  typeof AddSchemaSuccessfulSchema
>;
export type DeleteSchemaSuccessfulSchema = z.infer<
  typeof DeleteSchemaSuccessfulSchema
>;
export type GetSchemaSuccessfulSchema = z.infer<
  typeof GetSchemaSuccessfulSchema
>;
