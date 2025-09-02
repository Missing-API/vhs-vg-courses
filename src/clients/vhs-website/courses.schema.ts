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
  /**
   * Optional full detail payload for this course when requested via API.
   * Backward compatible - not present unless explicitly included.
   */
  details: CourseDetailsSchema.optional(),
});
export type Course = z.infer<typeof CourseSchema>;

export const CourseDetailsMetaSchema = z.object({
  requested: z.number().nonnegative(),
  succeeded: z.number().nonnegative(),
  failed: z.number().nonnegative(),
  successRate: z.number().min(0).max(1),
  durationMs: z.number().nonnegative().optional(),
  cacheHits: z.number().nonnegative().optional(),
  warnings: z.array(z.string()).optional(),
});

export const CoursesResponseSchema = z.object({
  courses: z.array(CourseSchema),
  count: z.number(),
  expectedCount: z.number().optional(),
  warnings: z.array(z.string()).optional(),
  /**
   * Metadata about details fetching when includeDetails=true
   */
  detailsMeta: CourseDetailsMetaSchema.optional(),
});
export type CoursesResponse = z.infer<typeof CoursesResponseSchema>;

export const ErrorResponseSchema = z.object({
  error: z.string(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;