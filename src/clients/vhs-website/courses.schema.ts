import { z } from "zod";

export const CourseSchema = z.object({
  id: z.string(), // prefer course number
  title: z.string(),
  detailUrl: z.string(), // absolute URL to course detail
  dateText: z.string(), // raw date/time text from list (e.g., "Mo. 08.09.2025, 13.00 Uhr")
  locationText: z.string(), // as shown in table
  belegungText: z.string(), // e.g., "4 von 6"
  courseNumber: z.string(),
  bookable: z.boolean(),
});
export type Course = z.infer<typeof CourseSchema>;

export const CoursesResponseSchema = z.object({
  courses: z.array(CourseSchema),
  count: z.number(),
  expectedCount: z.number().optional(),
  warnings: z.array(z.string()).optional(),
});
export type CoursesResponse = z.infer<typeof CoursesResponseSchema>;

export const ErrorResponseSchema = z.object({
  error: z.string(),
});
export type ErrorResponse = z.infer<typeof ErrorResponseSchema>;