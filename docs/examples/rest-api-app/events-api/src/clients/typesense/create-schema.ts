import { getLogger } from "@/src/logging/logger";
import { ClientTypesense } from "@/src/logging/loggerApps.config";
import { getTypesenseApiConfig } from "./helpers/config";
import eventsSchema from "@/src/events/schema/typesense.schema";
import { ApiError } from "@/src/rest/error.schema";

const log = getLogger(ClientTypesense["create-schema"]);

export const createSchema = async (): Promise<object> => {
  const { host, token } = getTypesenseApiConfig();
  const url: string = new URL(`/collections`, host).toString();

  // Try to create the schema
  const response = await fetch(url, {
    method: "POST",
    headers: {
      "X-TYPESENSE-API-KEY": token,
      "Content-Type": "application/json",
    },
    body: JSON.stringify(eventsSchema),
  });

  // Happy path
  if ((response.ok && response.status === 200) || response.status === 201) {
    log.debug("Schema created successfully");
    const data = await response.json();
    return data;
  }

  // 409 - Collection already exists
  if (response.status === 409) {
    log.warn("Schema already exists");
    throw new ApiError(409, "Schema already exists");
  }

  // Everything else is an error
  log.error(
    {
      error: { status: response.status, message: response.statusText },
    },
    "Could not create schema"
  );

  throw new ApiError(
    response.status,
    `Error creating schema: ${response.statusText}`
  );
};
