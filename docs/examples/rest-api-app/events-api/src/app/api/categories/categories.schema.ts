import { RuralEventCategory } from "@/packages/rural-event-types/src/rural-event-category.types";
import { ResultSchema } from "@/src/rest/result.schema";
import { z } from "zod";

export const CategoriesSuccessfulSchema = ResultSchema.extend({
  data: z.array(RuralEventCategory),
});
