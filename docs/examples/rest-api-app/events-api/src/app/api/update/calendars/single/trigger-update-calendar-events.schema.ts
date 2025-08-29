import { EventQueueTask } from "@/src/queue/queue.types";
import { ResultsSchema } from "@/src/rest/results.schema";
import { z } from "zod";

export const TriggerUpdateCalendarEventsSuccessfulSchema = ResultsSchema.extend(
  {
    data: z.array(EventQueueTask),
  }
);

export type TriggerUpdateCalendarEventsSuccessfulSchema = z.infer<
  typeof TriggerUpdateCalendarEventsSuccessfulSchema
>;
