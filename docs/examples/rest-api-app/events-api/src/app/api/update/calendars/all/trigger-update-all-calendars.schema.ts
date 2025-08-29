import { Task } from "@/src/queue/queue.types";
import { ResultSchema } from "@/src/rest/result.schema";
import { z } from "zod";

export const TaskList = z.array(Task);

export const TriggerUpdateAllCalendarsSuccessfulSchema = ResultSchema.extend({
  data: TaskList,
});

export type TriggerUpdateAllCalendarsSuccessfulSchema = z.infer<
  typeof TriggerUpdateAllCalendarsSuccessfulSchema
>;
