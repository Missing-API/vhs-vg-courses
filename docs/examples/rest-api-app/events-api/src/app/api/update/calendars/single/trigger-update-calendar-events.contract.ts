import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { ApiErrorSchema } from "@/src/rest/error.schema";
import { TriggerUpdateCalendarEventsSuccessfulSchema } from "./trigger-update-calendar-events.schema";
import { CalendarEventsQuerySchema } from "@/src/clients/calendar-api/types/calendar-events-query.types";

const c = initContract();

export const TriggerUpdateCalendarEventsContract = c.router({
  "trigger-update-calendar": {
    method: "POST",
    path: "/api/update/calendars/single",
    body: CalendarEventsQuerySchema,
    responses: {
      200: TriggerUpdateCalendarEventsSuccessfulSchema,
      400: ApiErrorSchema,
      500: ApiErrorSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary: "Trigger an update of events for a specific calendar",
    description:
      "Triggers an update of events for a specific calendar from the calendar-api, which will update all events in the calendar.",
  },
});
