import { initContract } from "@ts-rest/core";

import { ApiErrorSchema } from "@/src/rest/error.schema";
import { z } from "zod";
import {
  DeleteDateSchema,
  DeleteEventsSuccessfulSchema,
} from "./delete-event.schema";

const c = initContract();

export const DeleteEventContract = c.router({
  "delete-events": {
    method: "DELETE",
    path: "/api/events",
    query: z.object({
      before: DeleteDateSchema,
    }),
    body: z.any().optional(),
    responses: {
      200: DeleteEventsSuccessfulSchema,
      500: ApiErrorSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary: "Delete old events",
    description: "Deletes all events before a certain date/time.",
  },
});
