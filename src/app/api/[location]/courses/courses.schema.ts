import { z } from "zod";
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