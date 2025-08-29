import { createNextHandler } from "@ts-rest/serverless/next";
import { getLogger } from "@/src/logging/logger";
import { ApiErrorSchema } from "@/src/rest/error.schema";
import { handleZodError } from "@/src/rest/zod-error-handler";
import { ApiUpdate } from "@/src/logging/loggerApps.config";
import { TriggerUpdateCalendarEventsContract } from "./trigger-update-calendar-events.contract";
import { getCalendarEvents } from "@/src/clients/calendar-api/get-calendar-events";
import { addEventToQueue } from "@/src/queue/add-event-to-queue";
import { TriggerUpdateCalendarEventsSuccessfulSchema } from "./trigger-update-calendar-events.schema";
import {
  CalendarEventsQuery,
  CalendarEventsQuerySchema,
} from "@/src/clients/calendar-api/types/calendar-events-query.types";
import { GoogleEventSchema } from "@/src/events/types/google-event.types";

const log = getLogger(ApiUpdate.calendar);

const handler = createNextHandler(
  TriggerUpdateCalendarEventsContract,
  {
    "trigger-update-calendar": async ({ body }) => {
      log.debug(
        { ...body },
        "Trigger update calendar events for a specific calendar"
      );

      // validate request body
      try {
        CalendarEventsQuerySchema.parse(body);
      } catch (error) {
        log.error({ error }, "Error parsing post request body");
        throw new Error("Error parsing post request body", { cause: error });
      }

      // build query and double check all params
      try {
        // get all events for the given calendar
        const events: object[] = await getCalendarEvents(
          body as CalendarEventsQuery
        );
        log.debug({ events }, "Fetched events from calendar-api");

        // push all events to the queue
        // this is done in parallel to speed up the process.
        // as result, we get an array of tasks incl. the task id.
        const tasks = await Promise.all(
          events.map(async (event) => {
            return await addEventToQueue(GoogleEventSchema.parse(event));
          })
        );
        log.debug({ tasks }, "Added events as tasks to queue");

        const timestamp = new Date().toISOString();

        return {
          status: 200,
          body: {
            status: 200,
            results: tasks.length,
            timestamp: timestamp,
            data: tasks,
          } as TriggerUpdateCalendarEventsSuccessfulSchema,
        };
      } catch (error) {
        log.error({ error }, "Error adding events to queue");

        return {
          status: 500,
          body: {
            status: 500,
            error: error ?? "Internal Server Error",
          } as ApiErrorSchema,
        };
      }
    },
  },
  {
    jsonQuery: true,
    responseValidation: true,
    handlerType: "app-router",
    errorHandler: handleZodError,
  }
);

export { handler as POST };
