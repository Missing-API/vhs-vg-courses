import { getLogger } from "@/src/logging/logger";
import { ClientTypesense } from "@/src/logging/loggerApps.config";
import { getTypesenseApiConfig } from "./helpers/config";
import eventsSchema from "@/src/events/schema/typesense.schema";
import { ApiError } from "@/src/rest/error.schema";

const log = getLogger(ClientTypesense["retrieve-schema"]);

export const retrieveSchema = async (): Promise<object> => {
  const { host, token } = getTypesenseApiConfig();
  const url: string = new URL(
    `/collections/${eventsSchema.name}`,
    host
  ).toString();

  // Try to retrieve the schema
  const response = await fetch(url, {
    method: "GET",
    headers: {
      "X-TYPESENSE-API-KEY": token,
    },
  });

  // Happy path
  if (response.ok && response.status === 200) {
    log.debug("Schema retrieved successfully");
    const data = await response.json();
    return data;
  }

  // 404 - Collection not found
  if (response.status === 404) {
    log.warn("Schema not found");
    throw new ApiError(404, "Schema not found");
  }

  // Everything else is an error
  log.error(
    {
      error: { status: response.status, message: response.statusText },
    },
    "Could not retrieve schema"
  );

  throw new ApiError(
    response.status,
    `Error retrieving schema: ${response.statusText}`
  );
};
