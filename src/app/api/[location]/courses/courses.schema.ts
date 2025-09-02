import { z } from "zod";
import { ResultsSchema } from "@/rest/results.schema";
import { CourseSchema } from "@/clients/vhs-website/courses.schema";

/**
 * Courses list data structure (array of courses)
 */
export const CoursesDataSchema = z.array(CourseSchema);
export type CoursesData = z.infer<typeof CoursesDataSchema>;

/**
 * Optional details metadata at the API layer
 */
export const CoursesMetaSchema = z
  .object({
    detailsRequested: z.boolean(),
    attempted: z.number(),
    succeeded: z.number(),
    failed: z.number(),
    successRate: z.number(),
    cacheHits: z.number(),
    durationMs: z.number().optional(),
    batchSize: z.number().optional(),
    concurrency: z.number().optional(),
    warnings: z.array(z.string()).optional(),
  })
  .optional();

/**
 * Successful courses response for a collection
 * - Uses ResultsSchema to include top-level results count
 */
export const CoursesSuccessfulSchema = ResultsSchema.extend({
  data: CoursesDataSchema,
  meta: CoursesMetaSchema.optional(),
});
export type CoursesSuccessful = z.infer<typeof CoursesSuccessfulSchema>;
import { ResultsSchema } from "@/rest/results.schema";
import { CourseSchema } from "@/clients/vhs-website/courses.schema";

/**
 * Courses list data structure (array of courses)
 */
export const CoursesDataSchema = z.array(CourseSchema);
export type CoursesData = z.infer<typeof CoursesDataSchema>;

/**
 * Successful courses response for a collection
 * - Uses ResultsSchema to include top-level results count
 */
export const CoursesSuccessfulSchema = ResultsSchema.extend({
  data: CoursesDataSchema,
});
export type CoursesSuccessful = z.infer<typeof CoursesSuccessfulSchema>;