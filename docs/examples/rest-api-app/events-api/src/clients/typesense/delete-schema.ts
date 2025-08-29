import { getLogger } from "@/src/logging/logger";
import { ClientTypesense } from "@/src/logging/loggerApps.config";
import { getTypesenseApiConfig } from "./helpers/config";
import eventsSchema from "@/src/events/schema/typesense.schema";
import { ApiError } from "@/src/rest/error.schema";

const log = getLogger(ClientTypesense["delete-schema"]);

export const deleteSchema = async (): Promise<object> => {
  const { host, token } = getTypesenseApiConfig();
  const url: string = new URL(
    `/collections/${eventsSchema.name}`,
    host
  ).toString();

  // Try to delete the schema
  const response = await fetch(url, {
    method: "DELETE",
    headers: {
      "X-TYPESENSE-API-KEY": token,
    },
  });

  // Happy path
  if (response.ok && response.status === 200) {
    log.debug("Schema deleted successfully");
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
    "Could not delete schema"
  );

  throw new ApiError(
    response.status,
    `Error deleting schema: ${response.statusText}`
  );
};
