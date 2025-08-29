import { RuralEventScopeSchema } from "@/packages/rural-event-types/src/rural-event-scope.types";
import { z } from "zod";

/**
 * Schema for the scopify by content query.
 * Ensures that the summary is a string and not empty.
 * Keep all information loose and optional.
 */
export const ScopifyContentQuerySchema = z.object({
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  timespan: z.string().optional().describe("Use 15min, 3days or similar."),
  occurrence: z
    .enum(["once", "recurring", "opening-hours"])
    .or(z.string())
    .optional(),
});
export type ScopifyContentQuery = z.infer<typeof ScopifyContentQuerySchema>;

export const ScopifyContentResponseSchema = RuralEventScopeSchema;
export type ScopifyContentResponse = z.infer<
  typeof ScopifyContentResponseSchema
>;

/**
 * Fallback values, if scopification API is not available.
 */
export const FallbackScopification: ScopifyContentResponse = "community";
