import { z } from "zod";

// Queue task
export const Task = z.object({
  queueTaskId: z.string(),
});
export type Task = z.infer<typeof Task>;

export const EventQueueTask = Task.extend({
  eventID: z.string(),
});
export type EventQueueTask = z.infer<typeof EventQueueTask>;

export const CalendarQueueTask = Task.extend({
  calendarID: z.string(),
});
export type CalendarQueueTask = z.infer<typeof CalendarQueueTask>;
