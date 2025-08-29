import { ResultSchema } from "@/src/rest/result.schema";
import { z } from "zod";

export const AddEventSuccessfulSchema = ResultSchema.extend({
  data: z.any().optional(), // TODO: Add IndexedEvent as type here
});

export type AddEventSuccessfulSchema = z.infer<typeof AddEventSuccessfulSchema>;
