import { initContract } from "@ts-rest/core";
import { z } from "zod";
import {
  AddSchemaSuccessfulSchema,
  DeleteSchemaSuccessfulSchema,
  GetSchemaSuccessfulSchema,
} from "./schema.schema";
import { ApiErrorSchema } from "@/src/rest/error.schema";

const c = initContract();

export const SchemaContract = c.router({
  "get-schema": {
    method: "GET",
    path: "/api/schema",
    responses: {
      200: GetSchemaSuccessfulSchema,
      404: ApiErrorSchema,
      500: ApiErrorSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary: "Get the schema for the events collection",
  },
  "create-schema": {
    method: "POST",
    path: "/api/schema",
    body: z.object({}).optional(), // Empty object since schema is predefined
    responses: {
      200: AddSchemaSuccessfulSchema,
      409: ApiErrorSchema,
      500: ApiErrorSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary: "Create the schema for the events collection",
  },
  "delete-schema": {
    method: "DELETE",
    path: "/api/schema",
    responses: {
      200: DeleteSchemaSuccessfulSchema,
      404: ApiErrorSchema,
      500: ApiErrorSchema,
    },
    headers: z.object({
      "Sheep-Token": z.string().optional(),
    }),
    summary: "Delete the schema including all data of the events collection",
  },
});
