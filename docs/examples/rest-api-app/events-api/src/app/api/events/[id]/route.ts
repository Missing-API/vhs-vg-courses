import { createNextHandler } from "@ts-rest/serverless/next";
import { getLogger } from "@/src/logging/logger";
import { handleZodError } from "@/src/rest/zod-error-handler";

import { HttpError } from "http-errors";
import { ApiError, ApiErrorSchema } from "@/src/rest/error.schema";
import {
  DeleteEventSuccessfulSchema,
  GetEventSuccessfulSchema,
} from "./single-event.schema";
import { SingleEventContract } from "./single-event.contract";
import { ApiEvents } from "@/src/logging/loggerApps.config";
import { deleteEvent } from "@/src/clients/typesense/delete-event";
import { getEvent } from "@/src/clients/typesense/get-event";

const log = getLogger(ApiEvents.post);

const handler = createNextHandler(
  SingleEventContract,
  {
    "get-event": async ({ params }) => {
      try {
        const event = await getEvent(params.uuid);
        return {
          status: 200,
          body: {
            status: 200,
            timestamp: new Date().toISOString(),
            data: event,
          } as GetEventSuccessfulSchema,
        };
      } catch (error: unknown) {
        const httpCode = error instanceof HttpError ? error.status : 500;
        log.error(
          { status: httpCode, message: (error as Error).message },
          "retrieving an event failed"
        );

        return {
          status: (httpCode as 404) || 500,
          body: {
            status: (httpCode as 404) || 500,
            error: (error as Error).message || "Internal Server Error",
          } as ApiErrorSchema,
        };
      }
    },
    "delete-event": async ({ params }) => {
      try {
        const result = await deleteEvent(params.uuid);

        log.debug({ result }, "event deleted - tried at least");
        return {
          status: 200,
          body: {
            status: 200,
            timestamp: new Date().toISOString(),
            message: "Event deleted successfully",
            data: { id: params.uuid },
          } as DeleteEventSuccessfulSchema,
        };
      } catch (error: unknown) {
        const httpCode = error instanceof HttpError ? error.status : 500;
        log.error(
          { status: httpCode, message: (error as Error).message },
          "deleting an event failed"
        );

        return {
          status:
            error instanceof ApiError && error.status === 404
              ? error.status
              : 500,
          body: {
            status: error instanceof ApiError ? error.status : 500,
            error:
              error instanceof Error
                ? error.message
                : "Error creating or updating event",
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

export { handler as DELETE, handler as GET };
