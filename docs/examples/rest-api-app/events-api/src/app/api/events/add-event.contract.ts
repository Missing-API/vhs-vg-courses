import { initContract } from "@ts-rest/core";

import { GoogleEventSchema } from "@/src/events/types/google-event.types";
import { AddEventSuccessfulSchema } from "./add-event.schema";
import { z } from "zod";
import { ApiErrorSchema } from "@/src/rest/error.schema";

const c = initContract();

export const AddEventContract = c.router({
  "add-event": {
    method: "POST",
    path: "/api/events",
    body: GoogleEventSchema,
    responses: {
      200: AddEventSuccessfulSchema,
      400: ApiErrorSchema,
      500: ApiErrorSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary: "Add new event incl. full qualification",
    description: "Accepts a single event payload and processes it immediately.",
  },
});
