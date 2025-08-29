import { initContract } from "@ts-rest/core";
import { z } from "zod";
import { ApiErrorSchema } from "@/src/rest/error.schema";
import { TriggerUpdateAllCalendarsSuccessfulSchema } from "./trigger-update-all-calendars.schema";
import { CalendarEventsQueryParamsSchema } from "@/src/clients/calendar-api/types/calendar-events-query.types";

const c = initContract();

export const TriggerUpdateAllContract = c.router({
  "trigger-update-all": {
    method: "POST",
    path: "/api/update/calendars/all",
    body: CalendarEventsQueryParamsSchema,
    responses: {
      200: TriggerUpdateAllCalendarsSuccessfulSchema,
      400: ApiErrorSchema,
      500: ApiErrorSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary:
      "Trigger an update for all calendars to update all new or changed events",
    description:
      "Triggers an update for all calendars, which will add or update all events.",
  },
});
