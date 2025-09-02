import { z } from "zod";
import { ResultSchema } from "@/rest/result.schema";
import { CourseSchema, DetailsMetaSchema } from "@/clients/vhs-website/courses.schema";
import { LocationSchema } from "@/clients/vhs-website/locations.schema";

/**
 * Courses list data structure for a specific location
 */
export const CoursesDataSchema = z.object({
  location: LocationSchema,
  courses: z.array(CourseSchema),
  totalCount: z.number(),
  detailsMeta: DetailsMetaSchema.optional(),
  warnings: z.array(z.string()).optional(),
});
export type CoursesData = z.infer<typeof CoursesDataSchema>;

/**
 * Successful courses response following the example apps pattern
 */
export const CoursesSuccessfulSchema = ResultSchema.extend({
  data: CoursesDataSchema,
});
export type CoursesSuccessful = z.infer<typeof CoursesSuccessfulSchema>;