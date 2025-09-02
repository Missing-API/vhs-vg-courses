import { z } from "zod";
import { ISO8601Schema } from "@/rest/iso8601.types";
import { CourseDetailsSchema } from "./course-details.schema";

export const CourseSchema = z.object({
  id: z.string(), // course number if available
  title: z.string(),
  detailUrl: z.string(), // absolute URL to course detail
  start: ISO8601Schema, // ISO8601 start datetime
  locationText: z.string(), // as shown in table
  address: z.string().default(""), // optimized postal address for Google Maps
  available: z.boolean(), // derived from "x von y"
  bookable: z.boolean(),
  // Optional full details (included when requested)
  details: CourseDetailsSchema.optional(),
});
export type Course = z.infer<typeof CourseSchema>;

export const CoursesResponseSchema = z.object({
  courses: z.array(CourseSchema),
  count: z.number(),
  expectedCount: z.number().optional(),
  warnings: z.array(z.string()).optional(),
  // Optional metadata about detail fetching
  meta: z
    .object({
      detailsRequested: z.boolean().default(false),
      attempted: z.number().nonnegative().default(0),
      succeeded: z.number().nonnegative().default(0),
      failed: z.number().nonnegative().default(0),
      successRate: z.number().min(0).max(1).default(0),
      cacheHits: z.number().nonnegative().default(0),
      durationMs: z.number().nonnegative().optional(),
      batchSize: z.number().nonnegative().optional(),
      concurrency: z.number().nonnegative().optional(),
      warnings: z.array(z.string()).optional(),
    })
    .optional(),
});
export type CoursesResponse = z.infer<typeof CoursesResponseSchema>;

export const ErrorResponseSchema = z.object({
  error: z.string(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;