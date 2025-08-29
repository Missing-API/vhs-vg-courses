import { createNextHandler } from "@ts-rest/serverless/next";
import { getLogger } from "@/src/logging/logger";
import { ApiErrorSchema } from "@/src/rest/error.schema";
import { handleZodError } from "@/src/rest/zod-error-handler";
import { ApiUpdate } from "@/src/logging/loggerApps.config";
import { TriggerUpdateAllContract } from "./trigger-update-all-calendars.contract";
import {
  Calendar,
  getCalendars,
} from "@/src/clients/calendar-api/get-calendars";
import { addCalendarToQueue } from "@/src/queue/add-calendar-to-queue";
import { getCalendarEventsQuery } from "@/src/clients/calendar-api/helpers/calendar-events-query";
import { CalendarEventsQueryParamsSchema } from "@/src/clients/calendar-api/types/calendar-events-query.types";
import { TriggerUpdateAllCalendarsSuccessfulSchema } from "./trigger-update-all-calendars.schema";

const log = getLogger(ApiUpdate.all);

const handler = createNextHandler(
  TriggerUpdateAllContract,
  {
    "trigger-update-all": async ({ body }) => {
      log.debug({ ...body }, "Trigger update for all calendars");

      // TODO: maybe not needed? zod throws an error anyways
      try {
        CalendarEventsQueryParamsSchema.parse(body);
      } catch (error) {
        log.error({ error }, "Error parsing request body");
        throw new Error("Error parsing request body");
      }

      try {
        // fetch all calendars from calendar-api
        const calendars: Calendar[] = await getCalendars();

        // push all calendars to the queue, ensure the body is properly typed
        // this is done in parallel to speed up the process.
        // as result, we get an array of tasks incl. the task id.
        const tasks = await Promise.all(
          calendars.map(async (calendar) => {
            return await addCalendarToQueue(
              getCalendarEventsQuery({
                id: calendar.id,
                ...body,
              })
            );
          })
        );

        const timestamp = new Date().toISOString();

        return {
          status: 200,
          body: {
            status: 200,
            results: tasks.length,
            timestamp: timestamp,
            data: tasks,
          } as TriggerUpdateAllCalendarsSuccessfulSchema,
        };
      } catch (error) {
        log.error({ error }, "Error adding events");

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
    responseValidation: false, // TODO: enable response validation
    handlerType: "app-router",
    errorHandler: handleZodError,
  }
);

export { handler as POST };
