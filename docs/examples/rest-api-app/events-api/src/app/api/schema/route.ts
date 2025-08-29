import { createNextHandler } from "@ts-rest/serverless/next";
import { getLogger } from "@/src/logging/logger";
import { ApiSchema } from "@/src/logging/loggerApps.config";
import { SchemaContract } from "./schema.contract";

import {
  AddSchemaSuccessfulSchema,
  DeleteSchemaSuccessfulSchema,
  GetSchemaSuccessfulSchema,
} from "./schema.schema";
import { ApiError, ApiErrorSchema } from "@/src/rest/error.schema";
import { handleZodError } from "@/src/rest/zod-error-handler";
import { retrieveSchema } from "@/src/clients/typesense/retrieve-schema";
import { createSchema } from "@/src/clients/typesense/create-schema";
import { deleteSchema } from "@/src/clients/typesense/delete-schema";

const handler = createNextHandler(
  SchemaContract,
  {
    "get-schema": async () => {
      const log = getLogger(ApiSchema.get);

      try {
        const data = await retrieveSchema();
        log.debug({ data }, "Fetched schema data.");

        return {
          status: 200,
          body: {
            status: 200,
            timestamp: new Date().toISOString(),
            data,
          } as GetSchemaSuccessfulSchema,
        };
      } catch (error: unknown) {
        log.error({ error }, "Error fetching schema.");
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
                : "Could not fetch schema for unknown reason.",
          } as ApiErrorSchema,
        };
      }
    },
    "create-schema": async () => {
      const log = getLogger(ApiSchema.create);

      try {
        const data = await createSchema();
        log.info({ data }, "Created schema data.");

        return {
          status: 200,
          body: {
            status: 200,
            timestamp: new Date().toISOString(),
            data,
          } as AddSchemaSuccessfulSchema,
        };
      } catch (error: unknown) {
        log.error({ error }, "Error creating schema.");
        return {
          status: error instanceof ApiError && error.status === 409 ? 409 : 500,
          body: {
            status: error instanceof ApiError ? error.status : 500,
            error:
              error instanceof Error
                ? error.message
                : "Could not create schema for unknown reason.",
          } as ApiErrorSchema,
        };
      }
    },
    "delete-schema": async () => {
      const log = getLogger(ApiSchema.delete);

      try {
        const data = await deleteSchema();
        log.info({ data }, "Deleted schema data.");

        return {
          status: 200,
          body: {
            status: 200,
            timestamp: new Date().toISOString(),
            data,
          } as DeleteSchemaSuccessfulSchema,
        };
      } catch (error: unknown) {
        log.error({ error }, "Error deleting schema.");
        return {
          status: error instanceof ApiError && error.status === 404 ? 404 : 500,
          body: {
            status: error instanceof ApiError ? error.status : 500,
            error:
              error instanceof Error
                ? error.message
                : "Could not delete schema for unknown reason.",
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

export { handler as GET, handler as POST, handler as DELETE };
