import { z } from "zod";
import { BaseCourseSchema } from "./courses.schema";

export const CourseSessionSchema = z.object({
  date: z.string(), // ISO 8601 date (YYYY-MM-DD)
  start: z.string(), // ISO 8601 datetime
  end: z.string(), // ISO 8601 datetime
});

export type CourseSession = z.infer<typeof CourseSessionSchema>;

export const CourseDetailsSchema = BaseCourseSchema.extend({
  // Additional fields specific to course details
  duration: z.string(),
  numberOfDates: z.number(),
  schedule: z.array(CourseSessionSchema),
  location: z.object({
    name: z.string(),
    room: z.string().optional(),
    address: z.string(),
  }), // Override the basic location string with detailed location object
});

export type CourseDetails = z.infer<typeof CourseDetailsSchema>;