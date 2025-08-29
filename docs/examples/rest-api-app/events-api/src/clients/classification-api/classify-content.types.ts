import { RuralEventClassificationSchema } from "@/packages/rural-event-types/src/rural-event-classification.types";
import { z } from "zod";

/**
 * Schema for the classify by content query.
 * Ensures that the summary is a string and not empty.
 */
export const ClassifyContentQuerySchema = z.object({
  summary: z.string(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  occurrence: z.string().optional(),
});
export type ClassifyContentQuery = z.infer<typeof ClassifyContentQuerySchema>;

export const ClassifyContentResponseSchema = RuralEventClassificationSchema;
export type ClassifyContentResponse = z.infer<
  typeof ClassifyContentResponseSchema
>;

/**
 * Fallback values, if classification API is not available.
 */
export const FallbackClassification: ClassifyContentResponse = {
  category: "unknown",
  tags: [],
};
