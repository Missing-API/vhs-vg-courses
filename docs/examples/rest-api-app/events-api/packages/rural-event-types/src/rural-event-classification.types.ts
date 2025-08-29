import { z } from "zod";
import { RuralEventCategoryIdSchema } from "./rural-event-category.types";

export const RuralEventClassificationSchema = z.object({
  category: RuralEventCategoryIdSchema,
  tags: z.array(z.string()).optional(),
});

export type RuralEventClassification = z.infer<
  typeof RuralEventClassificationSchema
>;
