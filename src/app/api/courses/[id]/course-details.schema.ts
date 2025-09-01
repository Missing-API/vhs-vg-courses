import { z } from "zod";
import { ResultSchema } from "@/rest/result.schema";
import { CourseDetailsSchema } from "@/clients/vhs-website/course-details.schema";

/**
 * Course details data structure
 */
export const CourseDetailsDataSchema = CourseDetailsSchema;
export type CourseDetailsData = z.infer<typeof CourseDetailsDataSchema>;

/**
 * Successful course details response following the example apps pattern
 */
export const CourseDetailsSuccessfulSchema = ResultSchema.extend({
  data: CourseDetailsDataSchema,
});
export type CourseDetailsSuccessful = z.infer<typeof CourseDetailsSuccessfulSchema>;