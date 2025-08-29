import { initContract } from "@ts-rest/core";
import { GetEventsSuccessfulSchema } from "./get-events.schema";
import { ErrorSchema } from "@/rest/error.schema";
import { z } from "zod";
import { ISO8601Schema } from "@/rest/iso8601.types";

const c = initContract();

export const GetEventsContract = c.router({
  "get-events": {
    method: "GET",
    path: `/api/calendars/:id/events`,
    query: z.object({
      // default / fallback today 0am
      timeMin: ISO8601Schema.optional().describe("Default value is today 0am."),
      timeMax: ISO8601Schema.optional().describe(
        "Default value is 90 days in the furture."
      ),
      updatedMin: ISO8601Schema.optional(),
    }),

    responses: {
      200: GetEventsSuccessfulSchema,
      400: ErrorSchema,
      404: ErrorSchema,
      500: ErrorSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary: "Get calendar events.",
    description: "Get events from a google calendar.",
  },
});
