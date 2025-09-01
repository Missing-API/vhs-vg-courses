import { z } from "zod";

export const CourseSessionSchema = z.object({
  date: z.string(), // ISO 8601 date (YYYY-MM-DD)
  startTime: z.string(), // ISO 8601 datetime
  endTime: z.string(), // ISO 8601 datetime
  location: z.string(),
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
});

export type CourseDetails = z.infer<typeof CourseDetailsSchema>;