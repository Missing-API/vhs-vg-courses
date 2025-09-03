import { z } from "zod";

export const CourseSessionSchema = z.object({
  date: z.string(), // ISO 8601 date (YYYY-MM-DD)
  start: z.string(), // ISO 8601 datetime
  end: z.string(), // ISO 8601 datetime
  room: z.string().optional(),
});

export type CourseSession = z.infer<typeof CourseSessionSchema>;

export const CourseDetailsSchema = z.object({
  id: z.string(),
  title: z.string(),
  description: z.string(),
  start: z.string(), // ISO 8601 datetime
  duration: z.string(),
  numberOfDates: z.number(),
  schedule: z.array(CourseSessionSchema),
  location: z.object({
    name: z.string(),
    room: z.string().optional(),
    address: z.string(),
  }),
  /**
   * HTML summary combining description, start info, and detail link
   */
  summary: z.string().describe("HTML summary combining description, start info, and detail link"),
});

export type CourseDetails = z.infer<typeof CourseDetailsSchema>;