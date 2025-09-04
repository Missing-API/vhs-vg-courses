import { z } from "zod";
import { ISO8601Schema } from "@/rest/iso8601.types";

// Base schema with common course fields
export const BaseCourseSchema = z.object({
  id: z.string(), // course number if available
  title: z.string(),
  link: z.string(), // absolute URL to course detail
  start: ISO8601Schema, // ISO8601 start datetime
  end: ISO8601Schema.optional(), // ISO8601 end datetime - calculated from schedule duration
  available: z.boolean(), // derived from "x von y"
  bookable: z.boolean(),
  // Structured content for data-text-mapper (populated when details are fetched)
  description: z.string().optional(), // Clean text description with timing/booking info
  url: z.string().optional(), // Course detail URL (same as link)
  tags: z.array(z.string()).optional(), // Tags like ["Bildung", "Volkshochschule"]
  scopes: z.array(z.string()).optional(), // Scopes like ["Region"]
  image: z.string().optional(), // Image URL if any
});

export const CourseSchema = BaseCourseSchema.extend({
  location: z.string().default(""), // optimized postal address for Google Maps (or raw cell text if details not requested)
  // Optional HTML summary from course details; included when details=true
  summary: z.string().describe("HTML summary content").optional(),
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