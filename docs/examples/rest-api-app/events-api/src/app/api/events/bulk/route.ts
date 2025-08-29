import { createNextHandler } from "@ts-rest/serverless/next";
import { AddEventsToQueueContract } from "./add-events-to-queue.contract";
import { getLogger } from "@/src/logging/logger";
import {
  GoogleEvent,
  GoogleEventSchema,
} from "@/src/events/types/google-event.types";
import { ApiErrorSchema } from "@/src/rest/error.schema";
import { handleZodError } from "@/src/rest/zod-error-handler";
import { addEventToQueue } from "@/src/queue/add-event-to-queue";
import { AddEventsToQueueSuccessfulSchema } from "./add-events-to-queue.schema";
import { ApiEvents } from "@/src/logging/loggerApps.config";

const log = getLogger(ApiEvents.bulk);

const handler = createNextHandler(
  AddEventsToQueueContract,
  {
    "add-events-to-queue": async ({ body }) => {
      const incomingEvents = body as GoogleEvent[];

      try {
        incomingEvents.forEach((event) => {
          // Validate each event in the array
          GoogleEventSchema.parse(event);
          // Check if the event is a valid Google event
        });
      } catch (error) {
        log.error({ error }, "Error parsing request body");

        throw new Error("Invalid event format", { cause: error });
      }

      try {
        // Send all events to the queue.
        // This is done in parallel to speed up the process.
        // As result, we get an array of tasks incl. the task id.
        const tasks = await Promise.all(
          incomingEvents.map(async (event) => {
            return await addEventToQueue(event);
          })
        );
        const timestamp = new Date().toISOString();
        log.debug(
          { results: incomingEvents.length, timestamp, tasks },
          "Tasks added to queue"
        );
        log.info(
          { results: incomingEvents.length, timestamp },
          "Tasks added to queue"
        );
        return {
          status: 200,
          body: {
            status: 200,
            results: incomingEvents.length,
            timestamp: timestamp,
            data: tasks,
          } as AddEventsToQueueSuccessfulSchema,
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
    responseValidation: true,
    handlerType: "app-router",
    errorHandler: handleZodError,
  }
);

export { handler as POST };
