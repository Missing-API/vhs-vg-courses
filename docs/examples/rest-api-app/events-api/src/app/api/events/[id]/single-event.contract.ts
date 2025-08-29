import { initContract } from "@ts-rest/core";
import { ApiErrorSchema } from "@/src/rest/error.schema";
import {
  DeleteEventSuccessfulSchema,
  GetEventSuccessfulSchema,
} from "./single-event.schema";
import { z } from "zod";

const c = initContract();

export const SingleEventContract = c.router({
  "get-event": {
    method: "GET",
    path: "/api/events/:uuid",
    responses: {
      200: GetEventSuccessfulSchema,
      404: ApiErrorSchema,
      500: ApiErrorSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary: "Get a single event",
    description: "Gets a single event by its Uuid.",
  },
  "delete-event": {
    method: "DELETE",
    path: "/api/events/:uuid",
    body: z.any().optional(),
    responses: {
      200: DeleteEventSuccessfulSchema,
      404: ApiErrorSchema,
      500: ApiErrorSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary: "Delete an event",
    description: "Deletes a single event by its Uuid.",
  },
});
