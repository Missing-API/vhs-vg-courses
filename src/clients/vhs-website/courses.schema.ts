import { z } from "zod";
import { ISO8601Schema } from "@/rest/iso8601.types";
import { CourseDetailsSchema } from "./course-details.schema";

export const CourseSchema = z.object({
  id: z.string(), // course number if available
  title: z.string(),
  detailUrl: z.string(), // absolute URL to course detail
  start: ISO8601Schema, // ISO8601 start datetime
  locationText: z.string(), // as shown in table
  available: z.boolean(), // derived from "x von y"
  bookable: z.boolean(),
  // Optional enriched details
  details: CourseDetailsSchema.optional(),
});
export type Course = z.infer<typeof CourseSchema>;

export const CoursesMetaSchema = z
  .object({
    includeDetails: z.boolean().optional(),
    detailsRequested: z.number().optional(),
    detailsSucceeded: z.number().optional(),
    detailsFailed: z.number().optional(),
    cacheWarmingTriggered: z.boolean().optional(),
  })
  .optional();

export const CoursesResponseSchema = z.object({
  courses: z.array(CourseSchema),
  count: z.number(),
  expectedCount: z.number().optional(),
  warnings: z.array(z.string()).optional(),
  meta: CoursesMetaSchema,
});
export type CoursesResponse = z.infer<typeof CoursesResponseSchema>;

export const ErrorResponseSchema = z.object({
  error: z.string(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;